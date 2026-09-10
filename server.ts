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
