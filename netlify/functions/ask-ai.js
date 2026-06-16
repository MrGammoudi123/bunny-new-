const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "method" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const clean = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1000)
      }));

    if (!clean.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "bad_request" })
      };
    }

    const systemPrompt = {
      role: "system",
      content: `You are Pocket Bunny, a warm, cute, short, supportive companion.
Reply in 2-4 short sentences maximum.
Be respectful, not creepy, not dramatic.
Do not give medical or therapy advice.`
    };

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [systemPrompt, ...clean]
      })
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "ollama_error" })
      };
    }

    const data = await response.json();
    const reply = data?.message?.content?.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: reply || "Bunny is quiet right now 🐰"
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "sleeping" })
    };
  }
};
