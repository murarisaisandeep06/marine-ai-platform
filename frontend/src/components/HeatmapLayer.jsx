import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.heat"

function HeatmapLayer({ data }) {

  const map = useMap()

  useEffect(() => {

    if (!data || data.length === 0) return

    const points = data.map(d => [
      d.latitude,
      d.longitude,
      0.5
    ])

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 5
    }).addTo(map)

    return () => {
      map.removeLayer(heat)
    }

  }, [data, map])

  return null
}

export default HeatmapLayer