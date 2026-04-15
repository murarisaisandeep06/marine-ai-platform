import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

function HeatLegend(){

  const map = useMap()

  useEffect(()=>{

    const legend = L.control({position:"bottomright"})

    legend.onAdd = function(){

      const div = L.DomUtil.create("div","legend")

      div.innerHTML = `
        <div style="
          background:#111827;
          padding:10px;
          border-radius:8px;
          color:white;
          font-size:12px">
          
          <b>Fishing Activity</b>

          <div style="display:flex;height:10px;margin-top:6px">
            <div style="flex:1;background:blue"></div>
            <div style="flex:1;background:cyan"></div>
            <div style="flex:1;background:yellow"></div>
            <div style="flex:1;background:orange"></div>
            <div style="flex:1;background:red"></div>
          </div>

          <div style="font-size:11px;margin-top:4px">
            Low → High
          </div>

        </div>
      `

      return div
    }

    legend.addTo(map)

    return ()=> map.removeControl(legend)

  },[map])

  return null
}

export default HeatLegend