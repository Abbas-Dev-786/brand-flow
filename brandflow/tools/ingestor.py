import os
import uuid
import logging
from gradientai import Gradient

logger = logging.getLogger(__name__)

def create_knowledge_base_from_text(name: str, text: str) -> str:
    """
    Creates a new RAG collection (knowledge base) on Gradient and adds the text document to it.

    Args:
        name: Name for the knowledge base.
        text: The extracted website content text.

    Returns:
        The ID of the newly created knowledge base.
    """
    try:
        gradient = Gradient()
        logger.info(f"Creating new RAG collection: {name}")

        # Create a new RAG collection. We can use typical models or chunkers.
        # Assuming the standard creation flow:
        kb = gradient.create_rag_collection(
            name=name,
            # We typically provide chunker info, but leaving default if supported,
            # or we specify the parsing logic:
            chunker={"chunk_size": 1000, "chunk_overlap": 100}
        )

        # We need to upload the text. Gradient requires file uploads for RAG collections.
        # So we write the text to a temporary file and upload it.
        temp_filename = f"/tmp/{uuid.uuid4().hex}.txt"
        with open(temp_filename, 'w', encoding='utf-8') as f:
            f.write(text)

        logger.info(f"Adding document to KB: {kb.id_}")
        kb.add_files(filepaths=[temp_filename])

        # Clean up
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        logger.info(f"Successfully created KB and ingested document. KB ID: {kb.id_}")
        return kb.id_

    except Exception as e:
        logger.error(f"Failed to create Knowledge Base: {e}")
        raise ValueError(f"Failed to create Knowledge Base: {e}")
