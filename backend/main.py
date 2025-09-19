from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os

# Define request schema
class Query(BaseModel):
    text: str
    action: str

# Define available actions to avoid magic strings
LLM_ACTIONS = [
    {"id": "summarize", "label": "Summarize"},
    {"id": "explain", "label": "Explain"},
    {"id": "code_snippet", "label": "Code Snippet"}
]

app = FastAPI()

# ✅ Allow requests from Chrome extension + localhost
# For a production application, you would lock this down to your extension's ID.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/llm")
def process_query(query: Query):
    """
    Simple rule-based backend. This is where you would integrate an LLM later.
    """
    text = query.text.strip()
    action = query.action

    # Placeholder logic for now
    if action == "summarize":
        answer = f"Summary: '{text[:50]}...' (truncated)"
    elif action == "explain":
        answer = f"Explanation: The phrase '{text}' seems important."
    elif action == "code_snippet":
        answer = f"Code snippet for '{text}' coming soon!"
    else:
        # Fallback for unrecognized actions
        answer = f"Action '{action}' not recognized. Text: {text}"
    
    # ✅ Send back available actions along with the answer
    return {
        "answer": answer,
        "actions": LLM_ACTIONS,
    }
