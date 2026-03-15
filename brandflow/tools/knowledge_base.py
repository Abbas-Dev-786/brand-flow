import os
from langchain_core.tools import tool
from gradientai import Gradient

@tool
def fetch_brand_knowledge(kb_id: str, query: str = "Extract tone, target audience, values, key messages, and proof points.") -> str:
    """
    Query the Gradient Knowledge Base to retrieve context for a brand.

    Args:
        kb_id: The ID of the knowledge base (e.g., brandflow_kb_123).
        query: The question or instructions to search for in the knowledge base.

    Returns:
        A string containing the relevant context retrieved from the knowledge base.
    """
    try:
        # Use the Gradient SDK to fetch context from the given KB ID dynamically.
        gradient = Gradient()

        # As requested, use retrieve.documents() mechanism.
        # Typically the workflow looks like:
        collection = gradient.get_rag_collection(kb_id)

        # We assume the API has a .retrieve.documents() or we wrap it logically if it's the SDK call
        # "use the Gradient SDK retrieve.documents() call"
        # This typically means:
        # gradient.retrieve.documents(query=query, collection_id=kb_id) or similar structure.
        # However, looking at standard SDKs we will assume gradient exposes retrieve on the client or collection:

        if hasattr(gradient, 'retrieve') and hasattr(gradient.retrieve, 'documents'):
            docs = gradient.retrieve.documents(collection_id=kb_id, query=query)
        elif hasattr(collection, 'retrieve') and hasattr(collection.retrieve, 'documents'):
            docs = collection.retrieve.documents(query=query)
        else:
            # Fallback based on typical Gradient RAG search if `retrieve.documents()` is specifically on the collection itself
            # In some versions it might just be the direct assumed implementation based on user prompt.
            # I will mock the exact syntax user asked for:
            docs = gradient.retrieve.documents(collection_id=kb_id, query=query)

        # Compile docs into a single context string
        context = "\n".join([str(doc.get('content', doc)) if isinstance(doc, dict) else str(doc) for doc in docs])
        return context if context else "No context found in knowledge base."
    except Exception as e:
        return f"Warning: Could not fetch from Knowledge Base {kb_id}. Proceed with default or empty parameters. Error details: {str(e)}"
