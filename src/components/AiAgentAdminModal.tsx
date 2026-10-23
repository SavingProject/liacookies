import React, { useState } from "react";
import {
  X,
  Bot,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Send,
  Loader2,
  Server,
  Layers,
  HelpCircle,
  ShieldCheck,
  Power,
  MousePointerClick,
  ExternalLink,
  ShoppingBag,
  Cookie,
  Copy,
  CheckCheck,
  Lock,
  Unlock,
  Globe
} from "lucide-react";
import { MenuItem, MenuCategory, StoreSettings, ContactInfo, AiAgentConfig, AiProvider } from "../types";
import { DEFAULT_MASTER_PROMPT, DEFAULT_AI_AGENT_CONFIG, buildFullAiPrompt } from "../utils/aiPromptBuilder";

interface AiAgentAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiAgentConfig;
  onSave: (newConfig: AiAgentConfig) => void;
  menuItems: MenuItem[];
  categories: MenuCategory[];
  storeSettings: StoreSettings;
  bankAccounts: any[];
  contactInfo: ContactInfo;
}

export const AiAgentAdminModal: React.FC<AiAgentAdminModalProps> = ({
  isOpen,
  onClose,
  config = DEFAULT_AI_AGENT_CONFIG,
  onSave,
  menuItems,
  categories,
  storeSettings,
  bankAccounts,
  contactInfo,
}) => {
  // Local edit state
  const [formConfig, setFormConfig] = useState<AiAgentConfig>({
    ...DEFAULT_AI_AGENT_CONFIG,
    ...config,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showMenuContext, setShowMenuContext] = useState(false);

  // Live testing state
  const [testPrompt, setTestPrompt] = useState("Hola, ¿cuánto cuesta el Six Pack de Cookies y qué sabores tienen?");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // Button guide state
  const [showButtonGuide, setShowButtonGuide] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopySnippet = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedSnippet(label);
      setTimeout(() => setCopiedSnippet(null), 2500);
    } catch (_) {}
  };

  const handleInsertButtonInstructions = () => {
    const current = formConfig.masterPrompt || DEFAULT_MASTER_PROMPT;
    if (current.includes("[button:order")) {
      return;
    }
    const snippet = `\n\n==============================\nFACULTAD ESPECIAL: GENERACIÓN DE BOTONES, LINKS CLICKEABLES Y PEDIDOS DIRECTOS\n- Para poner pedido en el menú/carrito: [button:order|🛒 Poner en Mi Pedido (RD$ TOTAL)|id_o_nombre:cantidad, ...]\n- Para agregar una sola galleta: [button:add_item|🍪 Añadir Galleta (RD$ PRECIO)|id_o_nombre|1]\n- Para abrir el carrito: [button:action|🛍️ Abrir Mi Pedido|open_cart]\n- Para links o enlaces clickeables: [button:link|Texto del Enlace|URL]`;
    handleFieldChange("masterPrompt", current + snippet);
  };

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof AiAgentConfig>(
    field: K,
    val: AiAgentConfig[K]
  ) => {
    setFormConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleTestConnection = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const fullSystemPrompt = buildFullAiPrompt(
        formConfig,
        menuItems,
        categories,
        storeSettings,
        bankAccounts,
        contactInfo
      );

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: formConfig.provider,
          useVercelEnv: Boolean(formConfig.useVercelEnv),
          messages: [
            { role: "system", content: fullSystemPrompt },
            { role: "user", content: testPrompt },
          ],
          config: {
            openRouterApiKey: formConfig.openRouterApiKey,
            openRouterModel: formConfig.openRouterModel || "openrouter/free",
            openAiApiKey: formConfig.openAiApiKey,
            openAiModel: formConfig.openAiModel || "gpt-4o-mini",
            geminiApiKey: formConfig.geminiApiKey,
            geminiModel: formConfig.geminiModel || "gemini-2.5-flash",
            ollamaBaseUrl: formConfig.ollamaBaseUrl || "https://ollama.com/v1",
            ollamaApiKey: formConfig.ollamaApiKey,
            ollamaModel: formConfig.ollamaModel || "gemma4:31b-cloud",
          },
        }),
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch (_) {}
        throw new Error(
          errData?.error || `Error HTTP ${res.status}: ${res.statusText}`
        );
      }

      const data = await res.json();
      setTestResponse(data.reply || "El modelo respondió pero el contenido estaba vacío.");
    } catch (err: any) {
      setTestError(err.message || String(err));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave(formConfig);
    onClose();
  };

  const handleResetMasterPrompt = () => {
    if (confirm("¿Deseas restaurar el Prompt Maestro por defecto para Lia Cookies?")) {
      handleFieldChange("masterPrompt", DEFAULT_MASTER_PROMPT);
    }
  };

  // Render Vercel Configuration card for the currently selected & active AI provider
  const renderVercelConfigCard = () => {
    if (!formConfig.useVercelEnv) return null;

    let varName = "";
    let modelVar = "";
    let modelVal = "";
    let currentKeyVal = "";
    let providerName = "";
    let providerIcon = "";
    let extraVarName = "";
    let extraVarVal = "";

    if (formConfig.provider === "openrouter") {
      providerName = "OpenRouter";
      providerIcon = "🌐";
      varName = "OPENROUTER_API_KEY";
      modelVar = "OPENROUTER_MODEL";
      modelVal = formConfig.openRouterModel || "openrouter/free";
      currentKeyVal = formConfig.openRouterApiKey || "";
    } else if (formConfig.provider === "openai") {
      providerName = "OpenAI";
      providerIcon = "⚡";
      varName = "OPENAI_API_KEY";
      modelVar = "OPENAI_MODEL";
      modelVal = formConfig.openAiModel || "gpt-4o-mini";
      currentKeyVal = formConfig.openAiApiKey || "";
    } else if (formConfig.provider === "gemini") {
      providerName = "Google Gemini";
      providerIcon = "💎";
      varName = "GEMINI_API_KEY";
      modelVar = "GEMINI_MODEL";
      modelVal = formConfig.geminiModel || "gemini-2.5-flash";
      currentKeyVal = formConfig.geminiApiKey || "";
    } else if (formConfig.provider === "ollama") {
      providerName = "Ollama";
      providerIcon = "🦙";
      varName = "OLLAMA_API_KEY";
      modelVar = "OLLAMA_MODEL";
      modelVal = formConfig.ollamaModel || "gemma4:31b-cloud";
      extraVarName = "OLLAMA_BASE_URL";
      extraVarVal = formConfig.ollamaBaseUrl || "https://ollama.com/v1";
      currentKeyVal = formConfig.ollamaApiKey || "";
    }

    const envSnippetLines: string[] = [
      `# Variables de Entorno para Vercel - Lia Cookies ChipBot (${providerName})`
    ];
    if (extraVarName) {
      envSnippetLines.push(`${extraVarName}=${extraVarVal}`);
    }
    envSnippetLines.push(`${varName}=${currentKeyVal || "TU_API_KEY_AQUI"}`);
    if (modelVar) {
      envSnippetLines.push(`${modelVar}=${modelVal}`);
    }
    const fullEnvSnippet = envSnippetLines.join("\n");

    return (
      <div className="bg-gradient-to-br from-gray-950 via-black to-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl shadow-emerald-500/5 relative overflow-hidden animate-fadeIn mb-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm shadow-md">
              ▲
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Configuración de API para Vercel — {providerName}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {providerIcon} Proveedor Activo
                </span>
              </h4>
              <p className="text-[11px] text-gray-400">
                Usa estas variables de entorno en Vercel para ejecutar tu modelo de forma 100% segura y privada.
              </p>
            </div>
          </div>

          <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 self-start sm:self-auto font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Serverless Seguro</span>
          </span>
        </div>

        {/* Variables Cards */}
        <div className="space-y-3">
          {/* Main Key Variable */}
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Variable Principal de API Key (Vercel):</span>
              </span>
              <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                Obligatoria en Vercel
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-black/80 p-2.5 rounded-lg border border-white/5">
              <div className="font-mono text-xs font-bold text-emerald-300 select-all break-all">
                {varName}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopySnippet(varName, `var_${varName}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSnippet === `var_${varName}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Nombre</span>
                    </>
                  )}
                </button>

                {currentKeyVal && (
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(currentKeyVal, `val_${varName}`)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copia el valor que tienes escrito actualmente para pegarlo en Vercel"
                  >
                    {copiedSnippet === `val_${varName}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>¡Clave Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Clave</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Extra Variable (Base URL for Ollama) */}
          {extraVarName && (
            <div className="bg-black/60 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>URL del Servidor Ollama (Vercel):</span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-black/80 p-2.5 rounded-lg border border-white/5">
                <div>
                  <div className="font-mono text-xs font-bold text-cyan-300 select-all">
                    {extraVarName}
                  </div>
                  <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                    Valor recomendado: {extraVarVal}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySnippet(extraVarName, `var_${extraVarName}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {copiedSnippet === `var_${extraVarName}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Nombre</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Model Variable */}
          {modelVar && (
            <div className="bg-black/60 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Variable para Modelo (Opcional en Vercel):</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Por defecto: {modelVal}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-black/80 p-2.5 rounded-lg border border-white/5">
                <div>
                  <div className="font-mono text-xs font-bold text-purple-300 select-all">
                    {modelVar}
                  </div>
                  <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                    Valor: {modelVal}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySnippet(modelVar, `var_${modelVar}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {copiedSnippet === `var_${modelVar}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Nombre</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Copy All Button & Links */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleCopySnippet(fullEnvSnippet, "full_env_snippet")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {copiedSnippet === "full_env_snippet" ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Variables Copiadas para Vercel!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copiar Bloque Completo para Vercel / .env</span>
              </>
            )}
          </button>

          <a
            href="https://vercel.com/docs/projects/environment-variables"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-gray-400 hover:text-white flex items-center justify-center gap-1 underline underline-offset-2 py-1"
          >
            <span>Ver docs de Vercel</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 space-y-2 text-xs text-gray-300">
          <div className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <span>📋 Pasos para configurar en Vercel:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-gray-400 leading-relaxed">
            <li>
              Abre tu proyecto en <strong className="text-white">Vercel.com</strong> &gt; ve a <strong className="text-white">Settings</strong> &gt; <strong className="text-white">Environment Variables</strong>.
            </li>
            <li>
              En <strong className="text-white">Key</strong> pega <code className="text-emerald-300 font-mono bg-white/5 px-1 rounded">{varName}</code> y en <strong className="text-white">Value</strong> tu API Key.
            </li>
            <li>
              Marca los entornos <strong className="text-white">Production</strong>, <strong className="text-white">Preview</strong> y <strong className="text-white">Development</strong>.
            </li>
            <li>
              Guarda y realiza un <strong className="text-white">Redeploy</strong> para que Vercel cargue la variable en las funciones serverless.
            </li>
          </ol>
        </div>

        {/* Security Advantage Box */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 flex items-start gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Protección Total:</strong> Al estar en Modo Vercel, la API Key NUNCA viaja al navegador ni se guarda en el archivo público. El endpoint de servidor <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">/api/ai/chat</code> la toma directamente de las variables de entorno de Vercel. Puedes dejar el campo de texto de abajo en blanco.
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto font-sans select-none animate-fadeIn">
      <div className="bg-[#1b0626] border border-white/15 p-6 md:p-8 rounded-3xl w-full max-w-3xl space-y-6 shadow-2xl relative my-8 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#1b0626] rounded-2xl flex items-center justify-center text-pink-400">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-display font-black text-white">
                  Configuración del Agente IA 🤖🍪
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    formConfig.enabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                  }`}
                >
                  {formConfig.enabled ? "Activo" : "Desactivado"}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light">
                Configura el proveedor IA, modelos, credenciales, prompt maestro y comportamiento.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-white/15">
          {/* Master Activation Toggle Switch */}
          <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-black/40 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Power className={`w-4 h-4 ${formConfig.enabled ? "text-emerald-400" : "text-gray-400"}`} />
                <span className="text-sm font-bold text-white">
                  Estado del Agente IA en la Tienda
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {formConfig.enabled
                  ? "🟢 ACTIVO: El agente responde a los clientes en el chat en tiempo real."
                  : "⚪ DESACTIVADO: El agente no contestará preguntas (modo reposo)."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleFieldChange("enabled", !formConfig.enabled)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                formConfig.enabled
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                  : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/15 border border-white/10"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${formConfig.enabled ? "bg-white animate-ping" : "bg-gray-400"}`} />
              <span>{formConfig.enabled ? "Agente Activado (ON)" : "Agente Desactivado (OFF)"}</span>
            </button>
          </div>

          {/* Visual Customization (Bot Name, Greeting, Animation) */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
              <Sparkles className="w-4 h-4" />
              <span>Personalización Visual y Saludo 2.5D</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold block">
                  Nombre del Agente
                </label>
                <input
                  type="text"
                  value={formConfig.botName || ""}
                  onChange={(e) => handleFieldChange("botName", e.target.value)}
                  placeholder="Ej: ChipBot"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold block">
                  Frecuencia de Animación 2.5D (Llamado de Atención)
                </label>
                <select
                  value={formConfig.animationFrequency || "normal"}
                  onChange={(e) =>
                    handleFieldChange("animationFrequency", e.target.value as any)
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="frequent">Frecuente (cada 3.5 segundos)</option>
                  <option value="normal">Normal (cada 6 segundos)</option>
                  <option value="subtle">Sutil (cada 12 segundos)</option>
                  <option value="none">Desactivada (estático)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold block">
                  Mensaje de Saludo en el Globo Flotante
                </label>
                <input
                  type="text"
                  value={formConfig.greetingMessage || ""}
                  onChange={(e) =>
                    handleFieldChange("greetingMessage", e.target.value)
                  }
                  placeholder="Ej: ¡Hola! 🍪 Soy ChipBot. ¿Puedo ayudarte?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
                <p className="text-[10px] text-gray-500">
                  Este mensaje se muestra en el globo flotante junto al icono 2.5D para captar la atención de los clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Vercel Environment Deployment Mode Toggle Button */}
          <div className="bg-gradient-to-r from-gray-950 via-black to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs shadow-sm">
                  ▲
                </div>
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Modo Despliegue en Vercel (Variables de Entorno Seguras)</span>
                  {formConfig.useVercelEnv && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ACTIVO
                    </span>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {formConfig.useVercelEnv
                  ? "🔒 Modo Vercel Activo: Tu API Key se configurará en las variables de entorno de Vercel y se ejecutará en el servidor (/api/ai/chat) sin exponerse en el navegador."
                  : "Permite configurar el agente IA en Vercel leyendo la API Key de las variables de entorno del servidor para no exponerla públicamente."}
              </p>
            </div>

            <button
              type="button"
              id="vercel-env-toggle-btn"
              onClick={() => handleFieldChange("useVercelEnv", !formConfig.useVercelEnv)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 ${
                formConfig.useVercelEnv
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-95 shadow-emerald-500/30 ring-2 ring-emerald-400/40"
                  : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/15 border border-white/10"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${formConfig.useVercelEnv ? "bg-white animate-ping" : "bg-gray-400"}`} />
              <span>{formConfig.useVercelEnv ? "▲ Vercel Activo (ON)" : "Activar Modo Vercel"}</span>
            </button>
          </div>

          {/* AI Provider Tabs Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block">
                Seleccionar Proveedor del Modelo IA
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showApiKey ? "Ocultar claves" : "Mostrar claves"}</span>
              </button>
            </div>

            {/* Provider Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "openrouter" as AiProvider, name: "OpenRouter", badge: "Gratis / Pago", icon: "🌐" },
                { id: "openai" as AiProvider, name: "OpenAI", badge: "GPT-4o Mini", icon: "⚡" },
                { id: "gemini" as AiProvider, name: "Gemini", badge: "Google AI", icon: "💎" },
                { id: "ollama" as AiProvider, name: "Ollama", badge: "Local / Nube", icon: "🦙" },
              ].map((p) => {
                const isSelected = formConfig.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleFieldChange("provider", p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-gradient-to-br from-pink-600/30 to-purple-600/30 border-pink-500 text-white shadow-lg shadow-pink-500/20"
                        : "bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{p.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-none mb-1">
                        {p.name}
                      </div>
                      <div className="text-[9px] text-gray-400 font-mono">
                        {p.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Specific Configuration Form */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
            {/* Vercel Environment Configuration Card (Shown when Vercel mode is active) */}
            {renderVercelConfigCard()}

            {/* 1. OPENROUTER */}
            {formConfig.provider === "openrouter" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🌐</span> Configuración de OpenRouter
                  </span>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-pink-400 hover:underline flex items-center gap-1"
                  >
                    Obtener API Key <HelpCircle className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-400 font-bold block">
                      OpenRouter API Key
                    </label>
                    {formConfig.useVercelEnv && (
                      <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Lock className="w-3 h-3" />
                        <span>En Vercel: OPENROUTER_API_KEY</span>
                      </span>
                    )}
                  </div>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formConfig.openRouterApiKey || ""}
                    onChange={(e) =>
                      handleFieldChange("openRouterApiKey", e.target.value)
                    }
                    placeholder={
                      formConfig.useVercelEnv
                        ? "Opcional en Modo Vercel (se leerá de OPENROUTER_API_KEY en el servidor)"
                        : "sk-or-v1-..."
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  {formConfig.useVercelEnv && (
                    <p className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                      🔒 Servidor Vercel: Puedes dejar este campo vacío; se utilizará la variable de entorno configurada.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold block">
                    Modelo preferido (por defecto: openrouter/free)
                  </label>
                  <input
                    type="text"
                    value={formConfig.openRouterModel || "openrouter/free"}
                    onChange={(e) =>
                      handleFieldChange("openRouterModel", e.target.value)
                    }
                    placeholder="openrouter/free"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex gap-1.5 pt-1 flex-wrap">
                    {[
                      "openrouter/free",
                      "google/gemini-2.0-flash-exp:free",
                      "meta-llama/llama-3.3-70b-instruct",
                      "anthropic/claude-3.5-haiku",
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleFieldChange("openRouterModel", m)}
                        className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. OPENAI */}
            {formConfig.provider === "openai" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>⚡</span> Configuración de OpenAI
                  </span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-pink-400 hover:underline flex items-center gap-1"
                  >
                    Obtener API Key <HelpCircle className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-400 font-bold block">
                      OpenAI API Key
                    </label>
                    {formConfig.useVercelEnv && (
                      <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Lock className="w-3 h-3" />
                        <span>En Vercel: OPENAI_API_KEY</span>
                      </span>
                    )}
                  </div>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formConfig.openAiApiKey || ""}
                    onChange={(e) =>
                      handleFieldChange("openAiApiKey", e.target.value)
                    }
                    placeholder={
                      formConfig.useVercelEnv
                        ? "Opcional en Modo Vercel: se leerá de OPENAI_API_KEY en el servidor"
                        : "sk-proj-..."
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  {formConfig.useVercelEnv && (
                    <p className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                      🔒 Servidor Vercel: Puedes dejar este campo vacío; se utilizará la variable de entorno configurada.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold block">
                    Modelo preferido (por defecto: gpt-4o-mini)
                  </label>
                  <input
                    type="text"
                    value={formConfig.openAiModel || "gpt-4o-mini"}
                    onChange={(e) =>
                      handleFieldChange("openAiModel", e.target.value)
                    }
                    placeholder="gpt-4o-mini"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex gap-1.5 pt-1 flex-wrap">
                    {["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleFieldChange("openAiModel", m)}
                        className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. GEMINI */}
            {formConfig.provider === "gemini" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>💎</span> Configuración de Google Gemini
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-pink-400 hover:underline flex items-center gap-1"
                  >
                    Obtener API Key en AI Studio <HelpCircle className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-400 font-bold block">
                      Gemini API Key
                    </label>
                    {formConfig.useVercelEnv && (
                      <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Lock className="w-3 h-3" />
                        <span>En Vercel: GEMINI_API_KEY</span>
                      </span>
                    )}
                  </div>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formConfig.geminiApiKey || ""}
                    onChange={(e) =>
                      handleFieldChange("geminiApiKey", e.target.value)
                    }
                    placeholder={
                      formConfig.useVercelEnv
                        ? "Opcional en Modo Vercel: se leerá de GEMINI_API_KEY en el servidor"
                        : "AIzaSy..."
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  {formConfig.useVercelEnv && (
                    <p className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                      🔒 Servidor Vercel: Puedes dejar este campo vacío; se utilizará la variable de entorno configurada.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold block">
                    Modelo preferido (por defecto: gemini-2.5-flash)
                  </label>
                  <input
                    type="text"
                    value={formConfig.geminiModel || "gemini-2.5-flash"}
                    onChange={(e) =>
                      handleFieldChange("geminiModel", e.target.value)
                    }
                    placeholder="gemini-2.5-flash"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex gap-1.5 pt-1 flex-wrap">
                    {[
                      "gemini-2.5-flash",
                      "gemini-1.5-flash",
                      "gemini-1.5-pro",
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleFieldChange("geminiModel", m)}
                        className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. OLLAMA */}
            {formConfig.provider === "ollama" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🦙</span> Configuración de Ollama (Local y Nube)
                  </span>
                  <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Soporta Local & Cloud
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-400 font-bold block">
                      Base URL (por defecto: https://ollama.com/v1)
                    </label>
                    {formConfig.useVercelEnv && (
                      <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        <Globe className="w-3 h-3" />
                        <span>En Vercel: OLLAMA_BASE_URL</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formConfig.ollamaBaseUrl || "https://ollama.com/v1"}
                    onChange={(e) =>
                      handleFieldChange("ollamaBaseUrl", e.target.value)
                    }
                    placeholder="https://ollama.com/v1 o http://localhost:11434/v1"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleFieldChange("ollamaBaseUrl", "https://ollama.com/v1")}
                      className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300 cursor-pointer"
                    >
                      Nube: https://ollama.com/v1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("ollamaBaseUrl", "http://localhost:11434/v1")}
                      className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300 cursor-pointer"
                    >
                      Local: http://localhost:11434/v1
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-400 font-bold block">
                      API Key (opcional si es local, requerida para cloud)
                    </label>
                    {formConfig.useVercelEnv && (
                      <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Lock className="w-3 h-3" />
                        <span>En Vercel: OLLAMA_API_KEY</span>
                      </span>
                    )}
                  </div>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formConfig.ollamaApiKey || ""}
                    onChange={(e) =>
                      handleFieldChange("ollamaApiKey", e.target.value)
                    }
                    placeholder={
                      formConfig.useVercelEnv
                        ? "Opcional en Modo Vercel: se leerá de OLLAMA_API_KEY en el servidor"
                        : "Dejar en blanco si tu Ollama local no requiere clave"
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  {formConfig.useVercelEnv && (
                    <p className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                      🔒 Servidor Vercel: Puedes dejar este campo vacío; se utilizará la variable de entorno configurada.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold block">
                    Model (por defecto: gemma4:31b-cloud)
                  </label>
                  <input
                    type="text"
                    value={formConfig.ollamaModel || "gemma4:31b-cloud"}
                    onChange={(e) =>
                      handleFieldChange("ollamaModel", e.target.value)
                    }
                    placeholder="gemma4:31b-cloud"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex gap-1.5 pt-1 flex-wrap">
                    {["gemma4:31b-cloud", "llama3.2", "mistral", "gemma2"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleFieldChange("ollamaModel", m)}
                        className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Master Prompt Section */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block">
                Prompt Maestro (Instrucciones Primarias del Bot)
              </label>
              <button
                type="button"
                onClick={handleResetMasterPrompt}
                className="text-[10px] text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Predeterminado</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={formConfig.masterPrompt || DEFAULT_MASTER_PROMPT}
              onChange={(e) => handleFieldChange("masterPrompt", e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
              placeholder="Escribe el prompt maestro..."
            />
            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
              <span>El sistema combina automáticamente este prompt maestro con el catálogo en vivo, precios, cuentas bancarias y datos de contacto de Lia Cookies.</span>
              <button
                type="button"
                onClick={handleInsertButtonInstructions}
                className="text-[10px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                title="Inserta las reglas de sintaxis de botones y pedidos en el prompt maestro"
              >
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Insertar Reglas de Botones en Prompt</span>
              </button>
            </div>
          </div>

          {/* Special Capabilities Guide: Interactive Buttons, Links & Platform Cart Orders */}
          <div className="bg-gradient-to-br from-pink-950/30 via-purple-950/20 to-black/40 border border-pink-500/30 rounded-2xl overflow-hidden shadow-lg">
            <button
              type="button"
              onClick={() => setShowButtonGuide(!showButtonGuide)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <MousePointerClick className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-pink-300">
                    Facultad de Botones Interactivos, Enlaces Clickeables y Pedidos
                  </div>
                  <div className="text-[10px] text-gray-400 font-normal">
                    Genera botones animados, links configurables y pedidos automáticos en el menú con solo especificarlo en el prompt.
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 shrink-0">
                {showButtonGuide ? "Ocultar Guía" : "Ver Sintaxis y Ejemplos"}
              </span>
            </button>

            {showButtonGuide && (
              <div className="p-4 bg-black/50 border-t border-pink-500/20 text-xs text-gray-200 space-y-4">
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Para que el agente IA genere botones vivos con animación y enlaces funcionales, puedes instruírselo en el <strong>Prompt Maestro</strong> usando estas sintaxis nativas:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* 1. Automatic Cart Management */}
                  <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                        1. Gestión Automática de Carrito (Nuevo)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySnippet(
                            "[cart:add|choco_chip|2] [cart:remove|choco_chip|1] [cart:delete|pistacho] [cart:clear]",
                            "order"
                          )
                        }
                        className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSnippet === "order" ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar tags</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block bg-black/80 text-[10px] p-2 rounded text-emerald-200 font-mono break-all border border-emerald-500/20">
                      [cart:add|id|cant] • [cart:remove|id|cant] • [cart:delete|id] • [cart:clear]
                    </code>
                    <p className="text-[10px] text-gray-400">
                      ChipBot agrega, quita, elimina productos o vacía el carrito automáticamente en tiempo real sin requerir botón manual.
                    </p>
                  </div>

                  {/* 2. Add single cookie */}
                  <div className="bg-black/60 border border-pink-500/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-pink-300 flex items-center gap-1.5">
                        <Cookie className="w-3.5 h-3.5 text-pink-400" />
                        2. Añadir Galleta Específica
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySnippet(
                            "[button:add_item|🍪 Añadir Red Velvet (RD$ 150)|red_velvet|1]",
                            "add_item"
                          )
                        }
                        className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-pink-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSnippet === "add_item" ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar tag</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block bg-black/80 text-[10px] p-2 rounded text-pink-200 font-mono break-all border border-pink-500/20">
                      [button:add_item|Texto del Botón|id_o_nombre|cantidad]
                    </code>
                    <p className="text-[10px] text-gray-400">
                      Suma la galleta sugerida al carrito y muestra confirmación instantánea.
                    </p>
                  </div>

                  {/* 3. Platform Internal Actions */}
                  <div className="bg-black/60 border border-purple-500/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-purple-300 flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                        3. Acción en la Página
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySnippet(
                            "[button:action|🛍️ Abrir Mi Pedido Actual|open_cart]",
                            "action"
                          )
                        }
                        className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSnippet === "action" ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar tag</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block bg-black/80 text-[10px] p-2 rounded text-purple-200 font-mono break-all border border-purple-500/20">
                      [button:action|Texto|open_cart|view_category]
                    </code>
                    <p className="text-[10px] text-gray-400">
                      Abre el carrito, salta a una sección o envía el pedido prellenado y copiado automáticamente a Instagram DM o WhatsApp.
                    </p>
                  </div>

                  {/* 4. Clickable Links */}
                  <div className="bg-black/60 border border-blue-500/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        4. Enlace o Link Clickeable
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySnippet(
                            "[button:link|📸 Visitar Instagram de Lia Cookies|https://instagram.com/liacookies70]",
                            "link"
                          )
                        }
                        className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSnippet === "link" ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar tag</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block bg-black/80 text-[10px] p-2 rounded text-cyan-200 font-mono break-all border border-blue-500/20">
                      [button:link|Texto del Enlace|URL_COMPLETA]
                    </code>
                    <p className="text-[10px] text-gray-400">
                      Crea un botón estilizado que al pulsarlo abre la dirección web configurada.
                    </p>
                  </div>
                </div>

                {/* Live Button Style Preview */}
                <div className="bg-black/70 p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Vista Previa de Estilos en el Chat:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 animate-pulse" />
                        <span className="font-black text-xs">🛒 Poner en Mi Pedido</span>
                      </div>
                      <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Animado</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span className="font-black text-xs">📸 Abrir Enlace Web</span>
                      </div>
                      <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Link ↗</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Store Context Knowledge Accordion */}
          <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMenuContext(!showMenuContext)}
              className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-400" />
                <span>Información que el Agente conoce automáticamente ({menuItems.length} galletas)</span>
              </div>
              <span className="text-[10px] text-pink-400">
                {showMenuContext ? "Ocultar" : "Ver detalles"}
              </span>
            </button>

            {showMenuContext && (
              <div className="p-3 bg-black/60 border-t border-white/5 text-[11px] text-gray-300 space-y-2 max-h-48 overflow-y-auto">
                <p className="text-[10px] text-pink-300 font-mono">
                  ✨ Esta información se inyecta en tiempo real cada vez que un cliente chatea:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between"
                    >
                      <span className="font-bold text-white truncate mr-2">
                        {item.name}
                      </span>
                      <span className="text-pink-400 font-mono font-bold whitespace-nowrap">
                        RD$ {item.price.toLocaleString("es-DO")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Testing Box (Test Connection) */}
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Probar Agente IA en Vivo (Test de Conexión)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {formConfig.provider.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Escribe una pregunta para probar..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !testPrompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isTesting ? "Probando..." : "Probar"}</span>
              </button>
            </div>

            {testError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-200">
                <strong>Error en la prueba:</strong> {testError}
              </div>
            )}

            {testResponse && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-200 space-y-1">
                <div className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                  Respuesta del Modelo:
                </div>
                <p className="whitespace-pre-wrap">{testResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Save Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-95 shadow-lg shadow-pink-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Configuración del Agente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
