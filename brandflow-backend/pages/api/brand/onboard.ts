import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { generateBrandDNA } from '@/lib/gradient-client'
import { BrandDNASchema } from '@/lib/schemas'

const prisma = new PrismaClient()
const KB_PREFIX = process.env.BRANDFLOW_KB_PREFIX || 'brandflow_kb_'

const BrandOnboardSchema = z.object({
  websiteUrl: z.string().url()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { websiteUrl } = BrandOnboardSchema.parse(req.body)

    // 1. Normalize URL
    const url = new URL(websiteUrl)

    // 2. Check if brand exists
    const existing = await prisma.brand.findUnique({
      where: { websiteUrl: url.href }
    })

    if (existing) {
      return res.json({
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

    res.json({
      brandId: brand.id,
      brandDna: brand.brandDnaEdited!
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
