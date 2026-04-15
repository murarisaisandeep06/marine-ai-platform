function FleetStats({points}){

  return (

    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(3,1fr)",
      gap:"20px",
      marginBottom:"20px"
    }}>

      <div style={card}>
        <h3>{points.length}</h3>
        <p>Active Vessels</p>
      </div>

      <div style={card}>
        <h3>{Math.round(points.length/50)}</h3>
        <p>Fishing Zones</p>
      </div>

      <div style={card}>
        <h3>{Math.round(points.length/150)}</h3>
        <p>High Activity Regions</p>
      </div>

    </div>

  )
}

const card = {
  background:"#111827",
  padding:"20px",
  borderRadius:"12px"
}

export default FleetStats