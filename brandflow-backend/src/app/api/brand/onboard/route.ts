import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { generateBrandDNA } from '@/lib/gradient-client'

const prisma = new PrismaClient()
const KB_PREFIX = process.env.BRANDFLOW_KB_PREFIX || 'brandflow_kb_'

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

    // 3. TODO: Create Gradient KB and ingest website content
    // For now, generate kbId
    const kbId = `${KB_PREFIX}${crypto.randomUUID()}`

    // 4. Generate BrandDNA from KB
    const brandDna = await generateBrandDNA(kbId)

    // 5. Save to DB
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
