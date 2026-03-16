import logging
from langchain_gradient import ChatGradient
from langchain_core.messages import SystemMessage, HumanMessage
from schemas import BrandDNA
from prompts import STRATEGIST_SYSTEM_PROMPT
from tools.knowledge_base import fetch_brand_knowledge

logger = logging.getLogger(__name__)

# Model configuration
MODEL = "openai-gpt-4o" # or another available OpenAI model on Gradient

def get_model(temperature: float = 0.0) -> ChatGradient:
    """Get a ChatGradient instance."""
    return ChatGradient(
        model=MODEL,
        temperature=temperature
    )

def extract_brand_dna(kb_id: str) -> BrandDNA:
    """
    Extract Brand DNA from a knowledge base using tool calling.

    Args:
        kb_id: The knowledge base ID.

    Returns:
        BrandDNA object representing the brand's core traits.
    """
    logger.info(f"[BrandStrategistAgent] Extracting Brand DNA from KB: {kb_id}")

    model = get_model()
    # Bind the tool to the LLM so it can dynamically fetch context
    model_with_tools = model.bind_tools([fetch_brand_knowledge])

    query = f"Read all available content for the knowledge base with ID '{kb_id}' using the fetch_brand_knowledge tool. Extract the brand's tone, target audience, values, key messages, and proof points. Look for visual style hints like colors or mood if any."

    try:
        messages = [
            SystemMessage(content=STRATEGIST_SYSTEM_PROMPT),
            HumanMessage(content=query)
        ]

        # Invoke the model which should return a tool call
        response = model_with_tools.invoke(messages)
        messages.append(response)

        # Handle the tool call dynamically
        for tool_call in response.tool_calls:
            if tool_call["name"] == "fetch_brand_knowledge":
                tool_result = fetch_brand_knowledge.invoke(tool_call["args"])
                messages.append({
                    "role": "tool",
                    "name": "fetch_brand_knowledge",
                    "content": tool_result,
                    "tool_call_id": tool_call["id"]
                })

        # If tools were called, we send the results back to the model to generate the final structured output
        if response.tool_calls:
            # We enforce structured output of BrandDNA
            structured_model = model.with_structured_output(BrandDNA)
            final_response = structured_model.invoke(messages)
            return final_response
        else:
            # If no tools were called, maybe it just responded or hallucinated
            logger.warning("[BrandStrategistAgent] No tool calls made. Falling back to structured output parse.")
            structured_model = model.with_structured_output(BrandDNA)
            return structured_model.invoke([
                SystemMessage(content=STRATEGIST_SYSTEM_PROMPT),
                HumanMessage(content=f"No context was requested, but extract Brand DNA for KB: {kb_id}")
            ])

    except Exception as e:
        logger.error(f"[BrandStrategistAgent] Failed to parse Brand DNA: {e}")
        # Return an empty/default BrandDNA if parsing fails
        return BrandDNA(target_audience="Unknown")
