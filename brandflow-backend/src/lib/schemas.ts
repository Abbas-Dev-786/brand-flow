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
  primaryImagePrompt: z.string(),
  primaryImageUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string()).optional().default([])
})

export type BrandDNA = z.infer<typeof BrandDNASchema>
export type CampaignInput = z.infer<typeof CampaignInputSchema>
export type CampaignPack = z.infer<typeof CampaignPackSchema>

// API response schemas (snake_case from Python)
export const ApiBrandDNASchema = z.object({
  tone: z.array(z.string()),
  target_audience: z.string(),
  values: z.array(z.string()),
  key_messages: z.array(z.string()),
  proof_points: z.array(z.string()),
  visual_style: z.array(z.string()).optional().nullable()
}).transform((data): BrandDNA => ({
  tone: data.tone,
  targetAudience: data.target_audience,
  values: data.values,
  keyMessages: data.key_messages,
  proofPoints: data.proof_points,
  visualStyle: data.visual_style || undefined
}))

export const ApiEmailBlockSchema = z.object({
  subject: z.string(),
  body_text: z.string(),
  body_html: z.string().optional().nullable()
})

export const ApiCampaignPackSchema = z.object({
  brand_dna_used: z.any(), // Not explicitly validating deeply here to simplify
  x_posts: z.array(z.string()),
  linkedin_post: z.string(),
  email: ApiEmailBlockSchema,
  image_prompts: z.array(z.string()),
  primary_image_prompt: z.string(),
  primary_image_url: z.string().url().optional().nullable(),
  image_urls: z.array(z.string()).optional().default([])
}).transform((data): CampaignPack => ({
  brandDnaUsed: ApiBrandDNASchema.parse(data.brand_dna_used),
  xPosts: data.x_posts,
  linkedinPost: data.linkedin_post,
  email: {
    subject: data.email.subject,
    bodyText: data.email.body_text
  },
  imagePrompts: data.image_prompts,
  primaryImagePrompt: data.primary_image_prompt,
  primaryImageUrl: data.primary_image_url || undefined,
  imageUrls: data.image_urls
}))
