/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem } from "../types";
import { Plus, Check, Star, Trash2, Camera } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";

interface MenuItemCardProps {
  key?: string | number;
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  count: number;
  isAdminMode?: boolean;
  onUpdateItem?: (itemId: string, updated: Partial<MenuItem>) => void;
  onDeleteItem?: (itemId: string) => void;
}

export default function MenuItemCard({
  item,
  onAdd,
  count,
  isAdminMode = false,
  onUpdateItem,
  onDeleteItem,
}: MenuItemCardProps) {
  const isBebida = item.subCategory === "bebidas";
  const isGuarnicion = item.subCategory === "guarniciones";

  // Dynamic high-resolution food images generated or selected for Monte Pork
  const imageChicharron = "/images/chicharron_hero_1780744755885.png";
  const imageMofongo = "/images/mofongo_plate_1780744771022.png";
  const imageLonganiza = "/images/longaniza_platter_1780745283643.png";
  const imageSandwich = "/images/pork_sandwich_1780745305132.png";
  const imageTostones = "/images/tostones_fry_1780745319842.png";
  const imageCocktail = "/images/rosa_drink_1780745335626.png";
  const imageCeviche = "/images/ceviche_chicharron_1780749606334.png";
  const imageAlitas = "/images/alitas_fritas_chicken_1780749621625.png";
  const imageCatibias = "/images/catibias_tacos_1780749636683.png";
  const imageBeer = "/images/presidente_cerveza_1780749650731.png";

  const getItemImage = () => {
    if (item.image) {
      return item.image;
    }
    const name = item.name.toLowerCase();
    const id = item.id.toLowerCase();
    
    if (name.includes("mofongo")) {
      return imageMofongo;
    }
    if (name.includes("ceviche")) {
      return imageCeviche;
    }
    if (name.includes("alitas") || name.includes("pechuga")) {
      return imageAlitas;
    }
    if (name.includes("catibia") || name.includes("carnales") || id.includes("catibia") || id.includes("carnales")) {
      return imageCatibias;
    }
    
    const isBeer = isBebida && (
      name.includes("presidente") ||
      name.includes("corona") ||
      name.includes("brahma") ||
      name.includes("stella") ||
      name.includes("modelo") ||
      name.includes("coors") ||
      name.includes("galicia") ||
      name.includes("heineken") ||
      name.includes("5,0") ||
      name.includes("cerveza")
    );
    if (isBeer) {
      return imageBeer;
    }
    if (name.includes("sándwich") || name.includes("pierna") || name.includes("barraca") || name.includes("hot dog") || name.includes("perro")) {
      return imageSandwich;
    }
    if (name.includes("canoa") || name.includes("conchita") || isGuarnicion || name.includes("tostones") || name.includes("papa") || name.includes("fritas") || name.includes("dedito")) {
      return imageTostones;
    }
    if (isBebida) {
      return imageCocktail;
    }
    if (name.includes("longaniza") || name.includes("tocino")) {
      return imageLonganiza;
    }
    return imageChicharron; // Default / Chicharrón, combos, picalonga
  };
  
  // Custom graphics/icons mapping depending on item names
  const getFoodIcon = () => {
    const name = item.name.toLowerCase();
    if (name.includes("mofongo")) return "🥣";
    if (name.includes("canoa")) return "🍌";
    if (name.includes("picalonga") || name.includes("chicharrón") || name.includes("tocino") || name.includes("longaniza")) return "🥩";
    if (name.includes("papa") || name.includes("fries") || name.includes("dedito")) return "🍟";
    if (name.includes("catibia") || name.includes("empanada") || name.includes("conchita") || name.includes("carnales")) return "🥟";
    if (name.includes("ceviche")) return "🥗";
    if (name.includes("alitas") || name.includes("pechuga")) return "🍗";
    if (name.includes("sándwich") || name.includes("pierna") || name.includes("barraca") || name.includes("hot dog") || name.includes("perro")) return "🍔";
    
    // Bebidas
    if (name.includes("agua")) return "💧";
    if (name.includes("refresco") || name.includes("soda") || name.includes("tónica")) return "🥤";
    if (name.includes("jugo") || name.includes("limón") || name.includes("zumo")) return "🍹";
    if (name.includes("whisky") || name.includes("brugal") || name.includes("vodka") || name.includes("tequila") || name.includes("margarita") || name.includes("aperol") || name.includes("rosa")) return "🍸";
    if (name.includes("presidente") || name.includes("corona") || name.includes("stella") || name.includes("brahma") || name.includes("modelo") || name.includes("coors") || name.includes("galicia") || name.includes("original") || name.includes("heineken")) return "🍺";
    
    return "🍽️";
  };

  return (
    <div
      id={`menu-item-${item.id}`}
      className={`relative flex flex-col justify-between bg-dark-card rounded-2xl border transition-all duration-300 overflow-hidden group hover:border-primary/50 hover:-translate-y-1 ${
        item.popular
          ? "border-primary/40 shadow-lg shadow-primary/5"
          : "border-white/5"
      }`}
    >
      {/* Top Image Cover */}
      <div className="relative h-44 overflow-hidden bg-black/40">
        <img
          src={getItemImage()}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-black/25"></div>
        
        {/* Admin Overlays or Popular Badge */}
        {isAdminMode ? (
          <>
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
                  onDeleteItem?.(item.id);
                }
              }}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl z-25 shadow-lg border-0 cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title="Eliminar plato"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Popular Toggle Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpdateItem?.(item.id, { popular: !item.popular });
              }}
              className={`absolute top-3 right-14 p-2 rounded-xl z-25 shadow-lg border border-white/10 cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                item.popular ? "bg-yellow-500 text-black" : "bg-black/60 text-white"
              }`}
              title="Destacar plato"
            >
              <Star className={`w-4 h-4 ${item.popular ? "fill-black" : ""}`} />
            </button>

            {/* Camera Picture Overlay */}
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1.5 z-20">
              <label className="flex flex-col items-center justify-center cursor-pointer bg-primary hover:bg-opacity-95 text-white text-[10px] font-black px-3 py-1.5 rounded-lg border border-primary/20 transition-all shadow-md">
                <Camera className="w-4 h-4 mb-0.5 text-white" />
                <span>CAMBIAR IMAGEN</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const opt = await optimizeImage(file, 800, 800, 0.85);
                        if (opt) {
                          onUpdateItem?.(item.id, { image: opt });
                        }
                      } catch (err) {
                        console.error("Error optimizing item image:", err);
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>
              {item.image && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUpdateItem?.(item.id, { image: undefined });
                  }}
                  className="bg-red-500/80 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer"
                >
                  Quitar Imagen
                </button>
              )}
            </div>
          </>
        ) : (
          item.popular && (
            <div className="absolute top-3 right-0 bg-primary text-white text-[10px] font-black font-display px-3 py-1 rounded-l-xl flex items-center gap-1 z-10 shadow-lg shadow-black/50">
              <Star className="w-3 h-3 fill-white" />
              <span>POPULAR</span>
            </div>
          )
        )}

        {/* Floating food category / emoji & unit edit */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="text-xl shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-black/75 px-2.5 py-1.5 rounded-xl block border border-white/5">
            {getFoodIcon()}
          </span>
          {isAdminMode ? (
            <input
              type="text"
              value={item.unit || ""}
              placeholder="Unidad (LB)"
              onChange={(e) => onUpdateItem?.(item.id, { unit: e.target.value })}
              className="w-16 bg-primary text-white font-black px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide shadow-md border border-primary/20 focus:outline-none text-center"
            />
          ) : (
            item.unit && (
              <span className="text-[10px] bg-primary/90 text-white font-black px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-md border border-primary/20">
                {item.unit}
              </span>
            )
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Upper metadata/subcategory row */}
          {item.subCategory === "bebidas" && item.description && !isAdminMode && (
            <div className="mb-2">
              <span className="text-[10px] bg-wine/40 text-primary font-black px-2 py-0.5 rounded border border-primary/25 uppercase tracking-wider">
                {item.description}
              </span>
            </div>
          )}

          {/* Name and Description */}
          {isAdminMode ? (
            <div className="space-y-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                className="w-full bg-black/45 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-primary"
                placeholder="Nombre de plato"
              />
              <textarea
                value={item.description || ""}
                onChange={(e) => onUpdateItem?.(item.id, { description: e.target.value })}
                className="w-full bg-black/45 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary h-16 resize-none font-light"
                placeholder={item.subCategory === "bebidas" ? "Grupo (e.g. Cervezas Extra Frías)" : "Descripción o ingredientes"}
              />
            </div>
          ) : (
            <>
              <h3 className="font-display font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors line-clamp-2">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="mt-2 text-xs md:text-sm text-gray-400 line-clamp-3 font-light leading-relaxed">
                  {item.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pricing & Add row */}
      <div className="p-5 pt-0 mt-auto">
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className={isAdminMode ? "w-full" : ""}>
            <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-display font-black">PRECIO</span>
            {isAdminMode ? (
              <div className="flex items-center gap-1 mt-1 w-full">
                <span className="text-xs text-primary font-black">RD$</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => onUpdateItem?.(item.id, { price: Number(e.target.value) || 0 })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-black text-white focus:outline-none focus:border-primary font-mono"
                  placeholder="Precio"
                />
              </div>
            ) : (
              <span className="text-lg md:text-xl font-black text-white font-mono flex items-baseline leading-none mt-0.5">
                <span className="text-xs text-primary mr-0.5">RD$</span>
                {item.price.toLocaleString()}
              </span>
            )}
          </div>

          {!isAdminMode && (
            <button
              id={`btn-add-${item.id}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdd(item);
              }}
              style={count > 0 ? { backgroundColor: "var(--color-primary)" } : undefined}
              className={`px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 font-display font-black text-xs uppercase tracking-wider transition-all duration-300 relative select-none cursor-pointer ${
                count > 0
                  ? "bg-primary text-white scale-100 shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95"
                  : "bg-white/10 text-white hover:bg-primary hover:text-white border border-white/10 active:scale-95"
              }`}
              title="Agregar al pedido"
            >
              {count > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Agregado</span>
                  <span className="bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-primary shadow-sm ml-0.5">
                    {count}
                  </span>
                </>
              ) : (
                <span>Agregar</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
