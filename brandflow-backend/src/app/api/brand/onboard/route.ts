import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { generateBrandDNA, ingestWebsite, checkStatus } from '@/lib/gradient-client'

const prisma = new PrismaClient()
const KB_PREFIX = process.env.BRANDFLOW_KB_PREFIX || 'brandflow_kb_'

// Allow this route to run for up to 15 minutes (KB indexing can take ~10 min)
export const maxDuration = 900
export const runtime = 'nodejs'

const BrandOnboardSchema = z.object({
  websiteUrl: z.string().url()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { websiteUrl } = BrandOnboardSchema.parse(body)

    // 1. Normalize URL
    const url = new URL(websiteUrl)

    // 2. Check if brand exists
    const existing = await prisma.brand.findUnique({
      where: { websiteUrl: url.href }
    })

    if (existing) {
      return NextResponse.json({
        brandId: existing.id,
        brandDna: existing.brandDnaEdited || existing.brandDnaRaw
      })
    }

    // 3. Create Gradient KB and ingest website content
    console.log(`[Onboard] Starting ingestion for: ${url.href}`)
    const { kb_id: kbId } = await ingestWebsite(url.href)
    console.log(`[Onboard] Ingestion started. KB ID: ${kbId}`)

    // 4. Poll for indexing completion
    // We poll from the backend to avoid a single long-running HTTP connection
    // that might be dropped by local network or agent timeouts.
    console.log(`[Onboard] Waiting for indexing... (Max 15 minutes)`)
    
    let isIndexed = false
    const maxAttempts = 90 // 15 minutes (90 * 10s)
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const statusData = await checkStatus(kbId)
        
        // Debug indexing job status
        const lastJob = statusData.last_indexing_job
        if (lastJob) {
          const phase = lastJob.phase
          const status = lastJob.status
          console.log(`[Onboard] Polling indexing (${attempt}/${maxAttempts}): Phase=${phase}, Status=${status}`)
          
          if (phase === 'BATCH_JOB_PHASE_SUCCEEDED' || status === 'INDEX_JOB_STATUS_COMPLETED') {
            isIndexed = true
            break
          }
          
          if (phase === 'BATCH_JOB_PHASE_FAILED' || phase === 'BATCH_JOB_PHASE_CANCELED') {
            throw new Error(`Indexing failed with phase: ${phase}`)
          }
        } else {
          console.log(`[Onboard] Polling indexing (${attempt}/${maxAttempts}): No job found yet...`)
        }
      } catch (pollError: any) {
        console.warn(`[Onboard] Polling attempt ${attempt} failed:`, pollError.message)
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    if (!isIndexed) {
      console.warn(`[Onboard] Indexing timed out, proceeding with DNA generation anyway.`)
    }

    // 5. Generate BrandDNA from KB (no internal polling since we already polled)
    console.log(`[Onboard] Generating Brand DNA for KB: ${kbId}`)
    const brandDna = await generateBrandDNA(kbId)
    console.log(`[Onboard] Brand DNA generated successfully`)

    // 6. Save to DB
    const brand = await prisma.brand.create({
      data: {
        websiteUrl: url.href,
        kbId,
        brandDnaRaw: brandDna,
        brandDnaEdited: brandDna
      }
    })

    return NextResponse.json({
      brandId: brand.id,
      brandDna: brand.brandDnaEdited!
    })
  } catch (error: any) {
    console.error(`[Onboard] Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

