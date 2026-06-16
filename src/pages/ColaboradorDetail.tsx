// frontend/src/pages/ColaboradorDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Edit, Landmark, RefreshCw, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";

import Table from "../components/table/Table";
import { Modal } from "../components/UI/Modal";
import { CreateColaboradorModal } from "../components/colaboradores/CreateColaboradorModal";
import type { Colaborador } from "../types/Colaborador";
const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;
const today = () => new Date().toLocaleDateString("en-CA");

export default function ColaboradorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const colaborador = useBoundStore((s) =>
        s.colaboradores.find((c) => c.id === id)
    );
    const getColaboradorById = useBoundStore((s) => s.getColaboradorById);

    const movimientos = useBoundStore((s) => s.movimientos);
    const movimientoPage = useBoundStore((s) => s.movimientoPage);
    const movimientoTotalPages = useBoundStore((s) => s.movimientoTotalPages);
    const isLoadingMovimientos = useBoundStore((s) => s.isLoadingMovimientos);
    const movimientoError = useBoundStore((s) => s.movimientoError);
    const getMovimientosByColaborador = useBoundStore((s) => s.getMovimientosByColaborador);
    const createMovimientoCuenta = useBoundStore((s) => s.createMovimientoCuenta);
    const updateColaborador = useBoundStore((s) => s.updateColaborador);

    const [editing, setEditing] = useState<Colaborador | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [page, setPage] = useState(1);
    const [openAbono, setOpenAbono] = useState(false);
    const [amount, setAmount] = useState("");
    const [paidAt, setPaidAt] = useState(today());
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        void getColaboradorById(id);
    }, [id, getColaboradorById]);

    useEffect(() => {
        if (!id) return;
        void getMovimientosByColaborador(id, page, 3);
    }, [id, page, getMovimientosByColaborador]);

    const balance = Number(colaborador?.saldoActual ?? 0);

    const movementItems = useMemo(
        () =>
            movimientos.map((m) => ({
                ...m,
                createdAtDisplay: m.createdAt,
                typeDisplay:
                    m.type === "VENTA"
                        ? "Venta"
                        : m.type === "PAGO"
                            ? "Pago"
                            : m.type === "AJUSTE"
                                ? "Ajuste"
                                : "Liquidación",
                directionDisplay:
                    m.direction === "EMPRESA_DEBE_COLABORADOR"
                        ? "Empresa debe"
                        : "Colaborador debe",
                amountFmt: money(m.amount),
                paidAmountFmt: money(m.paidAmount),
                pendingAmountFmt: money(m.pendingAmount),
                notesDisplay: m.notes ?? "—",
            })),
        [movimientos]
    );

    const tableInfo = {
        Fecha: "createdAtDisplay",
        Tipo: "typeDisplay",
        Monto: "amountFmt",
        Notas: "notesDisplay",
    };

    const openSettle = (full = false) => {
        const value = full ? Math.abs(balance) : "";
        setAmount(value ? String(value) : "");
        setPaidAt(today());
        setNotes("");
        setOpenAbono(true);
    };
    const handleSave = async (payload: Parameters<typeof updateColaborador>[1]) => {
        if (editing) {
            await updateColaborador(editing.id, payload);
        }

    };
    const handleSaveAbono = async () => {
        if (!id || !colaborador) return;

        const value = Number(amount || 0);
        if (value <= 0) return;

        setSaving(true);
        try {
            await createMovimientoCuenta({
                collaboratorId: id,
                type: "PAGO",
                direction:
                    balance > 0
                        ? "COLABORADOR_DEBE_EMPRESA"
                        : "EMPRESA_DEBE_COLABORADOR",
                amount: value,
                paidAmount: value,
                pendingAmount: 0,
                notes: notes.trim() || undefined,
            });

            await Promise.all([
                getColaboradorById(id),
                getMovimientosByColaborador(id, page, 10),
            ]);

            setOpenAbono(false);
            setAmount("");
            setNotes("");
            setPaidAt(today());
        } finally {
            setSaving(false);
        }
    };

    if (!id) {
        return (
            <AppLayout>
                <div className="text-sm text-slate-500">Colaborador no encontrado.</div>
            </AppLayout>
        );
    }

    if (!colaborador && !isLoadingMovimientos) {
        return (
            <AppLayout>
                <div className="space-y-4">
                    <button
                        onClick={() => navigate("/colaboradores")}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </button>
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <p className="text-slate-500">No se encontró el colaborador.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                        onClick={() => navigate("/colaboradores")}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a colaboradores
                    </button>

                    <button
                        onClick={() => {
                            if (!colaborador) return;
                            void getColaboradorById(colaborador.id);
                            void getMovimientosByColaborador(colaborador.id, page, 10);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Detalle del colaborador</p>
                                <h1 className="text-2xl font-bold text-slate-900 uppercase">
                                    {colaborador?.firstName} {colaborador?.lastName}
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    {colaborador?.alias ? `Alias: ${colaborador.alias}` : "Sin alias"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                                    onClick={() => {
                                        setEditing(colaborador || null);
                                        setOpenModal(true);
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar colaborador
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-5 text-sm">
                            <InfoRow label="Teléfono" value={colaborador?.phone ?? "—"} />
                            <InfoRow label="Email" value={colaborador?.email ?? "—"} />
                            <InfoRow
                                label="Estado"
                                value={colaborador?.active ? "Activo" : "Inactivo"}
                            />
                            <InfoRow label="Creado" value={colaborador?.createdAt ?? "—"} />
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Saldo actual
                            </p>
                            <p
                                className={`mt-2 text-3xl font-bold ${balance > 0
                                    ? "text-emerald-600"
                                    : balance < 0
                                        ? "text-rose-600"
                                        : "text-slate-900"
                                    }`}
                            >
                                {money(Math.abs(balance))}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                {balance === 0
                                    ? "La cuenta está saldada."
                                    : balance > 0
                                        ? "La empresa le debe al colaborador."
                                        : "El colaborador le debe a la empresa."}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => openSettle(false)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Registrar abono
                                </button>

                                <button
                                    onClick={() => openSettle(true)}
                                    disabled={balance === 0}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <Landmark className="w-4 h-4" />
                                    Saldar cuenta
                                </button>
                            </div>
                        </div>
                    </div>


                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Movimientos</h2>
                            <p className="text-sm text-slate-500">
                                Cada abono queda registrado y recalcula el saldo.
                            </p>
                        </div>
                    </div>

                    {movimientoError && (
                        <div className="mt-3 text-sm text-red-600">{movimientoError}</div>
                    )}

                    <Table
                        items={movementItems}
                        tableInfo={tableInfo}
                        page={movimientoPage}
                        setPage={setPage}
                        totalPages={movimientoTotalPages}
                        title="Movimientos"
                        action={false}
                    >
                        {isLoadingMovimientos && (
                            <p className="text-sm text-slate-500 px-3">Cargando movimientos...</p>
                        )}
                    </Table>
                </div>
            </div>
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
            <Modal
                open={openAbono}
                onClose={() => setOpenAbono(false)}
                title="Registrar abono"
                footer={
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-3 py-2 rounded border"
                            onClick={() => setOpenAbono(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-3 py-2 rounded bg-primary text-white disabled:opacity-50"
                            disabled={saving}
                            onClick={handleSaveAbono}
                        >
                            {saving ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <label className="text-sm text-slate-600 block">
                        Monto
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                            placeholder="0"
                        />
                    </label>

                    <label className="text-sm text-slate-600 block">
                        Fecha
                        <input
                            type="date"
                            value={paidAt}
                            onChange={(e) => setPaidAt(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                        />
                    </label>

                    <label className="text-sm text-slate-600 block">
                        Observaciones
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                            placeholder="Opcional"
                        />
                    </label>

                    <p className="text-xs text-slate-500">
                        Si la cuenta está negativa, el abono reduce la deuda. Si está positiva,
                        reduce lo que la empresa le debe.
                    </p>
                </div>
            </Modal>
        </AppLayout>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
        </div>
    );
}