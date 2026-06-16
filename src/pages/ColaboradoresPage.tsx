import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import Table from "../components/table/Table";
import type { Colaborador } from "../types/Colaborador";
import { CreateColaboradorModal } from "../components/colaboradores/CreateColaboradorModal";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;
const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;

export default function ColaboradoresPage() {
    const {
        colaboradores,
        isLoadingColaboradores,
        colaboradorError,
        getColaboradores,
        deleteColaborador,
        createMovimientoCuenta,
        updateColaborador,
        createColaborador,
    } = useBoundStore();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState<Colaborador | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const t = setTimeout(() => {
            void getColaboradores(1, 5000, search || undefined);
        }, 250);

        return () => clearTimeout(t);
    }, [search, getColaboradores]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const totalPages = Math.max(1, Math.ceil(colaboradores.length / PAGE_SIZE));

    const visible = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return colaboradores.slice(start, start + PAGE_SIZE);
    }, [colaboradores, page]);

    const summary = useMemo(() => {
        const active = colaboradores.filter((c) => c.active).length;
        const positive = colaboradores
            .filter((c) => Number(c.saldoActual ?? 0) > 0)
            .reduce((acc, c) => acc + Number(c.saldoActual ?? 0), 0);
        const negative = colaboradores
            .filter((c) => Number(c.saldoActual ?? 0) < 0)
            .reduce((acc, c) => acc + Math.abs(Number(c.saldoActual ?? 0)), 0);
        const net = colaboradores.reduce((acc, c) => acc + Number(c.saldoActual ?? 0), 0);

        return { active, positive, negative, net };
    }, [colaboradores]);

    const tableItems = useMemo(
        () =>
            visible.map((c) => ({
                ...c,
                fullName: `${c.firstName} ${c.lastName}`,
                aliasDisplay: c.alias ?? "—",
                phoneDisplay: c.phone ?? "—",
                saldoDisplay:
                    Number(c.saldoActual ?? 0) > 0
                        ? `${money(c.saldoActual)} a favor del colaborador`
                        : Number(c.saldoActual ?? 0) < 0
                            ? `${money(Math.abs(c.saldoActual))} a favor de la empresa`
                            : "$0 en cero",
                stateDisplay: c.active ? "Activo" : "Inactivo",
            })),
        [visible]
    );

    const tableInfo = {
        Nombre: "fullName",
        Alias: "aliasDisplay",
        Teléfono: "phoneDisplay",
        Saldo: "saldoDisplay",
        Estado: "stateDisplay",
    };

    const handleSave = async (payload: Parameters<typeof createColaborador>[0]) => {
        if (editing) {
            await updateColaborador(editing.id, payload);
        } else {
            await createColaborador(payload);
        }

        setPage(1);
        await getColaboradores(1, 5000, search || undefined);
        setEditing(null);
        setOpenModal(false);
    };

    const handleDelete = async (colaboradorId: string) => {
        if (!confirm("¿Eliminar colaborador?")) return;

        await deleteColaborador(colaboradorId);
        setPage(1);
        await getColaboradores(1, 5000, search || undefined);
    };

    const handleSettle = async (colaborador: Colaborador) => {
        const balance = Number(colaborador.saldoActual ?? 0);
        if (balance === 0) return;

        if (
            !confirm(
                `¿Saldar la cuenta de ${colaborador.firstName} ${colaborador.lastName} y dejarla en 0?`
            )
        ) {
            return;
        }

        await createMovimientoCuenta({
            collaboratorId: colaborador.id,
            type: "LIQUIDACION",
            direction:
                balance > 0
                    ? "COLABORADOR_DEBE_EMPRESA"
                    : "EMPRESA_DEBE_COLABORADOR",
            amount: Math.abs(balance),
            paidAmount: Math.abs(balance),
            pendingAmount: 0,
            paidAt: new Date().toLocaleDateString("en-CA"),
            notes: "Liquidación automática desde la pantalla de colaboradores",
        });

        await getColaboradores(1, 5000, search || undefined);
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-500">Colaboradores</p>
                        <h1 className="text-2xl font-bold text-accent">Saldos y liquidaciones</h1>
                    </div>

                    <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                        onClick={() => {
                            setEditing(null);
                            setOpenModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo colaborador
                    </button>
                </div>

                <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
                    <StatCard
                        label="Colaboradores activos"
                        value={String(summary.active)}
                        note="cargados en el sistema"
                    />
                    <StatCard
                        label="A favor colaboradores"
                        value={money(summary.positive)}
                        note="saldo positivo"
                    />
                    <StatCard
                        label="A favor empresa"
                        value={money(summary.negative)}
                        note="saldo negativo"
                    />
                    <StatCard
                        label="Saldo neto"
                        value={money(summary.net)}
                        note="balance general"
                    />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
                        <p className="text-sm text-slate-500">
                            Se trae todo el listado y se pagina en el front, como hiciste con clientes.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, alias o teléfono..."
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {colaboradorError && (
                    <div className="text-sm text-red-600">{colaboradorError}</div>
                )}

                <Table
                    items={tableItems}
                    tableInfo={tableInfo}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    title="Colaboradores"
                    action
                    selectedItem={(item) => navigate(`/colaboradores/${item.id}`)}
                >
                    {isLoadingColaboradores && (
                        <p className="text-sm text-slate-500 px-3">Cargando colaboradores...</p>
                    )}
                </Table>

                <CreateColaboradorModal
                    open={openModal}
                    mode={editing ? "edit" : "create"}
                    collaboratorId={editing?.id}
                    initialValues={
                        editing
                            ? {
                                firstName: editing.firstName,
                                lastName: editing.lastName,
                                phone: editing.phone ?? "",
                                email: editing.email ?? "",
                                alias: editing.alias ?? "",
                                notes: editing.notes ?? "",
                            }
                            : undefined
                    }
                    onClose={() => {
                        setOpenModal(false);
                        setEditing(null);
                    }}
                    onSave={handleSave}
                />
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