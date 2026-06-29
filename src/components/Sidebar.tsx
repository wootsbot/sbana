import React, { useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, LogOut, Network, Menu } from "lucide-react";
import { ActiveTab } from "./Header";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout?: () => void;
}

/**
 * [Organism] Sidebar de Navegación principal.
 * Rediseñado con un estilo Slate Graphite Premium de alta fidelidad,
 * indicadores verticales interactivos y transiciones elegantes.
 */
export const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: "Adopción", label: "Adopción", icon: BarChart3 },
    { id: "Patrones de uso", label: "Patrones de uso", icon: Network }
  ];

  return (
    <aside 
      className={`${isCollapsed ? "w-16" : "w-56"} transition-all duration-300 h-screen sticky top-0 border-r border-neutral-raw-600/20 bg-white z-50 flex flex-col p-p-md gap-p-lg relative`}
    >
        
         {/* Logo and Brand Title with beautiful styling */}
         <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} w-full select-none h-8`}>
           {!isCollapsed && (
             <div className="flex flex-col">
               <span className="text-sm font-bold tracking-tight text-neutral-raw-900 leading-none">
                 SabIA
               </span>
               <span className="text-[9px] text-neutral-raw-500 font-medium tracking-wider uppercase mt-1">
                 Portal Adopción
               </span>
             </div>
           )}
           <button 
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="bg-neutral-raw-50 hover:bg-neutral-raw-100 border border-neutral-raw-600/20 rounded-lg p-1.5 shadow-sm text-neutral-raw-500 hover:text-neutral-raw-900 cursor-pointer transition-all duration-200 flex items-center justify-center"
               aria-label={isCollapsed ? "Desplegar menú" : "Plegar menú"}
           >
               <Menu size={16} />
           </button>
         </div>
 
         {/* Navigation */}
         <nav 
           role="tablist"
           aria-label="Navegación principal"
           className="flex flex-col gap-1.5"
         >
           {navItems.map((item) => {
             const isActive = activeTab === item.id;
             const Icon = item.icon;
             
             return (
               <div key={item.id} className="relative flex items-center w-full">
 
                 <button
                   role="tab"
                   aria-selected={isActive}
                   onClick={() => setActiveTab(item.id)}
                   className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer relative ${
                     isActive
                       ? "bg-brand-50/70 text-brand-700 font-semibold border border-brand-100/50 shadow-2xs pl-4.5"
                       : "text-neutral-raw-600 hover:text-neutral-raw-900 hover:bg-neutral-raw-50 hover:translate-x-[2px]"
                   }`}
                   title={isCollapsed ? item.label : undefined}
                 >
                   <Icon size={16} className={`shrink-0 transition-transform ${isActive ? "text-brand-600" : "text-neutral-raw-400 group-hover:text-neutral-raw-600"}`} />
                   {!isCollapsed && <span>{item.label}</span>}
                 </button>
               </div>
             );
           })}
         </nav>

         {/* Profile / Avatar at the bottom */}
         <div className="mt-auto pt-2 flex flex-col gap-3 relative">
           <div className="w-full h-px bg-neutral-raw-200/60" />

           {showDropdown && (
             <>
               {/* Backdrop to close on click outside */}
               <div 
                 className="fixed inset-0 z-40 bg-transparent cursor-default" 
                 onClick={() => setShowDropdown(false)}
               />
               <div className={`absolute bg-white border border-neutral-raw-600/20 rounded-lg shadow-lg p-1 z-50 animate-fadeIn ${
                 isCollapsed 
                   ? "left-14 bottom-2 w-36 shadow-lg" 
                   : "bottom-16 left-1 right-1"
               }`}>
                 <button
                   type="button"
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowDropdown(false);
                     if (onLogout) onLogout();
                   }}
                   className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md transition-all duration-150 text-left cursor-pointer focus:outline-hidden"
                 >
                   <LogOut size={13} className="shrink-0 text-rose-500" />
                   <span>Cerrar sesión</span>
                 </button>
               </div>
             </>
           )}

           <button
             type="button"
             onClick={() => setShowDropdown(!showDropdown)}
             className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-1.5 py-1.5 rounded-lg hover:bg-neutral-raw-50 active:bg-neutral-raw-100 transition-all duration-200 text-left cursor-pointer focus:outline-hidden w-full`}
           >
             {/* Avatar Circle with brand gradient and white text */}
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0 select-none border border-brand-400/10">
               AA
             </div>
             {!isCollapsed && (
               <div className="flex flex-col min-w-0 text-left font-sans">
                 <span className="text-xs font-semibold text-neutral-raw-800 truncate">
                   Adrián de Ávila
                 </span>
                 <span className="text-[9.5px] text-neutral-raw-400 truncate font-mono">
                   adeavila@corpcab.com.mx
                 </span>
               </div>
             )}
           </button>
         </div>
     </aside>
   );
};
