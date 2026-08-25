/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Copy, Check, Receipt, PlusCircle, Trash2, CreditCard, Landmark, DollarSign, Wallet } from "lucide-react";

export interface BankAccountItem {
  id: string;
  bank: string;
  type: string;
  number: string;
  accent: string;
  logoType: string;
}

interface BankDetailsProps {
  onNotify: (message: string) => void;
  isAdminMode?: boolean;
  accountsData?: BankAccountItem[];
  onUpdateAccount?: (id: string, updated: Partial<BankAccountItem>) => void;
  onDeleteAccount?: (id: string) => void;
  onAddAccount?: () => void;
  rncHeader?: string;
  onUpdateRncHeader?: (value: string) => void;
  paymentBadge?: string;
  paymentTitle?: string;
  paymentDescription?: string;
  onUpdateSectionText?: (key: string, value: string) => void;
}

export default function BankDetails({
  onNotify,
  isAdminMode = false,
  accountsData,
  onUpdateAccount,
  onDeleteAccount,
  onAddAccount,
  rncHeader = "RNC: 133-41038-9",
  onUpdateRncHeader,
  paymentBadge = "Soporte de pagos",
  paymentTitle = "Información de Transferencia",
  paymentDescription = "Pide en línea y transfiere de manera fácil. Copia los datos con un solo toque y envía tu captura por WhatsApp.",
  onUpdateSectionText,
}: BankDetailsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const defaultAccounts: BankAccountItem[] = [
    {
      id: "rnc",
      bank: "RP2, SRL",
      type: "RNC (Registro Nacional)",
      number: "133410389",
      accent: "border-primary/20 bg-primary/5",
      logoType: "rnc",
    },
    {
      id: "bhd",
      bank: "Banco BHD",
      type: "Cuenta de Ahorros",
      number: "39729570017",
      accent: "border-emerald-500/20 bg-emerald-500/5",
      logoType: "bhd",
    },
    {
      id: "banreservas",
      bank: "Banreservas",
      type: "Cuenta de Ahorros",
      number: "9609051377",
      accent: "border-sky-500/20 bg-sky-500/5",
      logoType: "banreservas",
    },
  ];

  const accounts = accountsData || defaultAccounts;

  const copyToClipboard = (text: string, label: string, id: string) => {
    if (isAdminMode) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify(`¡${label} copiado al portapapeles! 📋`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderLogo = (logoType: string) => {
    switch (logoType) {
      case "rnc":
        return (
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
        );
      case "bhd":
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 border border-black/5"></div>
              <div className="w-4.5 h-4.5 rounded-full bg-blue-500 border border-black/5 opacity-80"></div>
              <div className="w-4.5 h-4.5 rounded-full bg-amber-500 border border-black/5 opacity-80"></div>
            </div>
            <span className="text-xs font-bold text-white/60">BHD</span>
          </div>
        );
      case "banreservas":
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center font-display font-black text-[10px] text-white">
              R
            </div>
            <span className="text-xs font-bold text-white/60">RESERVAS</span>
          </div>
        );
      case "popular":
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center font-display font-black text-[10px] text-white">
              P
            </div>
            <span className="text-xs font-bold text-white/60">POPULAR</span>
          </div>
        );
      case "cash":
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
            <DollarSign className="w-4 h-4" />
          </div>
        );
      case "card":
        return (
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case "wallet":
        return (
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30 text-pink-400">
            <Wallet className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/15 text-white/70">
            <Landmark className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-dark-card border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-wine/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2 flex-1">
          {isAdminMode ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Etiqueta:</span>
                <input
                  type="text"
                  value={paymentBadge}
                  onChange={(e) => onUpdateSectionText?.("paymentBadge", e.target.value)}
                  className="bg-black/45 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-primary font-black uppercase tracking-widest font-display focus:outline-none focus:border-primary"
                  placeholder="Soporte de pagos"
                />
              </div>
              <input
                type="text"
                value={paymentTitle}
                onChange={(e) => onUpdateSectionText?.("paymentTitle", e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-xl md:text-2xl font-display font-medium text-white tracking-tight focus:outline-none focus:border-primary font-sans"
                placeholder="Título de Pagos"
              />
              <textarea
                rows={2}
                value={paymentDescription}
                onChange={(e) => onUpdateSectionText?.("paymentDescription", e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs text-gray-300 font-light leading-relaxed focus:outline-none focus:border-primary font-sans"
                placeholder="Descripción para transferencias..."
              />
            </div>
          ) : (
            <>
              <span className="text-primary text-xs font-black uppercase tracking-widest font-display">{paymentBadge}</span>
              <h3 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
                {paymentTitle}
              </h3>
              <p className="text-sm text-gray-400 font-light">
                {paymentDescription}
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 self-start bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 text-xs text-gray-300">
          <Receipt className="w-4 h-4 text-primary shrink-0" />
          {isAdminMode ? (
            <input
              type="text"
              value={rncHeader}
              onChange={(e) => onUpdateRncHeader?.(e.target.value)}
              className="bg-transparent text-gray-200 focus:outline-none w-40 font-mono text-xs border-b border-white/10"
              placeholder="RNC: 133-41038-9"
            />
          ) : (
            <span className="font-mono">{rncHeader}</span>
          )}
        </div>
      </div>

      {/* Grid of Bank / Payment Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            id={`bank-card-${acc.id}`}
            key={acc.id}
            onClick={() => !isAdminMode && copyToClipboard(acc.number, acc.bank, acc.id)}
            className={`border rounded-2xl p-5 relative flex flex-col justify-between transition-all duration-300 group ${
              isAdminMode ? "border-white/20 bg-black/50" : "cursor-pointer hover:border-primary/40 hover:-translate-y-1"
            } ${acc.accent || "border-white/10 bg-white/5"}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                {/* Logo or Icon */}
                <div className="flex items-center gap-2">
                  {renderLogo(acc.logoType)}
                </div>

                {/* Right controls: Delete button in admin or badge */}
                {isAdminMode ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={acc.logoType || "general"}
                      onChange={(e) => onUpdateAccount?.(acc.id, { logoType: e.target.value })}
                      className="bg-black/70 border border-white/10 text-white rounded-lg px-2 py-0.5 text-[10px] focus:outline-none"
                    >
                      <option value="bhd">BHD</option>
                      <option value="banreservas">Banreservas</option>
                      <option value="popular">Popular</option>
                      <option value="rnc">RNC</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="wallet">Billetera / Móvil</option>
                      <option value="general">Banco General</option>
                    </select>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la cuenta de "${acc.bank}"?`)) {
                          onDeleteAccount?.(acc.id);
                        }
                      }}
                      className="p-1.5 bg-red-600/20 hover:bg-red-600 border border-red-600/30 text-red-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Eliminar método de pago"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] bg-white/5 text-gray-400 font-display px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">
                    {acc.type || "AHORROS"}
                  </span>
                )}
              </div>

              {/* Bank Name */}
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-display font-bold">
                Beneficiario / Banco / Método
              </span>
              {isAdminMode ? (
                <input
                  type="text"
                  value={acc.bank}
                  onChange={(e) => onUpdateAccount?.(acc.id, { bank: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-white mt-1 focus:outline-none focus:border-primary font-sans"
                  placeholder="Ej: Banco BHD"
                />
              ) : (
                <h4 className="font-display font-bold text-white text-base mt-0.5">{acc.bank}</h4>
              )}

              {/* Account Type in Admin mode */}
              {isAdminMode && (
                <div className="mt-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-display font-bold">
                    Tipo de Cuenta / Etiqueta
                  </span>
                  <input
                    type="text"
                    value={acc.type || ""}
                    onChange={(e) => onUpdateAccount?.(acc.id, { type: e.target.value })}
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-gray-300 mt-0.5 focus:outline-none focus:border-primary font-sans"
                    placeholder="Ej: Cuenta de Ahorros"
                  />
                </div>
              )}
              
              {/* Account Number */}
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-display font-bold mt-3">
                Número de Cuenta o Documento
              </span>
              {isAdminMode ? (
                <input
                  type="text"
                  value={acc.number}
                  onChange={(e) => onUpdateAccount?.(acc.id, { number: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-white mt-1 font-mono focus:outline-none focus:border-primary"
                  placeholder="Número de cuenta o RNC"
                />
              ) : (
                <p className="font-mono text-base font-black text-white mt-0.5 tracking-wider break-all bg-black/25 px-2.5 py-1 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>{acc.number}</span>
                  {copiedId === acc.id ? (
                    <Check className="w-4 h-4 text-green-400 shrink-0 ml-2 animate-pulse" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                  )}
                </p>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <span className="text-[11px] text-gray-400 group-hover:text-primary transition-colors font-medium">
                {isAdminMode ? "✏️ Editando información" : copiedId === acc.id ? "¡Copiado!" : "Copiar datos"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Payment Method Button in Admin mode */}
      {isAdminMode && (
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
          <button
            type="button"
            onClick={onAddAccount}
            className="px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-2xl text-xs font-display font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Añadir Nuevo Método de Pago / Cuenta 💳</span>
          </button>
        </div>
      )}
    </div>
  );
}
