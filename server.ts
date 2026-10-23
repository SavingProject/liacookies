import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// For resolving ES paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser to support large payloads for potential image bases or big menu listings
  app.use(express.json({ limit: "50mb" }));

  // File paths for disk storage
  const SRC_CONFIG_FILE = path.join(process.cwd(), "src", "store_config.json");
  const DATA_DIR = path.join(process.cwd(), "data");
  const DATA_CONFIG_FILE = path.join(DATA_DIR, "store_config.json");
  const USER_PERSISTENT_FILE = path.join(DATA_DIR, "user_saved_config.json");
  const BACKUPS_DIR = path.join(DATA_DIR, "backups");

  // Ensure data and backup directories exist
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create data/backups dir (read-only environment):", e);
  }

  // Get current configuration with smart timestamp / newest version resolution
  app.get("/api/config", (req, res) => {
    try {
      const candidates = [USER_PERSISTENT_FILE, DATA_CONFIG_FILE, SRC_CONFIG_FILE];
      let bestCandidate: { data: any; updatedAt: number; source: string } | null = null;

      for (const filePath of candidates) {
        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsed = JSON.parse(content);
            const mtime = fs.statSync(filePath).mtimeMs;
            const itemUpdatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : Math.floor(mtime);

            if (!bestCandidate || itemUpdatedAt > bestCandidate.updatedAt) {
              bestCandidate = {
                data: parsed,
                updatedAt: itemUpdatedAt,
                source: path.basename(filePath)
              };
            }
          } catch (err) {
            console.warn(`Could not parse config from ${filePath}:`, err);
          }
        }
      }

      if (bestCandidate) {
        return res.json({
          found: true,
          ...bestCandidate.data,
          updatedAt: bestCandidate.updatedAt,
          _source: bestCandidate.source
        });
      }

      return res.json({ found: false });
    } catch (error) {
      console.error("Error reading config from disk:", error);
      res.status(500).json({ error: "Failed to read configuration from disk." });
    }
  });

  // Helper function to update HTML meta tags in file
  const updateHtmlMetaInFile = (filePath: string, settings: any) => {
    try {
      if (!fs.existsSync(filePath)) return;
      let html = fs.readFileSync(filePath, "utf-8");

      const heroTitle = settings.heroTitle || "Lia Cookies";
      const heroSubtitle = settings.heroSubtitle || "Dulce Experiencia de Sabores";
      const heroDescription =
        settings.heroDescription ||
        "Gourmet Stuffed Cookies & Bakery. Galletas artesanales rellenas, six packs y experiencias dulces inolvidables.";
      const fullTitle =
        settings.tabTitle && settings.tabTitle.trim() !== ""
          ? settings.tabTitle
          : `${heroTitle} | ${heroSubtitle}`;

      html = html.replace(/<title>(.*?)<\/title>/i, `<title>${fullTitle}</title>`);
      html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${fullTitle}" />`);
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${heroDescription}" />`);
      html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${fullTitle}" />`);
      html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${heroDescription}" />`);
      html = html.replace(/<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:site_name" content="${heroTitle}" />`);
      html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${fullTitle}" />`);
      html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${heroDescription}" />`);

      fs.writeFileSync(filePath, html, "utf-8");
    } catch (e) {
      console.warn(`Could not update HTML metadata in ${filePath}:`, e);
    }
  };

  // Save current configuration to disk files & create safe snapshot backups
  app.post("/api/config", (req, res) => {
    try {
      const data = req.body;
      const now = Date.now();
      const payloadWithTimestamp = {
        ...data,
        updatedAt: data.updatedAt || now
      };
      const jsonString = JSON.stringify(payloadWithTimestamp, null, 2);

      // 1. Save directly into persistent user configuration file in data/
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(USER_PERSISTENT_FILE, jsonString, "utf-8");
        fs.writeFileSync(DATA_CONFIG_FILE, jsonString, "utf-8");
      } catch (err) {
        console.warn("Warning writing to persistent data files:", err);
      }

      // 2. Save into src/ for static Vercel build and git persistence
      try {
        fs.writeFileSync(SRC_CONFIG_FILE, jsonString, "utf-8");
      } catch (err) {
        console.warn("Warning writing to SRC_CONFIG_FILE:", err);
      }

      // 3. Keep a rotating historical backup in data/backups/
      try {
        if (!fs.existsSync(BACKUPS_DIR)) {
          fs.mkdirSync(BACKUPS_DIR, { recursive: true });
        }
        const backupFile = path.join(BACKUPS_DIR, `config_backup_${now}.json`);
        fs.writeFileSync(backupFile, jsonString, "utf-8");

        // Keep maximum 10 latest backup files
        const backupFiles = fs
          .readdirSync(BACKUPS_DIR)
          .filter((f) => f.startsWith("config_backup_") && f.endsWith(".json"))
          .map((f) => ({
            name: f,
            path: path.join(BACKUPS_DIR, f),
            time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs
          }))
          .sort((a, b) => b.time - a.time);

        if (backupFiles.length > 10) {
          for (const old of backupFiles.slice(10)) {
            try {
              fs.unlinkSync(old.path);
            } catch (e) {
              // Ignore unlink errors
            }
          }
        }
      } catch (err) {
        console.warn("Warning creating timestamped backup file:", err);
      }

      // 4. Synchronize index.html and dist/index.html with new meta tags
      if (data.storeSettings) {
        const rootIndexHtml = path.join(process.cwd(), "index.html");
        const distIndexHtml = path.join(process.cwd(), "dist", "index.html");
        updateHtmlMetaInFile(rootIndexHtml, data.storeSettings);
        updateHtmlMetaInFile(distIndexHtml, data.storeSettings);
      }

      res.json({
        success: true,
        updatedAt: payloadWithTimestamp.updatedAt,
        message: "Configuration successfully saved to disk and backed up."
      });
    } catch (error) {
      console.error("Error writing config to disk:", error);
      res.status(500).json({ error: "Failed to save configuration." });
    }
  });

  // AI Agent Chat Proxy Endpoint (Supports OpenRouter, OpenAI, Gemini, Ollama Local/Cloud)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { provider, messages, config } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing or invalid 'messages' array." });
      }

      // OpenRouter Provider
      if (provider === "openrouter") {
        const apiKey = (process.env.OPENROUTER_API_KEY || config?.openRouterApiKey || "").trim();
        const model = (process.env.OPENROUTER_MODEL || config?.openRouterModel || "openrouter/free").trim();
        if (!apiKey) {
          return res.status(400).json({
            error: "Falta la API Key de OpenRouter. Configúrala en las variables de entorno de Vercel (OPENROUTER_API_KEY) o en el panel de administración."
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
        return res.json({ reply });
      }

      // OpenAI Provider
      if (provider === "openai") {
        const apiKey = (process.env.OPENAI_API_KEY || config?.openAiApiKey || "").trim();
        const model = (process.env.OPENAI_MODEL || config?.openAiModel || "gpt-4o-mini").trim();
        if (!apiKey) {
          return res.status(400).json({
            error: "Falta la API Key de OpenAI. Configúrala en las variables de entorno de Vercel (OPENAI_API_KEY) o en el panel de administración."
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
        return res.json({ reply });
      }

      // Gemini Provider
      if (provider === "gemini") {
        const apiKey = (process.env.GEMINI_API_KEY || config?.geminiApiKey || "").trim();
        const model = (process.env.GEMINI_MODEL || config?.geminiModel || "gemini-2.5-flash").trim();
        if (!apiKey) {
          return res.status(400).json({
            error: "Falta la API Key de Google Gemini. Configúrala en las variables de entorno de Vercel (GEMINI_API_KEY) o en el panel de administración."
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
        return res.json({ reply });
      }

      // Ollama Provider (Supports Local and Cloud)
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

        // Check if user URL already has /chat/completions or /api/chat
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

        // Fallback to /api/chat if 404
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
        return res.json({ reply });
      }

      return res.status(400).json({ error: `Proveedor desconocido: ${provider}` });
    } catch (err: any) {
      console.error("Error in /api/ai/chat:", err);
      return res.status(500).json({ error: `Fallo en el servicio IA: ${err.message || String(err)}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
