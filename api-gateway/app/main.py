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

app.include_router(ocean.router, prefix="/ocean", tags=["Ocean"])
app.include_router(fisheries.router, prefix="/fisheries", tags=["Fisheries"])
app.include_router(biodiversity.router, prefix="/biodiversity", tags=["Biodiversity"])

@app.post("/chat")
async def chat_proxy(request: Request):
    try:
        body = await request.json()
    except:
        body = {}

    try:
        chatbot_payload = {
            "question": body.get("question", "string"),
            "session_id": body.get("session_id", "string")
        }

        response = requests.post(
            "http://marine-chatbot:8001/chat",
            json=chatbot_payload,
            timeout=10
        )

        return response.json()

    except Exception as e:
        return {"error": str(e)}
