import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { BrandDNASchema } from '@/lib/schemas'

const prisma = new PrismaClient()

// Next.js 15+ changes params to be a Promise in route handlers.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params

  if (!brandId || typeof brandId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid brandId' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsedDna = BrandDNASchema.parse(body)

    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: { brandDnaEdited: parsedDna }
    })

    return NextResponse.json({
      brandId: updatedBrand.id,
      brandDna: updatedBrand.brandDnaEdited
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
