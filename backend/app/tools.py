from datetime import datetime
from app.rag import uploader
from langchain.tools import tool


@tool
def calculator(expression: str):
    """Evaluate mathematical expressions"""
    # One of those cases of a tool that does everything!
    try:
        return str(eval(expression))  # Very bad!!! No guardrails.
    except Exception as e:
        return f"Error: {e}"

@tool
def todays_date(timezone: str = "UTC"):
    """
    Returns the current date and time for a given timezone
    
    timezone: str - a valid timezone string in uppercase characters
    """
    timezone = timezone.lower()
    return datetime.now()


@tool
def there_are_documents():
    """Check if there are any documents in the RAG system"""
    # We have to exclude the sample_document.md file, which is always present in the RAG system.
    return len(uploader.get_all_documents()) > 1


@tool
def search_notes(query: str):
    """Search internal ML notes for relevant information"""
    chain = uploader.get_rag_chain()
    message = chain.invoke(query)
    return message.content


def get_tools():
    return [calculator, search_notes, todays_date, there_are_documents]
