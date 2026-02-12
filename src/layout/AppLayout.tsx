
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Package, ClipboardList, Settings, LogOut } from "lucide-react"; // o usa tus íconos preferidos
import type { ReactNode } from "react";

type appLayoutProps = { children: ReactNode };

const navItems = [

    { to: "/proyectos", label: "Proyectos", icon: <Package className="w-5 h-5" /> },
    { to: "/nomina", label: "Nomina", icon: <ClipboardList className="w-5 h-5" /> },
    { to: "/clientes", label: "Clientes", icon: <ClipboardList className="w-5 h-5" /> },

];

export default function AppLayout({ children }: appLayoutProps) {
    const navigate = useNavigate();
    const logout = () => {
        // aquí llama a tu store de sesión si quieres limpiar estado
        navigate("/");
    };
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-primary text-slate-100 flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-secondary w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">CV</div>
                    <div>
                        <p className="font-semibold">Reeparando</p>
                        <p className="text-xs text-slate-400">Sistema Administrativo</p>
                    </div>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? "bg-secondary text-white" : "text-white hover:bg-secondary"
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-200 hover:bg-slate-800">
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col">


                {/* Content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}