import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function BiodiversityDashboard(){

const [hotspots,setHotspots] = useState([])
const [species,setSpecies] = useState([])
const [families,setFamilies] = useState([])
const [search,setSearch] = useState("")
const [filtered,setFiltered] = useState([])

useEffect(()=>{

fetch("http://localhost:8000/biodiversity/biodiversity/hotspots")
.then(res=>res.json())
.then(data=>setHotspots(data))

fetch("http://localhost:8000/biodiversity/biodiversity/species")
.then(res=>res.json())
.then(data=>{

setSpecies(data)
setFiltered(data)

const famCount = {}

data.forEach(s=>{
if(!famCount[s.family]) famCount[s.family]=0
famCount[s.family]+=1
})

const famArr = Object.keys(famCount).map(k=>({
family:k,
count:famCount[k]
}))

famArr.sort((a,b)=>b.count-a.count)

setFamilies(famArr.slice(0,6))

})

},[])


const handleSearch=(e)=>{

const value=e.target.value
setSearch(value)

const res=species.filter(s=>
s.species?.toLowerCase().includes(value.toLowerCase()) ||
s.common_name?.toLowerCase().includes(value.toLowerCase()) ||
s.family?.toLowerCase().includes(value.toLowerCase())
)

setFiltered(res)

}

const colors=["#06b6d4","#22c55e","#f59e0b","#ef4444","#8b5cf6","#14b8a6"]

const totalCountries = new Set(species.map(s=>s.country)).size

return(

<div>


{/* METRIC CARDS */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"20px",
marginBottom:"30px"
}}>

{[
{title:"Total Species",value:species.length},
{title:"Marine Families",value:families.length},
{title:"Countries",value:totalCountries},
{title:"Hotspot Regions",value:hotspots.length}
].map((card,i)=>(

<div key={i} style={{
background:"#0f172a",
padding:"20px",
borderRadius:"12px"
}}>

<p style={{color:"#94a3b8",fontSize:"14px"}}>
{card.title}
</p>

<h2 style={{marginTop:"5px"}}>
{card.value}
</h2>

</div>

))}

</div>



{/* FULL WIDTH MAP */}

<div style={{
background:"#0f172a",
borderRadius:"12px",
padding:"20px",
marginBottom:"30px"
}}>

<h3 style={{marginBottom:"10px"}}>
Global Species Distribution
</h3>

<MapContainer
center={[0,0]}
zoom={2}
scrollWheelZoom={true}
style={{height:"550px",borderRadius:"10px"}}
>

<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

{filtered.slice(0,1500).map((s,i)=>(

<CircleMarker
key={i}
center={[s.latitude,s.longitude]}
radius={4}
color="#06b6d4"
>

<Popup>

<b>{s.common_name || "Unknown"}</b><br/>
{s.species}<br/>
{s.family}

</Popup>

</CircleMarker>

))}

</MapContainer>

</div>



{/* SPECIES TABLE */}

{/* TABLE */}

<div style={{
marginTop:"30px",
background:"#0f172a",
borderRadius:"12px",
padding:"20px"
}}>

{/* HEADER */}



<h3 style={{fontSize:"18px", marginBottom:"15px"}}>
Species Table
</h3>

<input
value={search}
onChange={handleSearch}
placeholder="Search species..."
style={{
padding:"12px 14px",
width:"100%",
borderRadius:"8px",
border:"1px solid #334155",
background:"#020617",
color:"white",
outline:"none",
marginBottom:"15px"
}}
/>




{/* TABLE BODY */}

<div style={{
maxHeight:"380px",
overflowY:"auto",
borderRadius:"10px"
}}>

<table style={{
width:"100%",
borderCollapse:"collapse",
fontSize:"14px"
}}>

<thead
style={{
position:"sticky",
top:0,
background:"#0f172a",
zIndex:2
}}
>

<tr style={{
borderBottom:"1px solid #334155",
color:"#94a3b8",
textTransform:"uppercase",
fontSize:"12px",
letterSpacing:"1px"
}}>

<th style={{textAlign:"left",padding:"14px"}}>Common Name</th>
<th style={{textAlign:"left",padding:"14px"}}>Species</th>
<th style={{textAlign:"left",padding:"14px"}}>Family</th>
<th style={{textAlign:"left",padding:"14px"}}>Country</th>

</tr>

</thead>

<tbody>

{filtered.slice(0,100).map((s,i)=>(

<tr
key={i}
style={{
borderBottom:"1px solid #1e293b",
transition:"background 0.2s"
}}
onMouseEnter={(e)=>e.currentTarget.style.background="#1e293b"}
onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
>

<td style={{padding:"14px"}}>{s.common_name || "Unknown"}</td>
<td style={{padding:"14px",color:"#38bdf8"}}>{s.species}</td>
<td style={{padding:"14px"}}>{s.family}</td>
<td style={{padding:"14px"}}>{s.country}</td>

</tr>

))}

</tbody>

</table>

</div>

</div>



{/* CHARTS SECTION */}

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px",
marginTop:"30px"
}}>


{/* HOTSPOTS */}

<div style={{
background:"#0f172a",
borderRadius:"12px",
padding:"20px"
}}>

<h3>Biodiversity Hotspots</h3>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={hotspots}>

<XAxis
  dataKey="country"
  stroke="#cbd5f5"
  interval={0}
  textAnchor="end"
  height={50}
  tick={{ fill:"#cbd5f5", fontSize:12}}
/>
<YAxis stroke="#94a3b8"/>

<Tooltip
contentStyle={{
background:"#020617",
border:"1px solid #334155",
borderRadius:"8px",
color:"white"
}}
labelStyle={{
color:"#94a3b8"
}}
cursor={{fill:"rgba(56, 191, 248, 0)"}}
/>

<Bar dataKey="species_count" fill="#06b6d4"/>

</BarChart>

</ResponsiveContainer>

</div>



{/* FAMILY PIE */}

<div style={{
background:"#0f172a",
borderRadius:"12px",
padding:"20px"
}}>

<h3>Top Marine Families</h3>

<ResponsiveContainer width="100%" height={300}>

<PieChart>

<Pie
data={families}
dataKey="count"
nameKey="family"
outerRadius={110}
label={({ count }) => (count)} 
>

{families.map((entry,index)=>(
<Cell key={index} fill={colors[index%colors.length]}/>
))}

</Pie>

<Tooltip
contentStyle={{
background:"#020617",
border:"1px solid #334155",
borderRadius:"8px",
color:"#ffffff"
}}
itemStyle={{
color:"#ffffff"
}}
labelStyle={{
color:"#38bdf8"
}}
formatter={(value,name)=>[`${name}: ${value}`]}
/>

</PieChart>

</ResponsiveContainer>

</div>

</div>


</div>

)

}

export default BiodiversityDashboard