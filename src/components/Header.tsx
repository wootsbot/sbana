import React from "react";
import { BarChart3, CalendarRange } from "lucide-react";

/**
 * [Token] Navigation tabs
 */
export type ActiveTab = "Adopción" | "Patrones de uso";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filterSummary: string;
}

/**
 * [Organism] Header de Navegación principal con diseño interactivo y minimalista.
 * Solo contiene el logo + nombre y las pestañas de navegación con accesibilidad para teclado.
 */
export const Header = ({ activeTab, setActiveTab }: HeaderProps) => {

  const navItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: "Adopción", label: "Adopción", icon: BarChart3 },
    { id: "Patrones de uso", label: "Patrones de uso", icon: CalendarRange }
  ];

  // Manejar navegación por teclado (flechas de dirección izquierda/derecha)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % navItems.length;
      setActiveTab(navItems[nextIndex].id);
      const element = document.getElementById(`nav-item-${navItems[nextIndex].id.toLowerCase().replace(/ /g, "-")}`);
      element?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + navItems.length) % navItems.length;
      setActiveTab(navItems[prevIndex].id);
      const element = document.getElementById(`nav-item-${navItems[prevIndex].id.toLowerCase().replace(/ /g, "-")}`);
      element?.focus();
    }
  };

  return (
    <header className="relative w-full border-b border-brand-900 bg-brand-900 z-50 text-white shadow-md">
      <div className="mx-auto flex h-16 items-center justify-between gap-p-md px-p-md tablet:px-p-lg">
        
        {/* Logo and Brand Title - Minimalist Sentence Case with High Contrast */}
        <div className="flex items-center gap-p-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white font-sans text-sm font-bold text-brand-900 shadow-sm">
            S
          </div>
          <span className="text-md font-bold tracking-tight text-white leading-none">
            SabIA
          </span>
        </div>

        {/* Right-aligned Navigation Tabs with Arrow Keys Accessibility */}
        <nav 
          role="tablist"
          aria-label="Navegación principal"
          className="flex items-center bg-brand-700/50 border border-brand-600/40 rounded-sm p-1 ml-auto gap-1"
        >
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center">
                {index > 0 && (
                  <div className="h-4 w-px bg-white/30 mx-2" aria-hidden="true" />
                )}
                <button
                  id={`nav-item-${item.id.toLowerCase().replace(/ /g, "-")}`}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-sm text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-brand-900 font-semibold shadow-sm"
                      : "text-brand-100 hover:text-white hover:bg-brand-700/40"
                  }`}
                  style={{ minHeight: "36px" }}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

