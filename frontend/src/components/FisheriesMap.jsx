import { MapContainer, TileLayer, useMap } from "react-leaflet"
import { useEffect, useState } from "react"
import L from "leaflet"
import "leaflet.heat"
import FleetStats from "./FleetStats"
import RadarLayer from "./RadarLayer"
import HeatLegend from "./HeatLegend"
import MapLegend from "./MapLegend"

/* ================= HEATMAP LAYER ================= */

function HeatLayer({ points }) {

  const map = useMap()

  useEffect(() => {

    if (!points.length) return

    const heatData = points.map(p => [
      p.latitude,
      p.longitude,
      p.fishing_hours || 1
    ])

    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 6,
      gradient:{
        0.2:"blue",
        0.4:"cyan",
        0.6:"yellow",
        0.8:"orange",
        1.0:"red"
      }
    }).addTo(map)

    return () => map.removeLayer(heat)

  }, [points, map])

  return null
}

/* ================= VESSEL ANIMATION ================= */

function VesselLayer({ points }) {

  const map = useMap()

  useEffect(() => {

    if (!points.length) return

    const shipIcon = L.icon({
      iconUrl:"https://cdn-icons-png.flaticon.com/512/68/68194.png",
      iconSize:[18,18],
      iconAnchor:[14,14]
    })

    const vessels = points.slice(0,120).map(p => {

      const marker = L.marker(
        [p.latitude,p.longitude],
        { icon: shipIcon }
      ).addTo(map)

      const interval = setInterval(()=>{

        const lat = p.latitude + (Math.random()*0.2 - 0.1)
        const lon = p.longitude + (Math.random()*0.2 - 0.1)

        marker.setLatLng([lat,lon])

      },2000)

      marker._interval = interval

      return marker

    })

    return ()=>{

      vessels.forEach(v=>{
        clearInterval(v._interval)
        map.removeLayer(v)
      })

    }

  },[points,map])

  return null
}

/* ================= BIODIVERSITY HOTSPOTS ================= */

function BiodiversityLayer() {

  const map = useMap()

  useEffect(()=>{

    const hotspots = [
      [15,75],     // Indian Ocean
      [-20,150],   // Coral Sea
      [30,-40],    // Atlantic
      [10,-90]     // Pacific
    ]

    const layers = hotspots.map(h =>
      L.circle(h,{
        radius:500000,
        color:"lime",
        fillOpacity:0.15
      }).addTo(map)
    )

    return ()=> layers.forEach(l=>map.removeLayer(l))

  },[map])

  return null
}
/*===================== Protected Zone ================ */

function ProtectedZones() {

  const map = useMap()

  useEffect(()=>{

    const zones = [
      [-15, 145],  // Great Barrier Reef
      [5, -140],   // Pacific MPA
      [-20, 70],   // Indian Ocean zone
      [30, -40]    // Atlantic zone
    ]

    const layers = zones.map(z =>
      L.circle(z,{
        radius:700000,
        color:"red",
        fillOpacity:0.2
      }).addTo(map)
    )

    return ()=> layers.forEach(l=>map.removeLayer(l))

  },[map])

  return null
}

/* =================== SpeciesHotSpots =============== */

function SpeciesHotspots() {

  const map = useMap()

  useEffect(()=>{

    const speciesZones = [
      {coords:[55,-160], name:"Salmon Zone"},
      {coords:[10,80], name:"Tuna Zone"},
      {coords:[60,-150], name:"Crab Fisheries"},
      {coords:[42,-65], name:"Lobster Region"}
    ]

    const layers = speciesZones.map(s =>
      L.circleMarker(s.coords,{
        radius:10,
        color:"BLUE",
        fillOpacity:0.8
      })
      .bindPopup(s.name)
      .addTo(map)
    )

    return ()=> layers.forEach(l=>map.removeLayer(l))

  },[map])

  return null
}

/* ================= MAIN COMPONENT ================= */

function FisheriesMap() {

  const [points,setPoints] = useState([])
  const [year,setYear] = useState(2023)

    useEffect(()=>{

    fetch(`http://localhost:8000/fisheries/fisheries/fishing-effort?year=${year}`)
    .then(res=>res.json())
    .then(data=>setPoints(data))

    },[year])

    return (

    <div>

        <h2>Fishing Intelligence Map</h2>

        {/* Fleet Statistics */}
        <FleetStats points={points} />

        {/* YEAR SLIDER */}

        <div style={{marginBottom:"20px"}}>

        <label style={{marginRight:"10px"}}>
            Activity Year: {year}
        </label>

        <input
            type="range"
            min="2015"
            max="2023"
            value={year}
            onChange={(e)=>setYear(e.target.value)}
            onWheel={(e) => {
            e.preventDefault()

            if (e.deltaY < 0) {
            setYear((y) => Math.min(2023, y + 1))
            } else {
            setYear((y) => Math.max(2015, y - 1))
            }
        }}
        />

        </div>

      <MapContainer
        center={[0,0]}
        zoom={2}
        style={{height:"520px",width:"100%"}}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fishing Heatmap */}
        <HeatLayer points={points} />

        {/* Moving Ship Icons */}
        <VesselLayer points={points} />

        {/* Biodiversity Hotspots */}
        <BiodiversityLayer />

        {/* Radar Scan */}
        <RadarLayer />

        {/* Marine Protected Zones */}
        <ProtectedZones />

        {/* Heatmap Legend */}
        <HeatLegend />

        {/* Heatmap Legend */}
        <SpeciesHotspots />

        {/* Map Explanation */}
        <MapLegend />

      </MapContainer>

    </div>

  )
}

export default FisheriesMap