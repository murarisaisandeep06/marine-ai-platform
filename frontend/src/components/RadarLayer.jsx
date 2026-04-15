import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

function RadarLayer(){

  const map = useMap()

  useEffect(()=>{

    const center = [0,0]

    const radar = L.circle(center,{
      radius:2000000,
      color:"#00ffff",
      weight:1,
      fillOpacity:0
    }).addTo(map)

    let r = 2000000

    const anim = setInterval(()=>{

      r += 500000
      if(r > 6000000) r = 2000000

      radar.setRadius(r)

    },700)

    return ()=>{
      clearInterval(anim)
      map.removeLayer(radar)
    }

  },[map])

  return null
}

export default RadarLayer