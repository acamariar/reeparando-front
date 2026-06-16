import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Package,
    ClipboardList,
    LogOut,
    UsersRound,
    ReceiptText,
    ChevronDown
} from "lucide-react";
import type { ReactNode } from "react";

type SubItem = {
    to: string;
    label: string;
};

type NavItem = {
    to?: string; // Opcional si tiene submenús
    label: string;
    icon: ReactNode;
    subItems?: SubItem[];
};

type AppLayoutProps = { children: ReactNode };

const navItems: NavItem[] = [
    { to: "/proyectos", label: "Proyectos", icon: <Package className="w-5 h-5" /> },
    { to: "/nomina", label: "Nomina", icon: <ClipboardList className="w-5 h-5" /> },
    { to: "/clientes", label: "Clientes", icon: <ClipboardList className="w-5 h-5" /> },
    {
        label: "Ventas",
        icon: <ReceiptText className="w-5 h-5" />,
        subItems: [
            { to: "/ventas/facturacion", label: "Facturación" },
            { to: "/ventas/reporte", label: "Reporte de Ventas" }
        ]
    },
    {
        label: "Compras",
        icon: <ReceiptText className="w-5 h-5" />,
        subItems: [
            { to: "/compras/facturacion", label: "Facturación" },
            { to: "/compras/reporte", label: "Reporte de Compras" }
        ]
    },
    {
        label: "Reportes",
        icon: <ReceiptText className="w-5 h-5" />,
        subItems: [
            { to: "/ventas/Gananciales", label: "Gananciales" },

        ]
    },
    {
        to: "/colaboradores",
        label: "Colaboradores",
        icon: <UsersRound className="w-5 h-5" />,
    },
];

export default function AppLayout({ children }: AppLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Estado para controlar qué menús con submenús están abiertos (guardando su etiqueta 'label')
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Efecto para abrir automáticamente el submenú si la ruta actual coincide con alguno de sus hijos
    useEffect(() => {
        navItems.forEach((item) => {
            if (item.subItems) {
                const hasActiveChild = item.subItems.some((sub) => location.pathname.startsWith(sub.to));
                if (hasActiveChild) {
                    setOpenMenus((prev) => ({ ...prev, [item.label]: true }));
                }
            }
        });
    }, [location.pathname]);

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const logout = () => {
        // Limpia tu store de sesión aquí si es necesario
        navigate("/");
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-primary text-slate-100 flex flex-col">
                {/* Header Sidebar */}
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-secondary w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">REE</div>
                    <div>
                        <p className="font-semibold text-white">Reeparando</p>
                        <p className="text-xs text-slate-400">Sistema Administrativo</p>
                    </div>
                </div>

                {/* Navegación Dinámica */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const hasSubitems = !!item.subItems;
                        const isOpen = !!openMenus[item.label];

                        // Si tiene submenús, renderizamos un botón de control colapsable
                        if (hasSubitems && item.subItems) {
                            // Detectar si el menú padre debe verse activo basado en sus hijos
                            const isParentActive = item.subItems.some(sub => location.pathname.startsWith(sub.to));

                            return (
                                <div key={item.label} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${isParentActive
                                            ? "bg-secondary/40 text-white font-semibold"
                                            : "text-white hover:bg-secondary/25"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                                                }`}
                                        />
                                    </button>

                                    {/* Contenedor de Submenús */}
                                    <div
                                        className={`pl-8 space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 opacity-100 py-1" : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.to}
                                                to={sub.to}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${isActive
                                                        ? "bg-secondary text-white shadow-sm"
                                                        : "text-slate-300 hover:text-white hover:bg-secondary/20"
                                                    }`
                                                }
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${location.pathname === sub.to ? "bg-white" : "bg-secondary/90"
                                                    }`} />
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        // Si no tiene submenús, se renderiza el NavLink estándar original
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to || "/"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                        ? "bg-secondary text-white"
                                        : "text-white hover:bg-secondary"
                                    }`
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Sidebar (Cerrar Sesión) */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-200 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col animate-fadeIn">
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}