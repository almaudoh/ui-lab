import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from app.agent import get_agent
from app.rag import uploader

load_dotenv()


app = FastAPI(title="Agentic AI Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = get_agent()
rag_chain = uploader.get_rag_chain()

add_routes(app, agent, path="/agent")
add_routes(app, rag_chain, path="/rag")


@app.get("/")
def root():
    return {"status": "AI backend running"}
