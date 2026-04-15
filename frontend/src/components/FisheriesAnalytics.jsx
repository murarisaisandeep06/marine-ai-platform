import { useEffect, useState } from "react"
import axios from "axios"
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts"

function FisheriesAnalytics() {

  const [capture,setCapture] = useState([])
  const [species,setSpecies] = useState([])

  const [speciesValue,setSpeciesValue] = useState([])
  const [topSpecies,setTopSpecies] = useState([])
  const [yearTrend,setYearTrend] = useState([])

  const [captureSearch,setCaptureSearch] = useState("")
  const [speciesSearch,setSpeciesSearch] = useState("")

  useEffect(() => {

  api.get("/fisheries/fisheries/capture")
    .then(res => setCapture(res.data));

  api.get("/fisheries/fisheries/species")
    .then(res => setSpecies(res.data));

  api.get("/fisheries/fisheries/species-value")
    .then(res => setSpeciesValue(res.data));

  api.get("/fisheries/fisheries/top-species")
    .then(res => setTopSpecies(res.data));

  api.get("/fisheries/fisheries/yearly-catch")
    .then(res => setYearTrend(res.data));

}, []);


  const filteredCapture = capture.filter(c =>
    c.country?.toLowerCase().includes(captureSearch.toLowerCase())
  )


  const filteredSpecies = speciesValue.filter(s =>
    s.species?.toLowerCase().includes(speciesSearch.toLowerCase())
  )


  const topCountries = [...capture]
    .sort((a,b)=>b["2023"]-a["2023"])
    .slice(0,10)

  const formattedSpecies = topSpecies.map(s => ({
    ...s,
    species: s.species.replace(",", "").substring(0,14)
    }))

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#eab308",
    "#a855f7",
    "#14b8a6",
    "#ef4444",
    "#6366f1"
  ]


  return (

    <div style={{marginTop:"40px"}}>


      {/* EXISTING CHARTS */}

      
      {/* CHART SECTION */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"30px",
        marginBottom:"40px"
      }}>

        {/* BAR CHART */}

        <div style={{
          background:"#111827",
          padding:"25px",
          borderRadius:"15px"
        }}>

          <h3 style={{marginBottom:"15px"}}>Top Fishing Countries</h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart
              data={topCountries}
              margin={{ top:20, right:20, left:40, bottom:20 }}
            >

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis
                dataKey="country"
                stroke="#cbd5f5"
                interval={0}
                textAnchor="end"
                height={20}
                tick={{ fill:"#cbd5f5", fontSize:12 }}
                tickFormatter={(value) =>
                value.length > 9 ? value.substring(0,12) + "..." : value
            }
              />

              <YAxis
                stroke="#cbd5f5"
                tick={{fill:"#cbd5f5"}}
                tickFormatter={(value)=>value.toLocaleString()}
              />

              <Tooltip
                cursor={{fill:"transparent"}}
                contentStyle={{
                  background:"#020617",
                  border:"1px solid #334155",
                  borderRadius:"8px",
                  color:"white"
                }}
                formatter={(value)=>Number(value).toLocaleString()}
              />

              <Bar
                dataKey="2023"
                fill="#3b82f6"
                radius={[6,6,0,0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* REPLACED PIE CHART WITH REAL DATA */}

        <div style={{
          background:"#111827",
          padding:"25px",
          borderRadius:"15px"
        }}>

          <h3>Fish Species Economic Value</h3>

            <ResponsiveContainer width="100%" height={280}>

            <PieChart>

            <Pie
            data={speciesValue}
            dataKey="value"
            nameKey="species"
            outerRadius={90}
            label={({ value }) => (value/1000000).toFixed(0) + "M"}
            >

            {speciesValue.map((entry,index)=>(
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}

            </Pie>

            <Tooltip
            contentStyle={{
                background:"#020617",
                border:"1px solid #334155",
                borderRadius:"8px"
            }}
            itemStyle={{color:"white"}}
            />

            </PieChart>

            </ResponsiveContainer>

        </div>

      </div>



      {/* EXISTING SEARCH */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"30px",
        marginBottom:"40px"
      }}>



        {/* KEEP THIS */}

        <div style={{
          background:"#111827",
          padding:"25px",
          borderRadius:"15px"
        }}>

          <h3>Search Fish Capture by Country</h3>

          <input
            placeholder="Search country..."
            value={captureSearch}
            onChange={(e)=>setCaptureSearch(e.target.value)}
            style={{
              marginTop:"10px",
              padding:"10px",
              width:"100%",
              borderRadius:"6px",
              border:"1px solid #334155",
              background:"#020617",
              color:"white"
            }}
          />

          <table style={{width:"100%",marginTop:"15px"}}>

            <thead>
              <tr>
                <th align="left">Country</th>
                <th align="left">Average Catch</th>
              </tr>
            </thead>

            <tbody>

              {filteredCapture.slice(0,8).map((c,i)=>(
                <tr key={i}>
                  <td>{c.country}</td>
                  <td>{Number(c["2023"]).toLocaleString()}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>



        {/* UPDATED SPECIES SEARCH */}

        <div style={{
          background:"#111827",
          padding:"25px",
          borderRadius:"15px"
        }}>

          <h3>Search Marine Species</h3>

          <input
            placeholder="Search species..."
            value={speciesSearch}
            onChange={(e)=>{

            const value = e.target.value
            setSpeciesSearch(value)

            if(value.length >= 2){

                api.get(`/fisheries/fisheries/species-search?q=${value}`)
                .then(res=>{
                    setSpeciesValue(res.data)
                })

            }

            }}
            style={{
              marginTop:"10px",
              padding:"10px",
              width:"100%",
              borderRadius:"6px",
              border:"1px solid #334155",
              background:"#020617",
              color:"white"
            }}
          />

          <table style={{width:"100%",marginTop:"15px"}}>

            <thead>
              <tr>
                <th align="left">Species</th>
                <th align="left">Total Catch</th>
              </tr>
            </thead>

            <tbody>

              {filteredSpecies.map((s,i)=>(
                <tr key={i}>
                <td>{s.species}</td>
                <td>{Number(s.value).toLocaleString()}</td>
                </tr>
                ))}

            </tbody>

          </table>

        </div>

      </div>



      {/* NEW CHARTS */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"30px"
      }}>


        {/* TOP SPECIES */}

        <div style={{
          background:"#111827",
          padding:"25px",
          borderRadius:"15px"
        }}>

          <h3 style={{marginBottom:"15px"}}>Top Fishing Species</h3>

            <ResponsiveContainer width="100%" height={280}>
            
            <BarChart
            data={formattedSpecies}
            margin={{ top:20, right:20, left:70, bottom:20 }}
            >

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis
            dataKey="species"
            stroke="#cbd5f5"
            interval={0}
            height={40}
            tick={{ fill:"#cbd5f5", fontSize:11 }}
            tickFormatter={(value) =>
                value.length > 9 ? value.substring(0,9) + "..." : value
            }
            />

            <YAxis
            stroke="#cbd5f5"
            tick={{fill:"#cbd5f5"}}
            tickFormatter={(v)=>v.toLocaleString()}
            />

            <Tooltip
            cursor={{fill:"transparent"}}
            contentStyle={{
            background:"#020617",
            border:"1px solid #334155",
            borderRadius:"8px"
            }}
            formatter={(v)=>Number(v).toLocaleString()}
            />

            <Bar
            dataKey="catch"
            fill="#22c55e"
            radius={[6,6,0,0]}
            />

            </BarChart>

            </ResponsiveContainer>

        </div>



        {/* YEAR TREND */}
        
        <div style={{
          background:"#111827",
          padding:"25px",
          borderRadius:"15px"
        }}>

          <h3 style={{marginBottom:"15px"}}>Catch Trend by Year</h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart
            data={yearTrend}
            margin={{ top:20, right:20, left:70, bottom:20 }}
            >

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis
            dataKey="year"
            stroke="#cbd5f5"
            tick={{fill:"#cbd5f5"}}
            />

            <YAxis
            stroke="#cbd5f5"
            tick={{fill:"#cbd5f5"}}
            tickFormatter={(v)=>v.toLocaleString()}
            />

            <Tooltip
            cursor={{fill:"transparent"}}
            contentStyle={{
            background:"#020617",
            border:"1px solid #334155",
            borderRadius:"8px"
            }}
            formatter={(v)=>Number(v).toLocaleString()}
            />

            <Bar
            dataKey="catch"
            fill="#f97316"
            radius={[6,6,0,0]}
            />

            </BarChart>

            </ResponsiveContainer>

        </div>


      </div>

    </div>

  )
}

export default FisheriesAnalytics