import { useState } from "react";
import axios from "axios";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;

    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8001/chat",
        {
            question: question,
            session_id: "marine-session-1", 
        },
        {
            headers: { "Content-Type": "application/json" },
        }
        );

      const aiMsg = {
        role: "assistant",
        content: res.data.answer || "No response.",
        type: res.data.type,
        query: res.data.generated_query,
        count: res.data.result_count,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Unable to connect to AI service." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={outerContainer}>
      <div style={chatCard}>
        <div style={header}>
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            🤖 Marine AI Assistant
          </span>
          <span style={statusDot}></span>
        </div>

        <div style={chatArea}>
          {messages.length === 0 && (
            <div style={welcomeBox}>
              🌊 Ask about temperature trends, depth patterns,
              marine regions or scientific insights.
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              style={
                msg.role === "user" ? userBubble : assistantBubble
              }
            >
              <div style={{ fontSize: "12px", opacity: 0.6 }}>
                {msg.role === "user" ? "You" : "Marine AI"}
              </div>

              <div style={{ marginTop: "6px", lineHeight: "1.6" }}>
                {msg.content}
              </div>

              {msg.type === "SQL" && (
                <div style={sqlPanel}>
                  <div><strong>Mode:</strong> SQL</div>
                  <div><strong>Results:</strong> {msg.count}</div>
                  {msg.query && (
                    <details>
                      <summary>View Generated SQL</summary>
                      <pre>{msg.query}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={assistantBubble}>
              🌊 Analyzing ocean data...
            </div>
          )}
        </div>

        <div style={inputBar}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something intelligent..."
            style={textarea}
          />
          <button onClick={askAI} style={sendButton}>
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== PREMIUM STYLES ===== */

const outerContainer = {
  height: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const chatCard = {
  width: "100%",
  maxWidth: "900px",
  height: "100%",
  background: "rgba(17, 24, 39, 0.75)",
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const header = {
  padding: "20px 25px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statusDot = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "#22c55e",
};

const chatArea = {
  flex: 1,
  overflowY: "auto",
  padding: "25px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const welcomeBox = {
  opacity: 0.5,
  fontStyle: "italic",
};

const userBubble = {
  alignSelf: "flex-end",
  background: "linear-gradient(135deg, #2563eb, #1e40af)",
  padding: "16px",
  borderRadius: "18px",
  maxWidth: "70%",
};

const assistantBubble = {
  alignSelf: "flex-start",
  background: "#1e293b",
  padding: "16px",
  borderRadius: "18px",
  maxWidth: "70%",
};

const sqlPanel = {
  marginTop: "12px",
  fontSize: "12px",
  background: "#0f172a",
  padding: "10px",
  borderRadius: "10px",
};

const inputBar = {
  display: "flex",
  gap: "10px",
  padding: "20px",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const textarea = {
  flex: 1,
  height: "55px",
  borderRadius: "14px",
  padding: "12px",
  background: "#0f172a",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  resize: "none",
};

const sendButton = {
  background: "linear-gradient(135deg, #2563eb, #1e40af)",
  border: "none",
  padding: "0 25px",
  borderRadius: "14px",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 8px 25px rgba(37,99,235,0.4)",
};

export default AIChat;