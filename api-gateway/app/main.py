from fastapi import FastAPI, Request
import requests
from .database import engine
from . import models
from .routers import ocean
from .routers import fisheries
from fastapi.middleware.cors import CORSMiddleware
from app.routers import biodiversity

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marine AI API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocean.router)
app.include_router(fisheries.router, prefix="/fisheries", tags=["Fisheries"])
app.include_router(biodiversity.router, prefix="/biodiversity", tags=["Biodiversity"])

@app.post("/chat")
@app.post("/chat")
async def chat_proxy(request: Request):
    try:
        body = await request.json()
    except:
        body = {}

    chatbot_payload = {
        "question": body.get("question", ""),
        "session_id": body.get("session_id", "default")
    }

    try:
        response = requests.post(
            "https://marine-chatbot.onrender.com/chat",
            json=chatbot_payload,
            timeout=30   # ⬅️ increase timeout
        )

        # ✅ DEBUG LOGS (important)
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)

        # ✅ SAFE JSON PARSE
        if response.status_code == 200:
            try:
                return response.json()
            except:
                return {"error": "Invalid JSON from chatbot", "raw": response.text}

        return {
            "error": "Chatbot returned error",
            "status": response.status_code,
            "raw": response.text
        }

    except Exception as e:
        return {
            "error": "Chatbot request failed",
            "details": str(e)
        }
