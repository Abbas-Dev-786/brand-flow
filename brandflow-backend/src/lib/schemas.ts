import { z } from 'zod'

export const BrandDNASchema = z.object({
  tone: z.array(z.string()),
  targetAudience: z.string(),
  values: z.array(z.string()),
  keyMessages: z.array(z.string()),
  proofPoints: z.array(z.string()),
  visualStyle: z.array(z.string()).optional()
})

export const CampaignInputSchema = z.object({
  goal: z.string(),
  offer: z.string(),
  audience: z.string().optional(),
  channelPreferences: z.array(z.string()).optional()
})

export const EmailBlockSchema = z.object({
  subject: z.string(),
  bodyText: z.string()
})

export const CampaignPackSchema = z.object({
  brandDnaUsed: BrandDNASchema,
  xPosts: z.array(z.string()).length(3),
  linkedinPost: z.string(),
  email: EmailBlockSchema,
  imagePrompts: z.array(z.string()).length(3),
  primaryImagePrompt: z.string()
})

export type BrandDNA = z.infer<typeof BrandDNASchema>
export type CampaignInput = z.infer<typeof CampaignInputSchema>
export type CampaignPack = z.infer<typeof CampaignPackSchema>
