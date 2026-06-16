import { useEffect, useState } from "react";
import AppLayout from "../layout/AppLayout";
import api from "../axios/mainAxios";

type ReporteGanancias = {
    from: string;
    to: string;
    sales: {
        count: number;
        totalAmount: number;
        totalCommissionAmount: number;
        totalCompanyNet: number;
        items: Array<{
            id: string;
            date: string;
            createdAt: string;
            serviceType: string;
            paymentMethod: string;
            amount: number;
            commissionAmount: number;
            companyNet: number;
            collaboratorId?: string | null;
            clientName?: string | null;
        }>;
    };
    projects: {
        count: number;
        totalBudget: number;
        totalExpenses: number;
        totalProfit: number;
        items: Array<{
            id: string;
            name: string;
            endDate?: string | null;
            budget: number;
            totalExpenses: number;
            totalProfit: number;
        }>;
    };
    totals: {
        companyProfit: number;
        collaboratorCommissions: number;
        salesCompanyNet: number;
        projectProfit: number;
    };
};

const money = (value: number) =>
    `$${Number(value ?? 0).toLocaleString("es-AR")}`;

export default function GananciasPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [data, setData] = useState<ReporteGanancias | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!from || !to) {
            setError("Debes elegir fecha desde y hasta");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await api.get<ReporteGanancias>("/reportes/ganancias", {
                params: { from, to },
            });
            setData(data);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el reporte");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const today = new Date().toLocaleDateString("en-CA");
        setFrom(today);
        setTo(today);
    }, []);
    console.log({ data });

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-500">Reportes</p>
                        <h1 className="text-2xl font-bold text-accent">Ganancias</h1>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-600">Desde</label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="rounded-lg border px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-600">Hasta</label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="rounded-lg border px-3 py-2 text-sm"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 rounded-lg bg-primary text-white font-medium"
                        >
                            Buscar
                        </button>
                    </div>

                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                    {loading && <p className="mt-3 text-sm text-slate-500">Cargando reporte...</p>}
                </div>

                {data && (
                    <>
                        <div className="grid gap-3 lg:grid-cols-5 md:grid-cols-2">
                            <StatCard
                                label="Ventas"
                                value={money(data.sales.totalAmount)}
                                note={`${data.sales.count} ventas`}
                            />
                            <StatCard
                                label="Comisiones colaboradores"
                                value={money(data.totals.collaboratorCommissions)}
                                note="lo que se va a colaboradores"
                            />
                            <StatCard
                                label="Neto empresa ventas"
                                value={money(data.totals.salesCompanyNet)}
                                note="ganancia por ventas"
                            />
                            <StatCard
                                label="Ganancia proyectos"
                                value={money(data.totals.projectProfit)}
                                note="solo finalizados"
                            />
                            <StatCard
                                label="Ganancia total"
                                value={money(data.totals.companyProfit)}
                                note="ventas + proyectos"
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                                <h2 className="text-lg font-semibold text-slate-900 mb-3">Ventas</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="py-2 pr-4">Fecha</th>
                                                <th className="py-2 pr-4">Servicio</th>
                                                <th className="py-2 pr-4">Cobro</th>
                                                <th className="py-2 pr-4">Total</th>
                                                <th className="py-2 pr-4">Comisión</th>
                                                <th className="py-2 pr-4">Neto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.sales.items.map((sale) => (
                                                <tr key={sale.id} className="border-b last:border-0">
                                                    <td className="py-2 pr-4">{sale.date}</td>
                                                    <td className="py-2 pr-4">{sale.serviceType}</td>
                                                    <td className="py-2 pr-4">{sale.paymentMethod}</td>
                                                    <td className="py-2 pr-4">{money(sale.amount)}</td>
                                                    <td className="py-2 pr-4">{money(sale.commissionAmount)}</td>
                                                    <td className="py-2 pr-4">{money(sale.companyNet)}</td>
                                                </tr>
                                            ))}
                                            {data.sales.items.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-3 text-slate-500">
                                                        No hay ventas en ese rango.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                                <h2 className="text-lg font-semibold text-slate-900 mb-3">Proyectos finalizados</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="py-2 pr-4">Proyecto</th>
                                                <th className="py-2 pr-4">Cierre</th>
                                                <th className="py-2 pr-4">Presupuesto</th>
                                                <th className="py-2 pr-4">Gastos</th>
                                                <th className="py-2 pr-4">Ganancia</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.projects.items.map((project) => (
                                                <tr key={project.id} className="border-b last:border-0">
                                                    <td className="py-2 pr-4">{project.name}</td>
                                                    <td className="py-2 pr-4">{project.endDate ?? "—"}</td>
                                                    <td className="py-2 pr-4">{money(project.budget)}</td>
                                                    <td className="py-2 pr-4">{money(project.totalExpenses)}</td>
                                                    <td className="py-2 pr-4">{money(project.totalProfit)}</td>
                                                </tr>
                                            ))}
                                            {data.projects.items.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-3 text-slate-500">
                                                        No hay proyectos finalizados en ese rango.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({
    label,
    value,
    note,
}: {
    label: string;
    value: string;
    note?: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
        </div>
    );
}