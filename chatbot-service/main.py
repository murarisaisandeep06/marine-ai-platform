from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from sqlalchemy import create_engine, text

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
# CONFIG
# ======================================

OLLAMA_URL = "http://ollama:11434/api/generate"
MODEL_NAME = "phi"

DATABASE_URL = "postgresql://marine:marine123@postgres:5432/marine_db"
engine = create_engine(DATABASE_URL)

# ======================================
# SIMPLE IN-MEMORY SESSION MEMORY
# ======================================

conversation_memory = {}

def get_memory(session_id: str):
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []
    return conversation_memory[session_id]

# ======================================
# LLM FUNCTION
# ======================================

def ask_llm(prompt):
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 200}
    }

    response = requests.post(OLLAMA_URL, json=payload)
    data = response.json()

    return data.get("response", str(data))

# ======================================
# REQUEST MODEL
# ======================================

class ChatRequest(BaseModel):
    question: str
    session_id: str

# ======================================
# CHAT ENDPOINT
# ======================================

@app.post("/chat")
def chat(request: ChatRequest):
    question = request.question.strip()
    session_id = request.session_id
    memory = get_memory(session_id)

    # ----------------------------------
    # SQL KEYWORD DETECTION
    # ----------------------------------

    keywords = [
        "show", "list", "get", "data",
        "temperature", "salinity", "depth",
        "species", "catch", "region", "year"
    ]

    decision = "SQL" if any(word in question.lower() for word in keywords) else "GENERAL"

    # ==================================
    # SQL BRANCH
    # ==================================

    if decision == "SQL":

        history_context = "\n".join(memory[-5:])

        sql_prompt = f"""
You are a PostgreSQL expert.

Conversation History:
{history_context}

Current User Question:
{question}

STRICT RULES:
- Always generate valid SQL.
- Never output empty SELECT.
- Always include table name.
- If previous message mentioned a region like "Indian Ocean",
  reuse that region context.
- Always include LIMIT 100.
- Output ONLY raw SQL.
- No explanation.

Tables:

ocean_data(id, latitude, longitude, temperature, salinity, depth)
fisheries_data(id, species, region, catch_volume, year)
biodiversity_data(id, species_detected, region, confidence_score)
"""

        sql_query = ask_llm(sql_prompt)

        # Clean SQL
        sql_query = sql_query.strip()
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
        sql_query = sql_query.split("\n")[0]

        # Ensure valid structure
        if "select" not in sql_query.lower() or "from" not in sql_query.lower():
            return {
                "error": "Invalid SQL generated",
                "generated_query": sql_query
            }

        if "limit" not in sql_query.lower():
            sql_query = sql_query.rstrip(";") + " LIMIT 100;"

        try:
            with engine.connect() as conn:
                result = conn.execute(text(sql_query))
                rows = result.fetchall()

            explanation_prompt = f"""
Conversation History:
{history_context}

User Question:
{question}

Database Result:
{rows}

Provide a short scientific explanation.
"""

            final_answer = ask_llm(explanation_prompt)

            # Store memory
            memory.append(f"User: {question}")
            memory.append(f"AI: {final_answer}")

            return {
                "type": "SQL",
                "generated_query": sql_query,
                "result_count": len(rows),
                "result": rows,
                "answer": final_answer
            }

        except Exception as e:
            return {
                "error": str(e),
                "generated_query": sql_query
            }

    # ==================================
    # GENERAL BRANCH
    # ==================================

    else:
        history_context = "\n".join(memory[-5:])

        prompt = f"""
Conversation History:
{history_context}

User: {question}
"""

        answer = ask_llm(prompt)

        memory.append(f"User: {question}")
        memory.append(f"AI: {answer}")

        return {
            "type": "GENERAL",
            "answer": answer
        }