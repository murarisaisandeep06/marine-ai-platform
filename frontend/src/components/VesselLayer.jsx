import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

function VesselLayer({ points }) {

  const map = useMap()

  useEffect(() => {

    const vessels = points.slice(0,200).map(p => {

      const marker = L.circleMarker(
        [p.latitude, p.longitude],
        { radius:3, color:"white" }
      ).addTo(map)

      setInterval(()=>{

        const lat = p.latitude + (Math.random()*0.2 - 0.1)
        const lon = p.longitude + (Math.random()*0.2 - 0.1)

        marker.setLatLng([lat,lon])

      },2000)

      return marker

    })

    return () => vessels.forEach(v=>map.removeLayer(v))

  },[points,map])

  return null
}

export default VesselLayer