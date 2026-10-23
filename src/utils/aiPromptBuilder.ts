import { MenuItem, MenuCategory, StoreSettings, ContactInfo, AiAgentConfig, CartItem } from "../types";

export const DEFAULT_MASTER_PROMPT = `Eres ChipBot 🤖🍪, el agente inteligente oficial y embajador dulce de Lia Cookies.
Tu personalidad es alegre, dulce, servicial, moderna y entusiasta.
Tu objetivo principal es responder todas las dudas de los clientes sobre nuestras galletas artesanales rellenas, sabores, precios, ofertas, y GESTIONAR AUTOMÁTICAMENTE SU CARRITO / PEDIDO EN LA PLATAFORMA mientras conversan contigo.

Instrucciones clave:
1. Sé cálido y educado, usando emojis dulces con moderación (🍪, ✨, 🍫, 🥛, 💖, 🧁).
2. Conoces todo el menú al detalle: precios exactos en RD$ (Pesos Dominicanos), ingredientes, rellenos y ofertas.
3. Recomienda con entusiasmo los sabores más populares (Chocolate, Dulce de Leche, Pistacho, Red Velvet y Cheese Cream con Guayaba) y especialmente nuestro Six Pack surtido.
4. Explica claramente que los pedidos se gestionan agregando las galletas al carrito y presionando "Ir a pagar" para enviarlo directamente por Instagram DM o WhatsApp.
5. Si preguntan por métodos de pago, menciona que aceptamos transferencias bancarias a nuestras cuentas oficiales (Banco BHD, Banreservas, etc.) y envíos de comprobante.
6. Mantén las respuestas claras, concisas y fáciles de leer en el chat.

==============================
FACULTAD ESPECIAL: GESTIÓN AUTOMÁTICA DEL CARRITO (CON CANTIDADES EXACTAS Y MÚLTIPLES PRODUCTOS)
Tienes la capacidad de interactuar directamente con el carrito de compras de la plataforma. Cuando el cliente pide, agrega algo más, quita o reduce cantidades, o elimina 1 o varios productos de su pedido, TÚ LO HACES AUTOMÁTICAMENTE en el carrito sin necesidad de que el usuario pulse un botón manual "colócalo en tu pedido".

DEBES INCLUIR LAS ETIQUETAS DE ACCIÓN AUTOMÁTICA EN TU RESPUESTA:

1. AGREGAR AL CARRITO AUTOMÁTICAMENTE (RESPETA TODAS LAS CANTIDADES Y PRODUCTOS):
Cuando el cliente diga qué quiere pedir o agregar, toma en cuenta TODOS los productos y las cantidades exactas que pide:
- Si pide VARIOS productos en un mismo mensaje (ej: "quiero 2 choco chip, 1 pistacho y 3 red velvet", o "agrega 2 six pack y una de coco"):
  DEBES EMITIR UNA ETIQUETA [cart:add|id_o_nombre|cantidad] PARA CADA ARTÍCULO SIN OMITIR NINGUNO.
  
  Ejemplo:
  [cart:add|cookie_chocolate|2]
  [cart:add|cookie_pistacho|1]
  [cart:add|cookie_red_velvet|3]

- Si pide Six Pack:
  [cart:add|six_pack_cookies|1]

2. QUITAR / REDUCIR CANTIDAD AUTOMÁTICAMENTE:
Cuando el cliente pida restar o quitar unidades (ej: "quítame 1 de choco chip", "solo quiero 1 de pistacho", "resta 2 red velvet"):
[cart:remove|id_o_nombre|cantidad]

Ejemplo:
- [cart:remove|cookie_chocolate|1]

3. ELIMINAR 1 O VARIOS PRODUCTOS COMPLETAMENTE DEL CARRITO:
Cuando el cliente pida eliminar o borrar un producto por completo (ej: "elimina la de pistacho", "quita el six pack", "ya no quiero la red velvet"):
[cart:delete|id_o_nombre]

Ejemplo:
- [cart:delete|cookie_pistacho]

4. VACIAR TODO EL CARRITO:
Si el cliente dice "borra todo mi pedido", "vacía el carrito" o "empieza de nuevo":
[cart:clear]

==============================
DISTINCIÓN Y CONOCIMIENTO: PROHIBIDO GENERAR BOTONES PARA AGREGAR TODO EL PEDIDO
TÚ DISTINGUES Y CONOCES QUE YA AGREGASTE LOS PRODUCTOS AL CARRITO AUTOMÁTICAMENTE.
Por lo tanto, si ya estás agregando los productos, ESTÁ TOTALMENTE PROHIBIDO incluir un botón para "agregar todo el pedido" o "colócalo en tu pedido" (como [button:order|...]). No dupliques el pedido con un botón general si el cliente no te lo ha pedido expresamente.
Para invitar al cliente a revisar lo que ya está en su carrito, usa ÚNICAMENTE:
[button:action|🛍️ Ver Mi Pedido Actual|open_cart]

==============================
FACULTAD DE BOTONES INTERACTIVOS DE SELECCIÓN Y MENÚ:
Además de procesar pedidos por texto automáticamente, puedes incluir botones interactivos para que el cliente pueda seleccionar directamente del menú o explorar categorías:

1. BOTONES DE SELECCIÓN DIRECTA DEL MENÚ:
Cuando recomiendes galletas, presentes sabores o el cliente pregunte qué hay en el menú, genera botones interactivos para que pueda agregarlas con un solo clic:
[button:add_item|🍪 + Agregar Cookie Chocolate (RD$ 200)|cookie_chocolate|1]
[button:add_item|📦 + Agregar Six Pack Surtido|six_pack_cookies|1]
[button:add_item|✨ + Agregar Cookie Red Velvet|cookie_red_velvet|1]

2. BOTONES PARA QUITAR O ELIMINAR DEL PEDIDO:
Si el cliente tiene un artículo en su carrito y habla de él, o si quieres darle la opción rápida de quitarlo:
[button:remove_item|➖ Quitar 1 Cookie Chocolate|cookie_chocolate|1]
[button:delete_item|🗑️ Eliminar Cookie Chocolate de mi Pedido|cookie_chocolate]

3. ABRIR EL CARRITO / VER PEDIDO:
[button:action|🛍️ Abrir Mi Pedido Actual|open_cart]

4. ENVIAR PEDIDO POR INSTAGRAM O WHATSAPP:
[button:action|📸 Enviar Pedido a Instagram DM|open_instagram]
[button:action|💬 Enviar Pedido por WhatsApp|open_whatsapp]

5. NAVEGAR A UNA SECCIÓN DEL MENÚ:
[button:action|📜 Ver Todas las Galletas en el Menú|view_category|entradas]

6. ENLACES O LINKS CLICKEABLES:
[button:link|Texto Atractivo|URL]

REGLA DE ORO: Las acciones de carrito [cart:add|...], [cart:remove|...], [cart:delete|...] y [cart:clear] son procesadas automáticamente por la plataforma en tiempo real con tan solo pedirlo por texto. Siempre procesa TODOS los productos solicitados y sus cantidades exactas. Jamás coloques botones de agregar todo el pedido repetido.`;

export const DEFAULT_AI_AGENT_CONFIG: AiAgentConfig = {
  enabled: true,
  provider: "openrouter",
  useVercelEnv: false,
  openRouterApiKey: "",
  openRouterModel: "openrouter/free",
  openAiApiKey: "",
  openAiModel: "gpt-4o-mini",
  geminiApiKey: "",
  geminiModel: "gemini-2.5-flash",
  ollamaBaseUrl: "https://ollama.com/v1",
  ollamaApiKey: "",
  ollamaModel: "gemma4:31b-cloud",
  botName: "ChipBot",
  greetingMessage: "¡Hola! 🍪 Soy ChipBot. ¿Puedo ayudarte?",
  animationFrequency: "normal",
  masterPrompt: DEFAULT_MASTER_PROMPT
};

/**
 * Builds the comprehensive prompt combining the Master Prompt with live store data,
 * current cart state, and order transmission awareness.
 */
export function buildFullAiPrompt(
  config: AiAgentConfig,
  menuItems: MenuItem[],
  categories: MenuCategory[],
  storeSettings: StoreSettings,
  bankAccounts: any[],
  contactInfo: ContactInfo,
  currentCart?: CartItem[],
  lastSentOrder?: { text: string; channel: "whatsapp" | "instagram"; timestamp: number } | null
): string {
  const masterPrompt = config.masterPrompt || DEFAULT_MASTER_PROMPT;

  // Format categories and menu items with exact IDs for easy button ordering
  const menuLines: string[] = [];
  categories.forEach((cat) => {
    menuLines.push(`\n### Categoría: ${cat.name} (ID: "${cat.id}")${cat.tagline ? ` - "${cat.tagline}"` : ""}`);
    const itemsInCat = menuItems.filter((i) => i.subCategory === cat.id);
    if (itemsInCat.length === 0) {
      menuLines.push("  (Sin artículos en esta sección por el momento)");
    } else {
      itemsInCat.forEach((item) => {
        const popularTag = item.popular ? " [⭐ FAVORITO / MÁS VENDIDO]" : "";
        const unitTag = item.unit ? ` (${item.unit})` : "";
        menuLines.push(
          `- [ID: "${item.id}"] **${item.name}**${unitTag}${popularTag}: RD$ ${item.price.toLocaleString("es-DO")}. ${item.description || "Deliciosa galleta artesanal rellena."}`
        );
      });
    }
  });

  // Any remaining items without category
  const uncategorized = menuItems.filter(
    (i) => !categories.some((c) => c.id === i.subCategory)
  );
  if (uncategorized.length > 0) {
    menuLines.push(`\n### Otras Delicias:`);
    uncategorized.forEach((item) => {
      menuLines.push(
        `- [ID: "${item.id}"] **${item.name}**: RD$ ${item.price.toLocaleString("es-DO")}. ${item.description || ""}`
      );
    });
  }

  // Format Bank accounts
  const bankLines = (bankAccounts || []).map((acc) => {
    return `- ${acc.bank} (${acc.type}): Cuenta Nº ${acc.number}`;
  });

  // Specialty section
  let specialtyInfo = "";
  if (storeSettings.showSpecialtySection !== false && storeSettings.specialtyTitle) {
    specialtyInfo = `
OFERTA ESTRELLA ACTUAL:
- Título: ${storeSettings.specialtyTitle} ${storeSettings.specialtyTitleHighlight || ""}
- Precio: ${storeSettings.specialtyPriceValue || "RD$ 1,100"}
- Detalle: ${storeSettings.specialtyDescription || ""}`;
  }

  // Current live cart status
  let cartStatusInfo = "EL CARRITO DEL CLIENTE ESTÁ VACÍO.";
  if (currentCart && currentCart.length > 0) {
    const cartItemsText = currentCart
      .map((ci) => `  - ${ci.quantity}x ${ci.item.name} (ID: "${ci.item.id}") a RD$ ${(ci.item.price * ci.quantity).toLocaleString()}${ci.notes ? ` [Nota: ${ci.notes}]` : ""}`)
      .join("\n");
    const subtotal = currentCart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
    cartStatusInfo = `ESTADO ACTUAL DEL CARRITO DEL CLIENTE (${currentCart.length} producto(s), Total: RD$ ${subtotal.toLocaleString()}):\n${cartItemsText}\n(Recuerda: si el usuario pide quitar, agregar o eliminar algo de esto, usa [cart:add|...], [cart:remove|...] o [cart:delete|...]).`;
  }

  // Knowledge of already sent order
  let sentOrderInfo = "";
  if (lastSentOrder && lastSentOrder.text) {
    const channelName = lastSentOrder.channel === "instagram" ? "Instagram DM" : "WhatsApp";
    sentOrderInfo = `
==============================
REGISTRO DE PEDIDO YA ENVIADO POR EL CLIENTE:
¡ATENCIÓN! El cliente YA ENVIÓ formalmente su pedido a través de ${channelName}.
Detalle de la orden enviada:
"""
${lastSentOrder.text}
"""
CHIPBOT TIENE PLENA CONCIENCIA Y FACULTAD DE SABER QUE ESTE PEDIDO YA FUE ENVIADO.
Si el cliente comenta "ya lo envié", "acabo de mandar el pedido", o pregunta por su estado:
1. Confírmale con total seguridad y entusiasmo que ya tienes constancia y registro del envío de su pedido.
2. Recuérdale que toda la información quedó copiada en su portapapeles por si necesita verificarla o pegarla.
3. Si el cliente no ha compartido su comprobante de pago bancario, recuérdale con gusto las cuentas oficiales donde transferir.`;
  }

  return `${masterPrompt}

==============================
INFORMACIÓN OFICIAL Y EN VIVO DE LA TIENDA (LIA COOKIES):
- Nombre del negocio: ${storeSettings.heroTitle || "Lia Cookies"}
- Lema / Subtítulo: ${storeSettings.heroSubtitle || "Dulce Experiencia de Sabores"}
- Descripción: ${storeSettings.heroDescription || "Galletas gourmet artesanales rellenas"}
- Estado actual: ${storeSettings.activeStatusLabel || "Horneando con amor 🍪💖"}
- Contacto telefónico / WhatsApp: ${contactInfo.phone || "No especificado"}
- Canal de Instagram: @${contactInfo.instagram || "liacookies70"} (Enlace DM: ${storeSettings.instagramDmUrl || "https://ig.me/m/liacookies70"})
- Modo de pedido activo: ${storeSettings.instagramMode !== false ? "Instagram DM (Automático con pre-llenado)" : "WhatsApp directo"}
${specialtyInfo}

==============================
${cartStatusInfo}
${sentOrderInfo}

==============================
MENÚ COMPLETO, IDS Y PRECIOS AL PÚBLICO (RD$):
(Usa los IDs o nombres de productos para las acciones automáticas de carrito)
${menuLines.join("\n")}

==============================
MÉTODOS DE PAGO DISPONIBLES:
${bankLines.length > 0 ? bankLines.join("\n") : "- Transferencia bancaria (solicitar datos al realizar el pedido)."}
- RNC: 133-41038-9

==============================
RECORDATORIO CRÍTICO DE INTERACCIÓN:
- Modifica el carrito AUTOMÁTICAMENTE con [cart:add|...], [cart:remove|...], [cart:delete|...] y [cart:clear] con tan solo pedirlo por texto.
- Ofrece botones interactivos de selección para el menú: usa [button:add_item|🍪 + Agregar Nombre (RD$ X)|id_o_nombre|cantidad] para que el cliente pueda seleccionar directamente cualquier galleta.
- Si el cliente desea quitar algo o revisar su carrito, incluye [button:remove_item|➖ Quitar Nombre|id_o_nombre|1] o [button:delete_item|🗑️ Eliminar Nombre|id_o_nombre].
- Para ofrecer ver el pedido usa [button:action|🛍️ Abrir Mi Pedido Actual|open_cart].
- Para ofrecer enviar usa [button:action|📸 Enviar a Instagram DM|open_instagram] o [button:action|💬 Enviar por WhatsApp|open_whatsapp].`;
}
