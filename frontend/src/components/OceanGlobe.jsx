import Globe from "react-globe.gl"
import { useEffect, useState, useRef } from "react"

function OceanGlobe(){

  const globeRef = useRef()

  const [points,setPoints] = useState([])
  const [arcs,setArcs] = useState([])
  const [sensors,setSensors] = useState([])

  const HEIGHT = 800

  useEffect(()=>{

    fetch("http://localhost:8000/fisheries/fisheries/fishing-effort")
    .then(res=>res.json())
    .then(data=>{

      const pts = data.slice(0,450).map(p=>({
        lat:p.latitude,
        lng:p.longitude,
        size:Math.max(p.fishing_hours,1)
      }))

      setPoints(pts)

      const routes = pts.slice(0,80).map(p=>({
        startLat:p.lat,
        startLng:p.lng,
        endLat:p.lat+(Math.random()*20-10),
        endLng:p.lng+(Math.random()*20-10)
      }))

      setArcs(routes)

      const oceanSensors = [
        {lat:15,lng:75},
        {lat:-10,lng:150},
        {lat:30,lng:-40},
        {lat:0,lng:-90},
        {lat:20,lng:120}
      ]

      setSensors(oceanSensors)

    })

  },[])


  useEffect(()=>{

    if(globeRef.current){

      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.35

      globeRef.current.pointOfView({
        lat:10,
        lng:80,
        altitude:1.8
      })

    }

  },[])



  return(

    <div style={{width:"100%"}}>

      {/* Legend */}

      <div
        style={{
          display:"flex",
          gap:"30px",
          marginBottom:"18px",
          background:"#020617",
          border:"1px solid #334155",
          borderRadius:"12px",
          padding:"12px 20px",
          color:"white",
          fontSize:"14px",
          alignItems:"center",
          justifyContent:"center"
        }}
      >

        <div style={{fontWeight:"bold"}}>Globe Layers</div>

        <div>
          <span style={{color:"#ffb300"}}>●</span> Vessels
        </div>

        <div>
          <span style={{color:"#00e5ff"}}>—</span> High Fishing Activity
        </div>

        <div>
          <span style={{color:"#00ff90"}}>◯</span> Marine, Biodiversity Zones
        </div>

        <div>
          🌍 Marine Intelligence Globe
        </div>

      </div>


      {/* Globe */}

      <div
        style={{
          width:"100%",
          height:"900px",
          borderRadius:"18px",
          overflow:"hidden",
          background:"#000"
        }}
      >

        <Globe
          ref={globeRef}

          width={window.innerWidth * 0.8}
          height={HEIGHT}

          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0}
          pointRadius={0.40}
          pointColor={() => "#ffb60a"}

          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ["#00e5ff","#2979ff"]}
          arcDashLength={0.45}
          arcDashGap={0.25}
          arcDashAnimateTime={3000}

          ringsData={sensors}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => "#00ff90"}
          ringMaxRadius={4}
          ringPropagationSpeed={1}
          ringRepeatPeriod={2000}

          atmosphereColor="lightskyblue"
          atmosphereAltitude={0.22}
        />

      </div>

    </div>

  )

}

export default OceanGlobe