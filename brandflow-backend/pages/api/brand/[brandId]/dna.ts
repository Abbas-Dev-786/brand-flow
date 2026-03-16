import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { BrandDNASchema } from '@/lib/schemas'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { brandId } = req.query

  if (!brandId || typeof brandId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid brandId' })
  }

  if (req.method === 'PUT') {
    try {
      const parsedDna = BrandDNASchema.parse(req.body)

      const updatedBrand = await prisma.brand.update({
        where: { id: brandId },
        data: { brandDnaEdited: parsedDna }
      })

      return res.json({
        brandId: updatedBrand.id,
        brandDna: updatedBrand.brandDnaEdited
      })
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  return res.status(405).end()
}
