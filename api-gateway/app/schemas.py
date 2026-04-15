from pydantic import BaseModel

class OceanDataCreate(BaseModel):
    region: str
    latitude: float
    longitude: float
    temperature: float
    salinity: float
    depth: float


class FisheriesCreate(BaseModel):
    species: str
    region: str
    catch_volume: float
    year: int


class BiodiversityCreate(BaseModel):
    species_detected: str
    region: str
    confidence_score: float