import logging
from langchain_gradient import ChatGradient
from ..schemas import BrandDNA, CampaignInput, CopyBlock
from ..prompts import COPYWRITER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Model configuration
MODEL = "openai-gpt-4o"

def get_model(temperature: float = 0.5) -> ChatGradient:
    """Get a ChatGradient instance."""
    return ChatGradient(
        model=MODEL,
        temperature=temperature
    )

def generate_campaign_copy(brand_dna: BrandDNA, campaign: CampaignInput) -> CopyBlock:
    """
    Generate channel-specific copy that strictly follows the given Brand DNA.

    Args:
        brand_dna: The BrandDNA object
        campaign: The CampaignInput describing goal, offer, etc.

    Returns:
        CopyBlock containing posts for X, LinkedIn, and an Email.
    """
    logger.info(f"[CopywriterAgent] Generating copy for campaign: {campaign.goal}")

    model = get_model()
    # Use with_structured_output to ensure we get a CopyBlock JSON schema back
    structured_model = model.with_structured_output(CopyBlock)

    prompt_content = f"""
    Please generate the copy based on the following:

    BRAND DNA:
    - Tone: {', '.join(brand_dna.tone)}
    - Target Audience: {campaign.audience or brand_dna.target_audience}
    - Values: {', '.join(brand_dna.values)}
    - Key Messages: {', '.join(brand_dna.key_messages)}
    - Proof Points: {', '.join(brand_dna.proof_points)}

    CAMPAIGN INPUT:
    - Goal: {campaign.goal}
    - Offer: {campaign.offer}
    - Channel Preferences: {', '.join(campaign.channel_preferences) if campaign.channel_preferences else 'All standard channels'}
    """

    try:
        copy_block = structured_model.invoke([
            {"role": "system", "content": COPYWRITER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_content}
        ])
        logger.info("[CopywriterAgent] Successfully generated copy block")
        return copy_block
    except Exception as e:
        logger.error(f"[CopywriterAgent] Failed to generate copy: {e}")
        # Default fallback
        return CopyBlock(
            x_posts=["Error generating post 1", "Error generating post 2", "Error generating post 3"],
            linkedin_post="Error generating LinkedIn post.",
            email={"subject": "Error", "body_text": "Error generating email.", "body_html": None}
        )
