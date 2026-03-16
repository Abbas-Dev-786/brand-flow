import logging
from langchain_gradient import ChatGradient
from schemas import BrandDNA, CampaignInput, VisualBlock
from prompts import VISUAL_DESIGNER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Model configuration
MODEL = "llama3-8b-instruct"

def get_model(temperature: float = 0.7) -> ChatGradient:
    """Get a ChatGradient instance."""
    return ChatGradient(
        model=MODEL,
        temperature=temperature
    )

def generate_image_prompts(brand_dna: BrandDNA, campaign: CampaignInput) -> VisualBlock:
    """
    Propose image prompts aligned with the Brand DNA and campaign input.

    Args:
        brand_dna: The BrandDNA object
        campaign: The CampaignInput describing goal, offer, etc.

    Returns:
        VisualBlock containing 3 image prompts and 1 primary image prompt.
    """
    logger.info(f"[VisualDesignerAgent] Generating image prompts for campaign: {campaign.goal}")

    model = get_model()
    # Use with_structured_output to ensure we get a VisualBlock JSON schema back
    structured_model = model.with_structured_output(VisualBlock)

    prompt_content = f"""
    Please generate the image prompts based on the following:

    BRAND DNA:
    - Tone: {', '.join(brand_dna.tone)}
    - Target Audience: {campaign.audience or brand_dna.target_audience}
    - Values: {', '.join(brand_dna.values)}
    - Visual Style: {', '.join(brand_dna.visual_style) if brand_dna.visual_style else 'None specified'}

    CAMPAIGN INPUT:
    - Goal: {campaign.goal}
    - Offer: {campaign.offer}
    """

    try:
        visual_block = structured_model.invoke([
            {"role": "system", "content": VISUAL_DESIGNER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_content}
        ])
        logger.info("[VisualDesignerAgent] Successfully generated image prompts")
        return visual_block
    except Exception as e:
        logger.error(f"[VisualDesignerAgent] Failed to generate image prompts: {e}")
        # Default fallback
        return VisualBlock(
            image_prompts=["Error generating prompt 1", "Error generating prompt 2", "Error generating prompt 3"],
            primary_image_prompt="Error generating primary prompt."
        )
