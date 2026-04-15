function MapLegend() {

  return (

    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "#9e9e9e",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #334155",
        color: "white",
        fontSize: "13px",
        width: "200px",
        zIndex: 1000
      }}
    >

      <b>Map Layers</b>

      <div style={{marginTop:"8px"}}>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
          <div style={{width:"12px",height:"12px",background:"blue",borderRadius:"50%"}}></div>
          Species Hotspots
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
          <div style={{width:"12px",height:"12px",background:"lime",borderRadius:"50%"}}></div>
          Biodiversity Hotspot
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
          <div style={{width:"12px",height:"12px",border:"2px solid red",borderRadius:"50%"}}></div>
          Marine Protected Zone
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
          <div style={{width:"12px",height:"12px",border:"2px solid cyan",borderRadius:"50%"}}></div>
          Radar Surveillance
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/68/68194.png"
            width="14"
          />
          Fishing Vessel
        </div>

      </div>

    </div>

  )
}

export default MapLegend