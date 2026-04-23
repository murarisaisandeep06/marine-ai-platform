from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
import requests
import os

# ======================================
# APP INIT
# ======================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================
# ENV CONFIG
# ======================================


DATABASE_URL = os.getenv("DATABASE_URL")  # 👈 set in Render
if not DATABASE_URL:
    raise Exception("DATABASE_URL not set!")
engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})

# ======================================
# MEMORY
# ======================================

conversation_memory = {}

def get_memory(session_id: str):
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []
    return conversation_memory[session_id]

# ======================================
# REQUEST MODEL
# ======================================

class ChatRequest(BaseModel):
    question: str
    session_id: str

# ======================================
# LLM FUNCTION
# ======================================

def ask_llm(prompt):
    try:
        API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"

        headers = {
            "Authorization": f"Bearer {os.getenv('HF_API_KEY')}"
        }

        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 200}
        }

        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)

        data = response.json()

        # ❗ Handle model loading
        if isinstance(data, dict) and "error" in data:
            return ""

        if isinstance(data, list):
            return data[0].get("generated_text", "")

        return str(data)

    except Exception:
        return "AI unavailable"
        
# ======================================
# CLEAN SQL
# ======================================

def clean_sql(sql):
    if not sql:
        return ""

    sql = sql.replace("```sql", "").replace("```", "").strip()
    return sql.split("\n")[0]
# ======================================
# GENERATE SQL
# ======================================

def generate_sql(question, history):
    prompt = f"""
You are a PostgreSQL expert.

Conversation History:
{history}

User Question:
{question}

Rules:
- Generate ONLY SQL
- Use correct table names
- Always include LIMIT 100
- No explanation

Tables:

ocean_data(id, latitude, longitude, temperature, salinity, depth)
marine_biodiversity(species, latitude, longitude, country)
noaa_landings(species, pounds, dollars)
fish_capture("Country Name En", "2023 value")

Return SQL only.
"""
    sql = ask_llm(prompt)
    if not sql or "error" in sql.lower():
        return ""

    return clean_sql(sql)


# ======================================
# CHAT ENDPOINT
# ======================================

@app.post("/chat")
def chat(request: ChatRequest):
    question = request.question.strip()
    session_id = request.session_id

    memory = get_memory(session_id)
    history = "\n".join(memory[-5:])

    try:
        # Decide if DB needed
        keywords = [
            "temperature", "depth", "species", "fish",
            "catch", "biodiversity", "data", "ocean"
        ]

        if any(k in question.lower() for k in keywords):

            sql_query = generate_sql(question, history)

            if not sql_query or "select" not in sql_query.lower():
                return {"error": "Invalid SQL", "query": sql_query}

            with engine.connect() as conn:
                result = conn.execute(text(sql_query))
                rows = result.fetchall()

            data = [dict(r._mapping) for r in rows]

            # Explain results
            explanation_prompt = f"""
User Question:
{question}

SQL Result:
{data}

Explain clearly in simple scientific terms.
"""

            answer = ask_llm(explanation_prompt)

            memory.append(f"User: {question}")
            memory.append(f"AI: {answer}")

            return {
                "type": "SQL",
                "query": sql_query,
                "data": data,
                "answer": answer
            }

        else:
            # General AI
            answer = ask_llm(question)

            memory.append(f"User: {question}")
            memory.append(f"AI: {answer}")

            return {
                "type": "GENERAL",
                "answer": answer
            }

    except Exception as e:
        return {"error": str(e)}
