from fastapi import FastAPI
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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(ocean.router, prefix="/ocean", tags=["Ocean"])
app.include_router(fisheries.router, prefix="/fisheries", tags=["Fisheries"])
app.include_router(biodiversity.router, prefix="/biodiversity", tags=["Biodiversity"])