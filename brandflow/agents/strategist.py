import logging
from langchain_gradient import ChatGradient
from langchain_core.messages import SystemMessage, HumanMessage
from schemas import BrandDNA
from prompts import STRATEGIST_SYSTEM_PROMPT
from tools.knowledge_base import fetch_brand_knowledge

logger = logging.getLogger(__name__)

# Model configuration - using the 70B model for reliable structured output
MODEL = "llama3.3-70b-instruct"


def get_model(temperature: float = 0.0) -> ChatGradient:
    """Get a ChatGradient instance with robust timeout/retry settings."""
    return ChatGradient(
        model=MODEL,
        temperature=temperature,
        max_retries=5,
        timeout=120.0,
    )


def extract_brand_dna(kb_id: str) -> BrandDNA:
    """
    Extract Brand DNA from a knowledge base.

    Directly retrieves context from the KB and uses a single structured-output
    LLM call to parse it into BrandDNA. No tool-calling step needed since
    we already have the kb_id.

    Args:
        kb_id: The knowledge base ID.

    Returns:
        BrandDNA object representing the brand's core traits.
    """
    logger.info(f"[BrandStrategistAgent] Extracting Brand DNA from KB: {kb_id}")

    try:
        # Step 1: Directly retrieve context from the KB (no LLM needed for this)
        logger.info(f"[BrandStrategistAgent] Fetching brand context from KB: {kb_id}")
        kb_context = fetch_brand_knowledge.invoke({"uuid": kb_id})

        if kb_context.startswith("Error"):
            logger.error(f"[BrandStrategistAgent] KB retrieval failed: {kb_context}")
            return BrandDNA(target_audience="Unknown")

        logger.info(f"[BrandStrategistAgent] Retrieved KB context ({len(kb_context)} chars)")

        # Step 2: Single structured-output LLM call to extract BrandDNA
        model = get_model()
        structured_model = model.with_structured_output(BrandDNA)

        result = structured_model.invoke([
            SystemMessage(content=STRATEGIST_SYSTEM_PROMPT),
            HumanMessage(
                content=f"Based on the following website content, extract the Brand DNA:\n\n{kb_context}"
            ),
        ])

        logger.info("[BrandStrategistAgent] Successfully extracted Brand DNA")
        return result

    except Exception as e:
        logger.error(f"[BrandStrategistAgent] Failed to parse Brand DNA: {e}")
        return BrandDNA(target_audience="Unknown")
