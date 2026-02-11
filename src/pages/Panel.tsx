// src/pages/Panel.tsx
import {
    FolderKanban,
    Hourglass,
    CheckCircle2,
    DollarSign,

    Search,


} from "lucide-react";
import AppLayout from "../layout/AppLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const kpis = [
    { icon: <FolderKanban className="w-4 h-4 text-primary" />, label: "Total Proyectos", value: "68", badge: "+12%", badgeColor: "bg-emerald-100 text-emerald-600" },
    { icon: <Hourglass className="w-4 h-4 text-secondary" />, label: "En Progreso", value: "12", badge: "En curso", badgeColor: "bg-secondary/15 text-secondary" },
    { icon: <CheckCircle2 className="w-4 h-4 text-accent" />, label: "Completados", value: "45", badge: "+5%", badgeColor: "bg-emerald-100 text-emerald-600" },
    { icon: <DollarSign className="w-4 h-4 text-purple-600" />, label: "Ingresos", value: "$45,280", badge: "Este mes", badgeColor: "bg-purple-100 text-purple-700" },
];

const monthlyData = [
    { mes: "Ene", valor: 6 },
    { mes: "Feb", valor: 8 },
    { mes: "Mar", valor: 9 },
    { mes: "Abr", valor: 12 },
    { mes: "May", valor: 15 },
    { mes: "Jun", valor: 13 },
    { mes: "Jul", valor: 11 },
    { mes: "Ago", valor: 9 },
    { mes: "Sep", valor: 10 },
    { mes: "Oct", valor: 12 },
    { mes: "Nov", valor: 7 },
    { mes: "Dic", valor: 5 },
];

const statusData = [
    { name: "Completados", value: 66, color: "#01691a" },
    { name: "En Progreso", value: 27, color: "#0a304c" },
    { name: "Pendientes", value: 11, color: "#eb8a44" },
    { name: "En riesgo", value: 6, color: "#f05252" },
];



export default function Panel() {
    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-accent">Panel de Control</p>
                        <span className="text-sm text-mediumGray"> · Lunes, 5 febrero 2026</span>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-lightGray/70 bg-white w-full md:w-64">
                            <Search className="w-4 h-4 text-mediumGray" />
                            <input
                                className="w-full text-sm focus:outline-none"
                                placeholder="Buscar proyectos..."
                            />
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
                    {kpis.map((k) => (
                        <div
                            key={k.label}
                            className="bg-white rounded-xl border border-slate-100 shadow-sm px-3 py-3 flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="p-2 rounded-lg bg-slate-50">{k.icon}</span>
                                <span className={`text-[10px] px-2 py-1 rounded-full ${k.badgeColor}`}>{k.badge}</span>
                            </div>
                            <p className="text-xs text-slate-500">{k.label}</p>
                            <p className="text-2xl font-bold text-slate-900 leading-tight">{k.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-lightGray/70 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-accent">Proyectos por mes</h2>
                            <div className="flex gap-2 text-xs text-mediumGray">
                                <button className="px-2 py-1 rounded-md bg-lightGray/70 text-darkGray font-semibold">
                                    6M
                                </button>
                                <button className="px-2 py-1 rounded-md bg-lightGray/70 text-darkGray">
                                    1A
                                </button>
                                <button className="px-2 py-1 rounded-md bg-lightGray/70 text-darkGray">
                                    Todo
                                </button>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6b7280" }} />
                                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                                    <Bar dataKey="valor" fill="#eb8a44" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100  p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-accent">Estado de Proyectos</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                    >
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                            {statusData.map((s) => (
                                <div key={s.name} className="flex items-center gap-2 text-mediumGray">
                                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                                    {s.name} — {s.value}%
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>

        </AppLayout>
    );
}
