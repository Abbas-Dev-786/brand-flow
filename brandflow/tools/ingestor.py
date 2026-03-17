import os
import logging
import requests
import json
import re

logger = logging.getLogger(__name__)

def create_knowledge_base_with_crawler(name: str, url: str) -> str:
    """
    Creates a new Knowledge Base on DigitalOcean GenAI Platform using the built-in Web Crawler.
    Uses the direct DigitalOcean API as per official documentation.

    Args:
        name: Name for the knowledge base.
        url: The website URL to crawl.

    Returns:
        The ID (UUID) of the newly created knowledge base.
    """
    token = os.environ.get("GRADIENT_ACCESS_TOKEN")
    project_id = os.environ.get("GRADIENT_WORKSPACE_ID")

    if not token or not project_id:
        raise ValueError("GRADIENT_ACCESS_TOKEN and GRADIENT_WORKSPACE_ID must be set in .env")

    # official DigitalOcean GenAI API endpoint
    endpoint = "https://api.digitalocean.com/v2/gen-ai/knowledge_bases"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # Use a verified embedding model UUID from the live API
    # all-mini-lm-l6-v2: 22652c2a-79ed-11ef-bf8f-4e013e2ddde4
    payload = {
        "name": name,
        "embedding_model_uuid": "22652c2a-79ed-11ef-bf8f-4e013e2ddde4",
        "project_id": project_id,
        "region": "tor1",
        "datasources": [
            {
                "web_crawler_data_source": {
                    "base_url": url,
                    "crawling_option": "SCOPED",
                    "embed_media": False,
                    "exclude_tags": ["nav", "footer", "header", "aside", "script", "style", "form", "iframe", "noscript"]
                },
                "chunking_algorithm": "CHUNKING_ALGORITHM_SECTION_BASED"
            }
        ]
    }

    try:
        logger.info(f"Creating Knowledge Base '{name}' with DO Web Crawler for: {url}")
        response = requests.post(endpoint, headers=headers, json=payload)
        
        if response.status_code not in [200, 201]:
            logger.error(f"Failed to create Knowledge Base. Status: {response.status_code}, Body: {response.text}")
            raise ValueError(f"DO API Error: {response.text}")

        data = response.json()
        kb_id = data.get("knowledge_base", {}).get("uuid")
        
        if not kb_id:
            logger.error(f"KB created but UUID not found in response: {data}")
            raise ValueError("KB ID not found in API response")

        logger.info(f"Successfully created Knowledge Base. KB ID: {kb_id}")
        return kb_id

    except Exception as e:
        logger.error(f"Error in KB creation: {e}")
        raise

def get_knowledge_base_status(kb_id: str) -> dict:
    """
    Retrieves the current status and metadata of a Knowledge Base.
    """
    token = os.environ.get("GRADIENT_ACCESS_TOKEN")
    if not token:
        raise ValueError("GRADIENT_ACCESS_TOKEN must be set")

    endpoint = f"https://api.digitalocean.com/v2/gen-ai/knowledge_bases/{kb_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(endpoint, headers=headers)
        if response.status_code != 200:
            logger.error(f"Failed to get KB status. Status: {response.status_code}, Body: {response.text}")
            return {"error": f"API Error: {response.status_code}", "details": response.text}
        
        return response.json().get("knowledge_base", {})
    except Exception as e:
        logger.error(f"Error getting KB status: {e}")
        return {"error": str(e)}
