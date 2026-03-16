import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { CampaignInputSchema, BrandDNASchema } from '@/lib/schemas'
import { generateCampaignPack } from '@/lib/gradient-client'

const prisma = new PrismaClient()

const PostCampaignSchema = z.object({
  brandId: z.string().uuid(),
  campaign: CampaignInputSchema
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId')

  if (!brandId || typeof brandId !== 'string') {
    return NextResponse.json({ error: 'Missing brandId query parameter' }, { status: 400 })
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ campaigns })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { brandId, campaign } = PostCampaignSchema.parse(body)

    // Fetch the brand and its DNA
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const activeDna = BrandDNASchema.parse(brand.brandDnaEdited || brand.brandDnaRaw)

    // Generate the campaign pack from Gradient
    const campaignPack = await generateCampaignPack({
      brandDna: activeDna,
      campaign: campaign
    })

    // Save to Database
    const savedCampaign = await prisma.campaign.create({
      data: {
        brandId,
        goal: campaign.goal,
        offer: campaign.offer,
        audience: campaign.audience,
        channelPrefs: campaign.channelPreferences || [],
        campaignPack: campaignPack
      }
    })

    return NextResponse.json({
      campaignId: savedCampaign.id,
      campaignPack: savedCampaign.campaignPack
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
