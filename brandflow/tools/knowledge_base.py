import os
import logging
import requests
from langchain_core.tools import tool

logger = logging.getLogger(__name__)

@tool
def fetch_brand_knowledge(uuid: str) -> str:
    """
    Query the DigitalOcean Knowledge Base Retrieve API to get core brand context.
    Use this to extract tone, audience, values, messages, and visual style.

    Args:
        uuid: The unique identifier (UUID) of the knowledge base to query.

    Returns:
        A string containing the relevant text content retrieved from the knowledge base.
    """
    token = os.environ.get("GRADIENT_ACCESS_TOKEN")
    if not token:
        return "Error: GRADIENT_ACCESS_TOKEN not set in environment."

    # Official DigitalOcean KBaaS Retrieval endpoint
    endpoint = f"https://kbaas.do-ai.run/v1/{uuid}/retrieve"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # We use a broad general query to find the most relevant brand traits
    payload = {
        "query": "What is the brand tone, target audience, core values, key messages, and visual identity (colors/style)?",
        "num_results": 10,
        "alpha": 0.5
    }

    try:
        logger.info(f"Retrieving brand context from KB {uuid}")
        response = requests.post(endpoint, headers=headers, json=payload)
        
        if response.status_code != 200:
            logger.error(f"Retrieve API failure. Status: {response.status_code}, Body: {response.text}")
            return f"Error: Retrieve API returned status {response.status_code}. It might still be indexing or restricted."

        data = response.json()
        results = data.get("results", [])
        
        if not results:
            return "No relevant context found. Please ensure the knowledge base has finished indexing and contains brand information."

        # Combine text content from results
        context_parts = []
        for res in results:
            text = res.get("text_content")
            if text:
                context_parts.append(text)
        
        combined_context = "\n\n---\n\n".join(context_parts)
        logger.info(f"Retrieved {len(context_parts)} chunks from KB.")
        return combined_context

    except Exception as e:
        logger.error(f"Exception during KB retrieval: {e}")
        return f"Error querying KB: {str(e)}"
