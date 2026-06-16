import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import Table from "../components/table/Table";
import type { CompraEmpresa } from "../types/CompraEmpresa";
import CreateCompraEmpresaModal from "../components/compras/CreateCompraEmpresaModal";

const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;

export default function ComprasPage() {
    const {
        compras,
        compraPageSize,
        compraTotalPages,
        isLoadingCompras,
        compraError,
        getCompras,
        createCompra,
        updateCompra,
        deleteCompra,
    } = useBoundStore();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editingCompra, setEditingCompra] = useState<CompraEmpresa | null>(null);

    const tableItems = useMemo(
        () =>
            compras.map((compra) => ({
                ...compra,
                amountDisplay: money(compra.amount),
                providerDisplay: compra.provider ?? "—",
                notesDisplay: compra.notes ?? "—",
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

    useEffect(() => {
        const t = setTimeout(() => {
            void getCompras(page, compraPageSize, search || undefined, from || undefined, to || undefined);
        }, 300);

        return () => clearTimeout(t);
    }, [page, compraPageSize, search, from, to, getCompras]);

    useEffect(() => {
        setPage(1);
    }, [search, from, to]);

    const handleSave = async (payload: Parameters<typeof createCompra>[0]) => {
        if (editingCompra) {
            await updateCompra(editingCompra.id, payload);
        } else {
            await createCompra(payload);
        }

        setPage(1);
        await getCompras(1, compraPageSize, search || undefined, from || undefined, to || undefined);
        setEditingCompra(null);
        setOpenModal(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar compra?")) return;

        await deleteCompra(id);
        setPage(1);
        await getCompras(1, compraPageSize, search || undefined, from || undefined, to || undefined);
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-500">Compras</p>
                        <h1 className="text-2xl font-bold text-accent">Compras de empresa</h1>
                    </div>

                    <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                        onClick={() => {
                            setEditingCompra(null);
                            setOpenModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Nueva compra
                    </button>
                </div>

                {compraError && <div className="text-sm text-red-600">{compraError}</div>}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por concepto, proveedor o factura..."
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

                <Table
                    items={tableItems as CompraEmpresa[]}
                    tableInfo={tableInfo}
                    page={page}
                    setPage={setPage}
                    totalPages={compraTotalPages}
                    title="Compras"
                    action
                    renderActions={(item) => (
                        <div className="flex gap-2 justify-end">
                            <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(item.id)}
                                title="Eliminar compra"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                >
                    {isLoadingCompras && (
                        <p className="text-sm text-slate-500 px-3">Cargando compras...</p>
                    )}
                </Table>

                <CreateCompraEmpresaModal
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditingCompra(null);
                    }}
                    initialValues={editingCompra}
                />
            </div>
        </AppLayout>
    );
}