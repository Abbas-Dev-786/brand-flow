import sys
import os
import logging
import json
from typing import TypedDict, Optional, Dict, Any, List, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_gradient import ChatGradient
from langchain_core.messages import SystemMessage, HumanMessage

# Import schemas
from schemas import BrandDNA, CampaignInput, CampaignPack, CopyBlock, VisualBlock, ReviewResult
from agents.copywriter import generate_campaign_copy
from agents.visual_designer import generate_image_prompts
from agents.strategist import extract_brand_dna
from prompts import CREATIVE_DIRECTOR_SYSTEM_PROMPT, REVIEWER_SYSTEM_PROMPT
from gradient_adk import entrypoint

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Model configuration
MODEL = "alibaba-qwen3-32b"


import operator

# =============================================================================
# State Definition
# =============================================================================

class BrandFlowState(TypedDict, total=False):
    """
    State for the BrandFlow multi-agent workflow.
    """
    brand_dna: Dict[str, Any]
    campaign: Dict[str, Any]

    copy_block: Optional[Dict[str, Any]]
    visual_block: Optional[Dict[str, Any]]

    campaign_pack: Optional[Dict[str, Any]]
    review_feedback: Optional[str]
    primary_image_url: Optional[str]
    image_urls: List[str]
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
        review_feedback = state.get("review_feedback")

        copy_block = generate_campaign_copy(brand_dna, campaign, feedback=review_feedback)

        return {
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
        review_feedback = state.get("review_feedback")

        visual_block = generate_image_prompts(brand_dna, campaign, feedback=review_feedback)

        return {
            "visual_block": visual_block.model_dump(),
            "primary_image_url": visual_block.primary_image_url,
            "image_urls": visual_block.image_urls
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
    model = ChatGradient(model=MODEL, temperature=0.2)
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

        pack_dict = campaign_pack.model_dump()
        # Ensure the generated image URL is included in the final pack
        pack_dict["primary_image_url"] = state.get("primary_image_url")
        pack_dict["image_urls"] = state.get("image_urls", [])

        return {
            "campaign_pack": pack_dict
        }
    except Exception as e:
        logger.error(f"[CreativeDirector] Failed assembling Campaign Pack with LLM: {e}")
        return {**state, "error": str(e)}

def creative_director_reviewer_node(state: BrandFlowState) -> BrandFlowState:
    """Creative Director reviews the team's output."""
    if "error" in state and state["error"]:
        return state

    brand_dna_data = state.get("brand_dna", {})
    campaign_data = state.get("campaign", {})
    copy_block_data = state.get("copy_block", {})
    visual_block_data = state.get("visual_block", {})

    logger.info("[CreativeDirector] Reviewing specialized team output")

    model = ChatGradient(model="llama3-8b-instruct", temperature=0.1)
    structured_model = model.with_structured_output(ReviewResult)

    prompt = f"""
    Review the following campaign components:

    BRAND DNA: {json.dumps(brand_dna_data, indent=2)}
    CAMPAIGN: {json.dumps(campaign_data, indent=2)}
    COPY: {json.dumps(copy_block_data, indent=2)}
    VISUALS: {json.dumps(visual_block_data, indent=2)}
    """

    try:
        review_result = structured_model.invoke([
            SystemMessage(content=REVIEWER_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ])

        if not review_result.is_approved:
            logger.warning(f"[CreativeDirector] Output not approved: {review_result.feedback}")
            return {"review_feedback": review_result.feedback}
        
        return {"review_feedback": "Approved"}
    except Exception as e:
        logger.error(f"[CreativeDirector] Review failed: {e}")
        return {"error": str(e)}

def should_continue(state: BrandFlowState):
    """Determine whether to continue refining or assemble the final pack."""
    feedback = state.get("review_feedback", "")
    if feedback == "Approved":
        return "approved"
    return "refine"

# =============================================================================
# Graph Construction
# =============================================================================

def create_orchestrator_graph():
    """Create the Creative Director orchestrator graph with memory."""
    workflow = StateGraph(BrandFlowState)

    # Add nodes
    workflow.add_node("call_copywriter", creative_director_copywriter_node)
    workflow.add_node("call_visual_designer", creative_director_visual_designer_node)
    workflow.add_node("review_output", creative_director_reviewer_node)
    workflow.add_node("assemble_pack", creative_director_assembler_node)

    # Define edges
    workflow.add_edge(START, "call_copywriter")
    workflow.add_edge(START, "call_visual_designer")

    workflow.add_edge("call_copywriter", "review_output")
    workflow.add_edge("call_visual_designer", "review_output")

    def parallel_refactor_or_assemble(state: BrandFlowState):
        feedback = state.get("review_feedback", "")
        if feedback == "Approved":
            return ["assemble_pack"]
        return ["call_copywriter", "call_visual_designer"]

    workflow.add_conditional_edges(
        "review_output",
        parallel_refactor_or_assemble,
        {
            "assemble_pack": "assemble_pack",
            "call_copywriter": "call_copywriter",
            "call_visual_designer": "call_visual_designer"
        }
    )
    workflow.add_edge("assemble_pack", END)

    # Initialize memory
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)

# The compiled graph that can be invoked
creative_director_app = create_orchestrator_graph()

# =============================================================================
# Endpoints
# =============================================================================

def ingest_website(input_data: dict, context) -> dict:
    """
    Endpoint for POST /gradient/brandflow/ingest-website

    Args:
        input_data: Dictionary containing:
            - url (str): The website URL to scrape.
        context: Gradient deployment context
    """
    url = input_data.get("url")
    if not url:
        return {"error": "url is required"}

    try:
        # We now use the built-in DigitalOcean Web Crawler for better reliability
        from tools.ingestor import create_knowledge_base_with_crawler
        
        # Use a very clean name: alphanumeric and dashes only.
        import re
        domain = url.split('//')[-1].split('/')[0].replace("www.", "")
        clean_domain = re.sub(r'[^a-zA-Z0-9-]', '-', domain).lower()
        clean_domain = re.sub(r'-+', '-', clean_domain).strip("-")
        kb_name = f"bf-{clean_domain}"[:63].strip("-")
        
        kb_id = create_knowledge_base_with_crawler(kb_name, url)

        return {
            "success": True,
            "kb_id": kb_id,
            "message": f"Successfully started ingestion for {url}. KB ID: {kb_id}. Please wait a few minutes for indexing to complete."
        }
    except Exception as e:
        logger.error(f"Error ingesting website: {e}")
        return {"error": str(e)}


def generate_brand_dna(input_data: dict, context) -> dict:
    """
    Endpoint for POST /gradient/brandflow/brand-dna

    Args:
        input_data: Dictionary containing:
            - kb_id (str): The ID of the knowledge base
            - wait_for_indexing (bool): Whether to poll until indexing is complete (default True)
        context: Gradient deployment context
    """
    kb_id = input_data.get("kb_id")
    wait_for_indexing = input_data.get("wait_for_indexing", True)
    
    if not kb_id:
        return {"error": "kb_id is required"}

    try:
        if wait_for_indexing:
            logger.info(f"Waiting for KB {kb_id} to be indexed...")
            from tools.ingestor import get_knowledge_base_status
            import time
            
            max_retries = 60 # 10 minutes (60 * 10s)
            for i in range(max_retries):
                status_data = get_knowledge_base_status(kb_id)
                
                # Check for API error in status_data
                if "error" in status_data:
                    logger.warning(f"Polling KB status ({i+1}/{max_retries}): API Error - {status_data['error']}")
                    time.sleep(10)
                    continue

                last_job = status_data.get("last_indexing_job")
                
                if not last_job:
                    logger.info(f"Polling KB status ({i+1}/{max_retries}): No indexing job found yet. Waiting...")
                    time.sleep(10)
                    continue

                phase = last_job.get("phase", "")
                status = last_job.get("status", "")
                
                logger.info(f"Polling KB status ({i+1}/{max_retries}): Phase={phase}, Status={status}")
                
                if phase == "BATCH_JOB_PHASE_SUCCEEDED" or status == "INDEX_JOB_STATUS_COMPLETED":
                    logger.info("Indexing complete!")
                    # Add a small buffer for propagation to the retrieval service
                    time.sleep(5)
                    break
                
                if phase in ["BATCH_JOB_PHASE_FAILED", "BATCH_JOB_PHASE_CANCELED"]:
                    return {"error": f"Indexing failed with phase: {phase}. Check DigitalOcean dashboard for details."}
                
                time.sleep(10)
            else:
                logger.warning("Indexing timed out (10 mins), attempting extraction anyway. Results might be incomplete.")

        brand_dna = extract_brand_dna(kb_id)
        return brand_dna.model_dump()
    except Exception as e:
        logger.error(f"Error generating Brand DNA: {e}")
        return {"error": str(e)}

def generate_campaign_pack(input_data: dict, context) -> dict:
    """
    Endpoint for POST /gradient/brandflow/campaign-pack

    Args:
        input_data: Dictionary containing:
            - brand_dna (dict): The Brand DNA properties
            - campaign (dict): The Campaign input properties
            - thread_id (str): Optional interaction thread ID for memory
        context: Gradient deployment context
    """
    brand_dna_data = input_data.get("brand_dna")
    campaign_data = input_data.get("campaign")
    thread_id = input_data.get("thread_id", "default_thread")

    if not brand_dna_data or not campaign_data:
        return {"error": "brand_dna and campaign are required"}

    initial_state = {
        "brand_dna": brand_dna_data,
        "campaign": campaign_data
    }

    config = {"configurable": {"thread_id": thread_id}}

    try:
        # Run the LangGraph orchestration
        result = creative_director_app.invoke(initial_state, config=config)

        if result.get("error"):
            return {"error": result["error"]}

        return {
            "campaign_pack": result.get("campaign_pack", {}),
            "review": result.get("review_feedback", "Not reviewed")
        }
    except Exception as e:
        logger.error(f"Error generating Campaign Pack: {e}")
        return {"error": str(e)}

@entrypoint
def main_entrypoint(input_data: dict, context) -> dict:
    """
    Unified entrypoint for the BrandFlow agent.
    Routes requests based on the 'action' parameter.
    """
    action = input_data.get("action")
    
    if action == "ingest-website":
        return ingest_website(input_data, context)
    elif action == "generate-brand-dna":
        return generate_brand_dna(input_data, context)
    elif action == "generate-campaign-pack":
        return generate_campaign_pack(input_data, context)
    elif action == "check-status":
        kb_id = input_data.get("kb_id")
        if not kb_id:
            return {"error": "kb_id is required"}
        
        from tools.ingestor import get_knowledge_base_status
        status = get_knowledge_base_status(kb_id)
        return status
    else:
        return {
            "error": f"Unknown action: {action}",
            "available_actions": ["ingest-website", "generate-brand-dna", "generate-campaign-pack", "check-status"]
        }

if __name__ == "__main__":
    pass
