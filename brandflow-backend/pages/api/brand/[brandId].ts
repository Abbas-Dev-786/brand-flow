import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { BrandDNASchema } from '@/lib/schemas'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { brandId } = req.query

  if (!brandId || typeof brandId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid brandId' })
  }

  if (req.method === 'GET') {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId }
      })
      if (!brand) return res.status(404).json({ error: 'Brand not found' })

      return res.json({
        brandId: brand.id,
        websiteUrl: brand.websiteUrl,
        kbId: brand.kbId,
        brandDna: brand.brandDnaEdited || brand.brandDnaRaw
      })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).end()
}
