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

  // File path for disk storage
  const DATA_DIR = path.join(process.cwd(), "data");
  const CONFIG_FILE = path.join(DATA_DIR, "store_config.json");

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Get current configuration
  app.get("/api/config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const fileContent = fs.readFileSync(CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        return res.json({ found: true, ...parsed });
      } else {
        // Return indicating no disk configuration exists yet
        return res.json({ found: false });
      }
    } catch (error) {
      console.error("Error reading config from disk:", error);
      res.status(500).json({ error: "Failed to read configuration from disk." });
    }
  });

  // Save current configuration
  app.post("/api/config", (req, res) => {
    try {
      const data = req.body;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
      res.json({ success: true, message: "Configuration saved to disk." });
    } catch (error) {
      console.error("Error writing config to disk:", error);
      res.status(500).json({ error: "Failed to save configuration." });
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
