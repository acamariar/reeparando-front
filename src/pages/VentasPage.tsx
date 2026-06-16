import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import Table from "../components/table/Table";
import api from "../axios/mainAxios";

import type { VentaServicio } from "../types/VentaServicio";
import { CreateVentaServicioModal } from "../components/ventas/CreateVentaServicioModal";

type DashboardSummary = {
    salesAmount: number;
    commissionAmount: number;
    companyNet: number;
    salesCount: number;
};

const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;

function getMonthRange() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("en-CA");
    return { from, to };
}

async function fetchAllSalesInRange(from: string, to: string) {
    const take = 1000;
    let page = 1;
    let totalPages = 1;
    const items: VentaServicio[] = [];

    do {
        const { data, headers } = await api.get<VentaServicio[]>("/ventas-servicio", {
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

export default function VentasPage() {
    const {
        sales,
        salePageSize,
        saleTotalPages,
        isLoadingSales,
        saleError,
        getSales,
        createSale,
        updateSale,
        deleteSale,
        colaboradores,
        getColaboradores,
        getProjects,
        getExpensesByProject,
    } = useBoundStore();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editingSale, setEditingSale] = useState<VentaServicio | null>(null);
    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
        salesAmount: 0,
        commissionAmount: 0,
        companyNet: 0,
        salesCount: 0,
    });
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const collaboratorMap = useMemo(
        () =>
            Object.fromEntries(
                colaboradores.map((c) => [
                    c.id,
                    `${c.firstName} ${c.lastName}${c.alias ? ` · ${c.alias}` : ""}`,
                ])
            ),
        [colaboradores]
    );







    const tableItems = useMemo(
        () =>
            sales.map((sale) => ({
                ...sale,
                collaboratorDisplay:
                    collaboratorMap[sale.collaboratorId ?? ""] ?? "Sin colaborador",
                paymentDisplay: sale.paymentMethod === "EFECTIVO" ? "Efectivo" : "Transferencia",
                clientDisplay: sale.clientName ?? "—",
                amountDisplay: money(sale.amount),
                commissionDisplay: money(sale.commissionAmount),
                netDisplay: money(sale.companyNet),
            })),
        [sales, collaboratorMap]
    );

    const tableInfo = {
        Fecha: "date",
        Visita: "serviceCode",
        Cliente: "clientDisplay",
        Colaborador: "collaboratorDisplay",
        Cobro: "paymentDisplay",
        Total: "amountDisplay",
        Comisión: "commissionDisplay",
        "Neto empresa": "netDisplay",
    };

    const refreshDashboard = async () => {
        try {
            setSummaryError(null);
            const { from: monthFrom, to: monthTo } = getMonthRange();
            const monthSales = await fetchAllSalesInRange(monthFrom, monthTo);

            const summary = monthSales.reduce<DashboardSummary>(
                (acc, sale) => {
                    acc.salesAmount += Number(sale.amount ?? 0);
                    acc.commissionAmount += Number(sale.commissionAmount ?? 0);
                    acc.companyNet += Number(sale.companyNet ?? 0);
                    acc.salesCount += 1;
                    return acc;
                },
                {
                    salesAmount: 0,
                    commissionAmount: 0,
                    companyNet: 0,
                    salesCount: 0,
                }
            );

            setDashboardSummary(summary);
        } catch {
            setSummaryError("No se pudo cargar el resumen mensual");
        }
    };

    useEffect(() => {
        void getColaboradores(1, 5000);
        void getProjects(1, 5000);
        void getExpensesByProject(undefined, 1, 5000);
        void refreshDashboard();
    }, [getColaboradores, getProjects, getExpensesByProject]);

    useEffect(() => {
        const t = setTimeout(() => {
            void getSales(page, salePageSize, search || undefined, from || undefined, to || undefined);
        }, 300);

        return () => clearTimeout(t);
    }, [page, salePageSize, search, from, to, getSales]);

    useEffect(() => {
        setPage(1);
    }, [search, from, to]);

    const handleSave = async (payload: Parameters<typeof createSale>[0]) => {
        if (editingSale) {
            await updateSale(editingSale.id, payload);
        } else {
            await createSale(payload);
        }

        setPage(1);
        await Promise.all([
            getSales(1, salePageSize, search || undefined, from || undefined, to || undefined),
            getColaboradores(1, 5000),
            refreshDashboard(),
        ]);

        setEditingSale(null);
        setOpenModal(false);
    };

    const handleDelete = async (saleId: string) => {
        if (!confirm("¿Eliminar venta?")) return;

        await deleteSale(saleId);
        setPage(1);

        await Promise.all([
            getSales(1, salePageSize, search || undefined, from || undefined, to || undefined),
            getColaboradores(1, 5000),
            refreshDashboard(),
        ]);
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-500">Ventas</p>
                        <h1 className="text-2xl font-bold text-accent">Facturación de servicios</h1>
                    </div>

                    <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                        onClick={() => {
                            setEditingSale(null);
                            setOpenModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Nueva venta
                    </button>
                </div>

                {summaryError && <div className="text-sm text-red-600">{summaryError}</div>}

                <div className="grid gap-3 lg:grid-cols-5 md:grid-cols-2">
                    <StatCard
                        label="Ventas del mes"
                        value={money(dashboardSummary.salesAmount)}
                        note={`${dashboardSummary.salesCount} operaciones`}
                    />
                    <StatCard
                        label="Comisión colaboradores"
                        value={money(dashboardSummary.commissionAmount)}
                        note="Saldo a liquidar"
                    />

                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>

                    </div >

                    <div className="flex flex-wrap gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por servicio, descripción o cliente..."
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {saleError && <div className="text-sm text-red-600">{saleError}</div>}

                <Table
                    items={tableItems}
                    tableInfo={tableInfo}
                    page={page}
                    setPage={setPage}
                    totalPages={saleTotalPages}
                    title="Ventas"
                    action
                    renderActions={(item) => (
                        <div className="flex gap-2 justify-end">

                            <button
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar venta"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                >
                    {isLoadingSales && (
                        <p className="text-sm text-slate-500 px-3">Cargando ventas...</p>
                    )}
                </Table>

                <CreateVentaServicioModal
                    open={openModal}
                    mode={editingSale ? "edit" : "create"}
                    saleId={editingSale?.id}
                    initialValues={
                        editingSale
                            ? {
                                date: editingSale.date,
                                description: editingSale.description,
                                serviceType: editingSale.serviceType,
                                paymentMethod: editingSale.paymentMethod,
                                collaboratorId: editingSale.collaboratorId ?? "",
                                clientName: editingSale.clientName ?? "",
                                amount: editingSale.amount,
                                commissionPercent: editingSale.commissionPercent,
                                notes: editingSale.notes ?? "",
                            }
                            : undefined
                    }
                    onClose={() => {
                        setOpenModal(false);
                        setEditingSale(null);
                    }}
                    onSave={handleSave}
                />
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