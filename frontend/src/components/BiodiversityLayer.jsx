import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

function BiodiversityLayer() {

  const map = useMap()

  useEffect(()=>{

    const spots = [
      [15,75],
      [-20,150],
      [30,-40]
    ]

    const markers = spots.map(s =>
      L.circle(s,{
        radius:400000,
        color:"lime"
      }).addTo(map)
    )

    return ()=> markers.forEach(m=>map.removeLayer(m))

  },[map])

  return null
}

export default BiodiversityLayer