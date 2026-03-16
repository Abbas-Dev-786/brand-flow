import requests
from bs4 import BeautifulSoup
import re
import logging

logger = logging.getLogger(__name__)

def scrape_website_content(url: str) -> str:
    """
    Scrape text content from a given website URL.

    Args:
        url: The website URL to scrape.

    Returns:
        A cleaned string containing the text extracted from the website.
    """
    try:
        # Add headers to mimic a browser and avoid basic blocks
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        logger.info(f"Scraping website: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style", "noscript", "meta", "link", "header", "footer", "nav"]):
            script.extract()

        # Extract text
        text = soup.get_text(separator=' ', strip=True)

        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        logger.info(f"Successfully scraped {len(text)} characters from {url}")
        return text

    except Exception as e:
        logger.error(f"Failed to scrape {url}: {e}")
        raise ValueError(f"Could not scrape content from {url}: {e}")
