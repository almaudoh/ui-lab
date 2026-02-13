from langchain.agents import create_agent
from app.llm import get_llm

# from app.memory import get_memory
from app.tools import get_tools


def get_agent():

    print("file", __file__)

    return create_agent(
        model=get_llm(),
        tools=get_tools(),
        system_prompt=(
            "You are a helpful assistant. Use the knowledge_base tool when needed."
        ),
    )
