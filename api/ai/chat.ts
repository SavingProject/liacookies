/**
 * Vercel Serverless Function: /api/ai/chat
 * Handles multi-provider AI chat calls on Vercel securely using server-side Environment Variables
 * (OPENROUTER_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, OLLAMA_API_KEY, etc.)
 * without exposing API keys to the client browser.
 */

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Please use POST." });
  }

  try {
    const { provider, messages, config } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
    }

    // 1. OPENROUTER
    if (provider === "openrouter") {
      const apiKey = (process.env.OPENROUTER_API_KEY || config?.openRouterApiKey || "").trim();
      const model = (process.env.OPENROUTER_MODEL || config?.openRouterModel || "openrouter/free").trim();

      if (!apiKey) {
        return res.status(400).json({
          error:
            "Falta la API Key de OpenRouter. Configura la variable de entorno 'OPENROUTER_API_KEY' en Vercel (Settings > Environment Variables) o en el panel de administración."
        });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://liacookies.com",
          "X-Title": "Lia Cookies Agent"
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errText); } catch (_) {}
        const errorMsg = parsed?.error?.message || errText || response.statusText;
        return res.status(response.status).json({
          error: `Error de OpenRouter (${response.status}): ${errorMsg}`
        });
      }

      const data: any = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return res.status(200).json({ reply });
    }

    // 2. OPENAI
    if (provider === "openai") {
      const apiKey = (process.env.OPENAI_API_KEY || config?.openAiApiKey || "").trim();
      const model = (process.env.OPENAI_MODEL || config?.openAiModel || "gpt-4o-mini").trim();

      if (!apiKey) {
        return res.status(400).json({
          error:
            "Falta la API Key de OpenAI. Configura la variable de entorno 'OPENAI_API_KEY' en Vercel (Settings > Environment Variables) o en el panel de administración."
        });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errText); } catch (_) {}
        const errorMsg = parsed?.error?.message || errText || response.statusText;
        return res.status(response.status).json({
          error: `Error de OpenAI (${response.status}): ${errorMsg}`
        });
      }

      const data: any = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return res.status(200).json({ reply });
    }

    // 3. GEMINI
    if (provider === "gemini") {
      const apiKey = (process.env.GEMINI_API_KEY || config?.geminiApiKey || "").trim();
      const model = (process.env.GEMINI_MODEL || config?.geminiModel || "gemini-2.5-flash").trim();

      if (!apiKey) {
        return res.status(400).json({
          error:
            "Falta la API Key de Google Gemini. Configura la variable de entorno 'GEMINI_API_KEY' en Vercel (Settings > Environment Variables) o en el panel de administración."
        });
      }

      const systemMsg = messages.find((m: any) => m.role === "system");
      const chatMsgs = messages.filter((m: any) => m.role !== "system");

      const contents = chatMsgs.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const bodyPayload: any = { contents };
      if (systemMsg) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemMsg.content }]
        };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errText); } catch (_) {}
        const errorMsg = parsed?.error?.message || errText || response.statusText;
        return res.status(response.status).json({
          error: `Error de Gemini (${response.status}): ${errorMsg}`
        });
      }

      const data: any = await response.json();
      const candidate = data.candidates?.[0];
      const reply = candidate?.content?.parts?.[0]?.text || "";
      return res.status(200).json({ reply });
    }

    // 4. OLLAMA
    if (provider === "ollama") {
      let baseUrl = (
        process.env.OLLAMA_BASE_URL ||
        config?.ollamaBaseUrl ||
        "https://ollama.com/v1"
      )
        .trim()
        .replace(/\/+$/, "");
      const apiKey = (process.env.OLLAMA_API_KEY || config?.ollamaApiKey || "").trim();
      const model = (process.env.OLLAMA_MODEL || config?.ollamaModel || "gemma4:31b-cloud").trim();

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      let endpoint = baseUrl;
      if (!baseUrl.endsWith("/chat/completions") && !baseUrl.endsWith("/api/chat")) {
        endpoint = baseUrl.endsWith("/v1")
          ? `${baseUrl}/chat/completions`
          : `${baseUrl}/v1/chat/completions`;
      }

      let response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false
        })
      });

      if (response.status === 404 && !endpoint.includes("/api/chat")) {
        const nativeBase = baseUrl.replace(/\/v1$/, "");
        endpoint = `${nativeBase}/api/chat`;
        response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: model,
            messages: messages,
            stream: false
          })
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errText); } catch (_) {}
        const errorMsg = parsed?.error || parsed?.message || errText || response.statusText;
        return res.status(response.status).json({
          error: `Error de Ollama (${response.status}): ${errorMsg}`
        });
      }

      const data: any = await response.json();
      const reply = data.choices?.[0]?.message?.content || data.message?.content || "";
      return res.status(200).json({ reply });
    }

    return res.status(400).json({ error: `Proveedor desconocido: '${provider}'.` });
  } catch (error: any) {
    console.error("Vercel AI chat serverless error:", error);
    return res.status(500).json({
      error: `Error interno del servidor en Vercel: ${error?.message || String(error)}`
    });
  }
}
