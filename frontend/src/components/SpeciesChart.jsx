import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function SpeciesChart({data}){

const familyCounts = {}

data.forEach(s=>{
  if(!familyCounts[s.family]){
    familyCounts[s.family] = 0
  }
  familyCounts[s.family]++
})

const chartData = Object.keys(familyCounts).map(f=>({
  family:f,
  count:familyCounts[f]
}))

return(

<div style={{
  background:"#020617",
  padding:"20px",
  borderRadius:"10px",
  marginTop:"30px"
}}>

<h2>📊 Species Family Distribution</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={chartData}>

<XAxis dataKey="family" />
<YAxis />
<Tooltip />

<Bar dataKey="count" />

</BarChart>

</ResponsiveContainer>

</div>

)

}

export default SpeciesChart