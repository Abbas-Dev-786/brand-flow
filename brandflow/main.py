import sys
import os
import logging
import json
from typing import TypedDict, Optional, Dict, Any
from langgraph.graph import StateGraph, START, END
from langchain_gradient import ChatGradient
from langchain_core.messages import SystemMessage, HumanMessage

# Import schemas
from schemas import BrandDNA, CampaignInput, CampaignPack, CopyBlock, VisualBlock
from agents.copywriter import generate_campaign_copy
from agents.visual_designer import generate_image_prompts
from agents.strategist import extract_brand_dna
from prompts import CREATIVE_DIRECTOR_SYSTEM_PROMPT
from gradient_adk import entrypoint

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# =============================================================================
# State Definition
# =============================================================================

class BrandFlowState(TypedDict, total=False):
    """State for the BrandFlow multi-agent workflow."""
    brand_dna: Dict[str, Any]      # Passed in as dict for serialization
    campaign: Dict[str, Any]       # Passed in as dict for serialization

    copy_block: Optional[Dict[str, Any]]
    visual_block: Optional[Dict[str, Any]]

    campaign_pack: Optional[Dict[str, Any]]
    error: Optional[str]


# =============================================================================
# Workflow Nodes
# =============================================================================

def creative_director_copywriter_node(state: BrandFlowState) -> BrandFlowState:
    """Creative Director calling the Copywriter."""
    brand_dna_data = state.get("brand_dna", {})
    campaign_data = state.get("campaign", {})

    if not brand_dna_data or not campaign_data:
        return {**state, "error": "Missing Brand DNA or Campaign Input"}

    try:
        brand_dna = BrandDNA(**brand_dna_data)
        campaign = CampaignInput(**campaign_data)

        copy_block = generate_campaign_copy(brand_dna, campaign)

        return {
            **state,
            "copy_block": copy_block.model_dump()
        }
    except Exception as e:
        logger.error(f"[CreativeDirector] Failed calling Copywriter: {e}")
        return {**state, "error": str(e)}

def creative_director_visual_designer_node(state: BrandFlowState) -> BrandFlowState:
    """Creative Director calling the Visual Designer."""
    brand_dna_data = state.get("brand_dna", {})
    campaign_data = state.get("campaign", {})

    if not brand_dna_data or not campaign_data:
        return {**state, "error": "Missing Brand DNA or Campaign Input"}

    try:
        brand_dna = BrandDNA(**brand_dna_data)
        campaign = CampaignInput(**campaign_data)

        visual_block = generate_image_prompts(brand_dna, campaign)

        return {
            **state,
            "visual_block": visual_block.model_dump()
        }
    except Exception as e:
        logger.error(f"[CreativeDirector] Failed calling Visual Designer: {e}")
        return {**state, "error": str(e)}

def creative_director_assembler_node(state: BrandFlowState) -> BrandFlowState:
    """Creative Director uses LLM to assemble the final Campaign Pack."""
    if "error" in state and state["error"]:
        return state

    brand_dna_data = state.get("brand_dna", {})
    campaign_data = state.get("campaign", {})
    copy_block_data = state.get("copy_block", {})
    visual_block_data = state.get("visual_block", {})

    # Ensure we have minimum required fields
    if not copy_block_data or not visual_block_data:
        return {**state, "error": "Missing output from specialist agents"}

    logger.info("[CreativeDirector] Reviewing and assembling Campaign Pack")

    # Use LLM to review and construct the final struct
    model = ChatGradient(model="openai-gpt-4o", temperature=0.2)
    structured_model = model.with_structured_output(CampaignPack)

    prompt = f"""
    You have received the following parts from your specialist team:

    BRAND DNA: {json.dumps(brand_dna_data, indent=2)}
    CAMPAIGN: {json.dumps(campaign_data, indent=2)}

    COPY BLOCK: {json.dumps(copy_block_data, indent=2)}
    VISUAL BLOCK: {json.dumps(visual_block_data, indent=2)}

    Review these outputs to ensure they align with the Brand DNA and Campaign Goal.
    Construct the final CampaignPack JSON. You may subtly tweak the copy or prompts
    if they violate the Brand DNA, otherwise assemble them cleanly.
    """

    try:
        campaign_pack = structured_model.invoke([
            SystemMessage(content=CREATIVE_DIRECTOR_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ])

        return {
            **state,
            "campaign_pack": campaign_pack.model_dump()
        }
    except Exception as e:
        logger.error(f"[CreativeDirector] Failed assembling Campaign Pack with LLM: {e}")
        return {**state, "error": str(e)}

# =============================================================================
# Graph Construction
# =============================================================================

def create_orchestrator_graph():
    """Create the Creative Director orchestrator graph."""
    workflow = StateGraph(BrandFlowState)

    # Add nodes
    workflow.add_node("call_copywriter", creative_director_copywriter_node)
    workflow.add_node("call_visual_designer", creative_director_visual_designer_node)
    workflow.add_node("assemble_pack", creative_director_assembler_node)

    # Define edges
    # Parallel execution for copywriter and visual designer
    workflow.add_edge(START, "call_copywriter")
    workflow.add_edge(START, "call_visual_designer")

    workflow.add_edge("call_copywriter", "assemble_pack")
    workflow.add_edge("call_visual_designer", "assemble_pack")

    workflow.add_edge("assemble_pack", END)

    return workflow.compile()

# The compiled graph that can be invoked
creative_director_app = create_orchestrator_graph()

# =============================================================================
# Endpoints
# =============================================================================

@entrypoint
def ingest_website(input_data: dict) -> dict:
    """
    Endpoint for POST /gradient/brandflow/ingest-website

    Args:
        input_data: Dictionary containing:
            - url (str): The website URL to scrape.

    Returns:
        JSON with the new `kb_id`.
    """
    url = input_data.get("url")
    if not url:
        return {"error": "url is required"}

    try:
        # Step 1: Scrape website text content
        from tools.scraper import scrape_website_content
        text_content = scrape_website_content(url)

        # Step 2: Ingest text to Gradient Knowledge Base
        from tools.ingestor import create_knowledge_base_from_text
        kb_name = f"brandflow-kb-{url.split('//')[-1].replace('/', '-')}"
        kb_id = create_knowledge_base_from_text(kb_name, text_content)

        return {
            "success": True,
            "kb_id": kb_id,
            "message": f"Successfully ingested {url} into KB {kb_id}"
        }
    except Exception as e:
        logger.error(f"Error ingesting website: {e}")
        return {"error": str(e)}


@entrypoint
def generate_brand_dna(input_data: dict) -> dict:
    """
    Endpoint for POST /gradient/brandflow/brand-dna

    Args:
        input_data: Dictionary containing:
            - kb_id (str): The ID of the knowledge base

    Returns:
        BrandDNA JSON representation.
    """
    kb_id = input_data.get("kb_id")
    if not kb_id:
        return {"error": "kb_id is required"}

    try:
        brand_dna = extract_brand_dna(kb_id)
        return brand_dna.model_dump()
    except Exception as e:
        logger.error(f"Error generating Brand DNA: {e}")
        return {"error": str(e)}

@entrypoint
def generate_campaign_pack(input_data: dict) -> dict:
    """
    Endpoint for POST /gradient/brandflow/campaign-pack

    Args:
        input_data: Dictionary containing:
            - brand_dna (dict): The Brand DNA properties
            - campaign (dict): The Campaign input properties

    Returns:
        CampaignPack JSON representation.
    """
    brand_dna_data = input_data.get("brand_dna")
    campaign_data = input_data.get("campaign")

    if not brand_dna_data or not campaign_data:
        return {"error": "brand_dna and campaign are required"}

    initial_state = {
        "brand_dna": brand_dna_data,
        "campaign": campaign_data
    }

    try:
        # Run the LangGraph orchestration
        result = creative_director_app.invoke(initial_state)

        if result.get("error"):
            return {"error": result["error"]}

        return result.get("campaign_pack", {})
    except Exception as e:
        logger.error(f"Error generating Campaign Pack: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    pass
