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

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn("Could not create data dir (read-only environment):", e);
    }
  }

  // Get current configuration
  app.get("/api/config", (req, res) => {
    try {
      if (fs.existsSync(SRC_CONFIG_FILE)) {
        const fileContent = fs.readFileSync(SRC_CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        return res.json({ found: true, ...parsed });
      } else if (fs.existsSync(DATA_CONFIG_FILE)) {
        const fileContent = fs.readFileSync(DATA_CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        return res.json({ found: true, ...parsed });
      } else {
        return res.json({ found: false });
      }
    } catch (error) {
      console.error("Error reading config from disk:", error);
      res.status(500).json({ error: "Failed to read configuration from disk." });
    }
  });

  // Save current configuration to disk files
  app.post("/api/config", (req, res) => {
    try {
      const data = req.body;
      const jsonString = JSON.stringify(data, null, 2);

      // Save directly into src/ for static Vercel build and git persistence
      try {
        fs.writeFileSync(SRC_CONFIG_FILE, jsonString, "utf-8");
      } catch (err) {
        console.warn("Warning writing to SRC_CONFIG_FILE:", err);
      }

      // Save into data/ directory as backup
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DATA_CONFIG_FILE, jsonString, "utf-8");
      } catch (err) {
        console.warn("Warning writing to DATA_CONFIG_FILE:", err);
      }

      res.json({ success: true, message: "Configuration successfully saved to disk." });
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
