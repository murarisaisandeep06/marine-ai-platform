from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import SessionLocal
from .. import models, schemas
from sqlalchemy.sql import func

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_ocean_data(data: schemas.OceanDataCreate, db: Session = Depends(get_db)):
    db_data = models.OceanData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data


@router.get("/")
def get_ocean_data(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    limit: int = Query(1000, le=50000),
    db: Session = Depends(get_db)
):

    # 🔹 If lat & lon provided → return nearest point
    if lat is not None and lon is not None:

        point = (
            db.query(models.OceanData)
            .order_by(
                func.pow(models.OceanData.latitude - lat, 2) +
                func.pow(models.OceanData.longitude - lon, 2)
            )
            .first()
        )

        return [point] if point else []

    # 🔹 Otherwise return random sample
    return (
        db.query(models.OceanData)
        .order_by(func.random())
        .limit(limit)
        .all()
    )
    
@router.get("/stats")
def get_ocean_stats(db: Session = Depends(get_db)):

    total = db.query(func.count(models.OceanData.id)).scalar()

    avg_temp = db.query(func.avg(models.OceanData.temperature)).scalar()
    max_temp = db.query(func.max(models.OceanData.temperature)).scalar()

    avg_depth = db.query(func.avg(models.OceanData.depth)).scalar()

    region_count = db.query(models.OceanData.region).distinct().count()

    return {
        "total_records": total,
        "avg_temperature": round(avg_temp, 2) if avg_temp else None,
        "max_temperature": round(max_temp, 2) if max_temp else None,
        "avg_depth": round(avg_depth, 2) if avg_depth else None,
        "region_count": region_count
    }