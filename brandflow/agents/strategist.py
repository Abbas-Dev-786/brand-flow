import logging
from langchain_gradient import ChatGradient
from langchain_core.messages import SystemMessage, HumanMessage
from schemas import BrandDNA
from prompts import STRATEGIST_SYSTEM_PROMPT
from tools.knowledge_base import fetch_brand_knowledge

logger = logging.getLogger(__name__)

# Model configuration - using verified Llama 3 model from the DO API list
MODEL = "llama3-8b-instruct" 

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

    query = f"Search the knowledge base with UUID '{kb_id}' for brand information including tone, audience, values, messages, and visual style."

    try:
        messages = [
            SystemMessage(content=STRATEGIST_SYSTEM_PROMPT),
            HumanMessage(content=query)
        ]

        # Invoke the model which should return a tool call
        response = model_with_tools.invoke(messages)
        logger.info(f"[BrandStrategistAgent] LLM Response: {response.content}")
        logger.info(f"[BrandStrategistAgent] Tool Calls: {response.tool_calls}")
        messages.append(response)

        # Handle the tool call dynamically
        for tool_call in response.tool_calls:
            if tool_call["name"] == "fetch_brand_knowledge":
                tool_result = fetch_brand_knowledge.invoke(tool_call["args"])
                # Ensure we pass the ID correctly
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
            # If no tools were called, it might be the model's first step.
            # We will force a tool call by explicitly providing the schema instructions.
            logger.warning(f"[BrandStrategistAgent] No tool calls made. Response content: {response.content}")
            
            # Manual Fallback: Just call the tool directly if we have a KB ID
            # This ensures we get context even if the LLM is being stubborn today
            logger.info(f"[BrandStrategistAgent] Manually invoking fetch_brand_knowledge for KB: {kb_id}")
            tool_result = fetch_brand_knowledge.invoke({"uuid": kb_id})
            
            structured_model = model.with_structured_output(BrandDNA)
            return structured_model.invoke([
                SystemMessage(content=STRATEGIST_SYSTEM_PROMPT),
                HumanMessage(content=f"Based on the following context, extract the Brand DNA:\n\n{tool_result}")
            ])

    except Exception as e:
        logger.error(f"[BrandStrategistAgent] Failed to parse Brand DNA: {e}")
        # Return an empty/default BrandDNA if parsing fails
        return BrandDNA(target_audience="Unknown")
