from typing import List, Optional
from pydantic import BaseModel, Field

class BrandDNA(BaseModel):
    """Structured representation of a brand's DNA extracted from their knowledge base."""
    tone: List[str] = Field(
        default_factory=list,
        description='e.g., ["friendly", "confident", "helpful"]'
    )
    target_audience: str = Field(
        default="",
        description="A concise description of the target audience."
    )
    values: List[str] = Field(
        default_factory=list,
        description="Core brand values or principles."
    )
    key_messages: List[str] = Field(
        default_factory=list,
        description="The primary messages the brand conveys."
    )
    proof_points: List[str] = Field(
        default_factory=list,
        description='Evidence backing claims, e.g., testimonials, metrics, social proof.'
    )
    visual_style: Optional[List[str]] = Field(
        default_factory=list,
        description='Optional hints for colors, mood, or imagery style.'
    )

class CampaignInput(BaseModel):
    """Input describing a specific campaign."""
    goal: str = Field(
        description='e.g., "Launch 20% off for new users for 2 weeks"'
    )
    offer: str = Field(
        description='e.g., "20% off any plan for first month"'
    )
    audience: Optional[str] = Field(
        default=None,
        description="An optional override for the target audience."
    )
    channel_preferences: Optional[List[str]] = Field(
        default_factory=list,
        description='Optional, e.g., ["x", "linkedin", "email"]'
    )

class EmailCopy(BaseModel):
    """The generated email draft."""
    subject: str = Field(description="A compelling subject line.")
    body_text: str = Field(
        description="The plain-text body with intro, offer details, CTA, and closing."
    )
    body_html: Optional[str] = Field(
        default=None,
        description="Optional HTML formatting of the email body."
    )

class CopyBlock(BaseModel):
    """The set of generated copy for various channels."""
    x_posts: List[str] = Field(
        description="Three variants of X/Twitter posts, each under ~280 characters.",
        min_length=3,
        max_length=3
    )
    linkedin_post: str = Field(
        description="One LinkedIn post, 2-4 short paragraphs, slightly more professional."
    )
    email: EmailCopy

class VisualBlock(BaseModel):
    """The set of generated image prompts."""
    image_prompts: List[str] = Field(
        description="Three descriptive prompts suitable for text-to-image models.",
        min_length=3,
        max_length=3
    )
    primary_image_prompt: str = Field(
        description="One of the three prompts, or a refined version, chosen as the primary image prompt."
    )
    primary_image_url: Optional[str] = Field(
        default=None,
        description="The URL of the primary generated image."
    )
    image_urls: List[str] = Field(
        default_factory=list,
        description="List of URLs for all generated image variants."
    )

class CampaignPack(BaseModel):
    """The final cohesive pack combining the Brand DNA, generated copy, and visual prompts."""
    brand_dna_used: BrandDNA
    x_posts: List[str]
    linkedin_post: str
    email: EmailCopy
    image_prompts: List[str]
    primary_image_prompt: str
    primary_image_url: Optional[str] = None
    image_urls: List[str] = []

class ReviewResult(BaseModel):
    """Feedback from the Creative Director reviewing the team's output."""
    is_approved: bool = Field(description="Whether the copy and visuals are approved.")
    feedback: str = Field(description="Constructive feedback if not approved, or praise if approved.")
