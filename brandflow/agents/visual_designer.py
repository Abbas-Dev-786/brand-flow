import logging
import os
import requests
import time
from typing import Optional
from langchain_gradient import ChatGradient
from schemas import BrandDNA, CampaignInput, VisualBlock
from prompts import VISUAL_DESIGNER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Model configuration
MODEL = "alibaba-qwen3-32b"
IMAGE_MODEL = "fal-ai/flux/schnell" # High quality image model

def get_model(temperature: float = 0.7) -> ChatGradient:
    """Get a ChatGradient instance."""
    return ChatGradient(
        model=MODEL,
        temperature=temperature
    )

def generate_actual_image(prompt: str) -> Optional[str]:
    """
    Call DigitalOcean GenAI async-invoke API to generate an image.
    Uses fal-ai/flux/schnell for high quality and returns a URL.
    """
    api_key = os.environ.get("DIGITALOCEAN_INFERENCE_KEY")
    if not api_key:
        logger.error("[VisualDesignerAgent] DIGITALOCEAN_INFERENCE_KEY not found in environment")
        return None

    logger.info(f"[VisualDesignerAgent] Using async-invoke for model: {IMAGE_MODEL}")
    
    base_url = "https://inference.do-ai.run/v1/async-invoke"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model_id": IMAGE_MODEL,
        "input": {
            "prompt": prompt,
            "num_images": 1
        }
    }

    try:
        # 1. Start the async job
        response = requests.post(base_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        job_data = response.json()
        request_id = job_data.get("request_id")
        
        if not request_id:
            logger.error(f"[VisualDesignerAgent] No request_id returned: {job_data}")
            return None

        logger.info(f"[VisualDesignerAgent] Job started, request_id: {request_id}")

        # 2. Poll for completion
        status_url = f"{base_url}/{request_id}/status"
        max_retries = 30 # Up to ~60 seconds
        for i in range(max_retries):
            status_resp = requests.get(status_url, headers=headers, timeout=10)
            status_resp.raise_for_status()
            status_data = status_resp.json()
            status = status_data.get("status")
            
            logger.info(f"[VisualDesignerAgent] Job {request_id} status: {status}")
            
            if status == "COMPLETED":
                # 3. Fetch the result
                result_url = f"{base_url}/{request_id}"
                result_resp = requests.get(result_url, headers=headers, timeout=10)
                result_resp.raise_for_status()
                result_data = result_resp.json()
                
                # Extract image URL from fal-style output
                # Typically: result_data['output']['images'][0]['url']
                images = result_data.get("output", {}).get("images", [])
                if images:
                    image_url = images[0].get("url")
                    logger.info(f"[VisualDesignerAgent] Success! Image URL: {image_url}")
                    return image_url
                
                logger.error(f"[VisualDesignerAgent] COMPLETED but no images: {result_data}")
                return None
            
            elif status in ["FAILED", "CANCELLED"]:
                logger.error(f"[VisualDesignerAgent] Job {request_id} failed or was cancelled: {status_data}")
                return None
            
            time.sleep(2) # Wait before next poll

        logger.warning(f"[VisualDesignerAgent] Job {request_id} timed out while polling.")
        return None

    except Exception as e:
        logger.error(f"[VisualDesignerAgent] Image generation failed: {e}")
        return None

def generate_image_prompts(brand_dna: BrandDNA, campaign: CampaignInput) -> VisualBlock:
    """
    Propose image prompts and generate the primary image.
    """
    logger.info(f"[VisualDesignerAgent] Generating image prompts for campaign: {campaign.goal}")

    model = get_model()
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
        
        # Now generate the actual image for the primary prompt
        if visual_block.primary_image_prompt:
            image_url = generate_actual_image(visual_block.primary_image_prompt)
            visual_block.primary_image_url = image_url
            # Add to the list of variant URLs
            if image_url:
                visual_block.image_urls.append(image_url)
        
        # Generate images for the other variants too
        for variant_prompt in visual_block.image_prompts:
            # Skip if it's the exact same as primary (to save time/tokens)
            if variant_prompt == visual_block.primary_image_prompt:
                continue
            
            variant_url = generate_actual_image(variant_prompt)
            if variant_url:
                visual_block.image_urls.append(variant_url)
            
        logger.info("[VisualDesignerAgent] Successfully generated image prompts and variant images")
        return visual_block
    except Exception as e:
        logger.error(f"[VisualDesignerAgent] Failed: {e}")
        return VisualBlock(
            image_prompts=["Error", "Error", "Error"],
            primary_image_prompt="Error",
            primary_image_url=None,
            image_urls=[]
        )
