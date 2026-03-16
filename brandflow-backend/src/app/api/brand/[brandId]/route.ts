import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Next.js 15+ changes params to be a Promise in route handlers.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params

  if (!brandId || typeof brandId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid brandId' }, { status: 400 })
  }

  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    })

    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    return NextResponse.json({
      brandId: brand.id,
      websiteUrl: brand.websiteUrl,
      kbId: brand.kbId,
      brandDna: brand.brandDnaEdited || brand.brandDnaRaw
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
