import { useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import Table from "../components/table/Table";
import api from "../axios/mainAxios";
import type { CompraEmpresa } from "../types/CompraEmpresa";

type Summary = {
    totalAmount: number;
    count: number;
};

const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;

async function fetchAllComprasInRange(from: string, to: string) {
    const take = 1000;
    let page = 1;
    let totalPages = 1;
    const items: CompraEmpresa[] = [];

    do {
        const { data, headers } = await api.get<CompraEmpresa[]>("/compras-empresa", {
            params: {
                _page: page,
                _limit: take,
                _sort: "date",
                _order: "desc",
                from,
                to,
            },
        });

        const totalItems = Number(headers["x-total-count"] ?? data.length);
        totalPages = Math.max(1, Math.ceil(totalItems / take));
        items.push(...data);
        page += 1;
    } while (page <= totalPages);

    return items;
}

export default function ComprasReportPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [compras, setCompras] = useState<CompraEmpresa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [summary, setSummary] = useState<Summary>({
        totalAmount: 0,
        count: 0,
    });

    const tableItems = useMemo(
        () =>
            compras.map((c) => ({
                ...c,
                amountDisplay: money(c.amount),
                providerDisplay: c.provider ?? "—",
                notesDisplay: c.notes ?? "—",
            })),
        [compras]
    );

    const tableInfo = {
        Fecha: "date",
        Concepto: "concept",
        Categoría: "category",
        Proveedor: "providerDisplay",
        "Ref. factura": "invoiceRef",
        Monto: "amountDisplay",
        Notas: "notesDisplay",
    };

    const loadReport = async () => {
        try {
            setLoading(true);
            setError(null);
            setHasSearched(true);

            if (!from || !to) {
                setError("Elegí desde y hasta para buscar");
                return;
            }

            const data = await fetchAllComprasInRange(from, to);
            setCompras(data);

            const nextSummary = data.reduce<Summary>(
                (acc, compra) => {
                    acc.totalAmount += Number(compra.amount ?? 0);
                    acc.count += 1;
                    return acc;
                },
                { totalAmount: 0, count: 0 }
            );

            setSummary(nextSummary);
        } catch {
            setError("No se pudo cargar el reporte de compras");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <div>
                    <p className="text-sm text-slate-500">Reportes</p>
                    <h1 className="text-2xl font-bold text-accent">Compras</h1>
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
                            onClick={loadReport}
                            className="rounded-lg bg-primary px-4 py-2 text-white font-medium"
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                {hasSearched && (
                    <>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <StatCard
                                label="Compras"
                                value={money(summary.totalAmount)}
                                note={`${summary.count} compras`}
                            />
                            <StatCard
                                label="Cantidad"
                                value={`${summary.count}`}
                                note="Compras registradas"
                            />
                            <StatCard
                                label="Promedio"
                                value={summary.count > 0 ? money(summary.totalAmount / summary.count) : "$0"}
                                note="Promedio por compra"
                            />
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Listado de compras</h2>

                            {loading ? (
                                <p className="text-sm text-slate-500">Cargando reporte...</p>
                            ) : (
                                <Table
                                    items={tableItems as CompraEmpresa[]}
                                    tableInfo={tableInfo}
                                    page={1}
                                    setPage={() => { }}
                                    totalPages={1}
                                    title="Compras"
                                    action={false}
                                >
                                    {compras.length === 0 && (
                                        <p className="text-sm text-slate-500 px-3">
                                            No hay compras en ese rango.
                                        </p>
                                    )}
                                </Table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout >
    );
}

function StatCard({
    label,
    value,
    note,
}: {
    label: string;
    value: string;
    note: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{note}</p>
        </div>
    );
}