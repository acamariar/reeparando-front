import { useEffect, useState } from "react";
import { useBoundStore } from "../../store";
import type {
    MetodoCobroServicio,
    Seguimiento,
} from "../../types/Seguimiento";

type Props = {
    open: boolean;
    seguimiento: Seguimiento | null;
    onClose: () => void;
    onSaved?: () => void;
};

const emptyForm = {
    paymentMethod: "EFECTIVO" as MetodoCobroServicio,
    montoPagadoCliente: 0,
    montoColaborador: 0,
    montoReeparando: 0,
    fechaLimiteGarantia: "",
    observacionesCliente: "",
    observacionesTecnicas: "",
    fechaFinalizacion: "",
};

export default function FinalizeSeguimientoModal({
    open,
    seguimiento,
    onClose,
    onSaved,
}: Props) {
    const finalizarSeguimiento = useBoundStore((s) => s.finalizarSeguimiento);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!open || !seguimiento) return;

        setForm({
            paymentMethod: seguimiento.paymentMethod ?? "EFECTIVO",
            montoPagadoCliente: Number(seguimiento.montoPagadoCliente ?? 0),
            montoColaborador: Number(seguimiento.montoColaborador ?? 0),
            montoReeparando: Number(seguimiento.montoReeparando ?? 0),
            fechaLimiteGarantia: seguimiento.fechaLimiteGarantia ?? "",
            observacionesCliente: seguimiento.observacionesCliente ?? "",
            observacionesTecnicas: seguimiento.observacionesTecnicas ?? "",
            fechaFinalizacion: seguimiento.fechaFinalizacion ?? "",
        });
        setError("");
    }, [open, seguimiento]);

    if (!open || !seguimiento) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await finalizarSeguimiento(seguimiento.id, {
                paymentMethod: form.paymentMethod,
                montoPagadoCliente: Number(form.montoPagadoCliente ?? 0),
                montoColaborador: Number(form.montoColaborador ?? 0),
                montoReeparando: Number(form.montoReeparando ?? 0),
                fechaLimiteGarantia: form.fechaLimiteGarantia || undefined,
                observacionesCliente: form.observacionesCliente || undefined,
                observacionesTecnicas: form.observacionesTecnicas || undefined,
                fechaFinalizacion: form.fechaFinalizacion || undefined,
            });

            onSaved?.();
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Error al finalizar seguimiento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-slate-900">
                    Finalizar seguimiento
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    {seguimiento.numeroVisita} - {seguimiento.servicioRequerido}
                </p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Forma de cobro</label>
                            <select
                                value={form.paymentMethod}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        paymentMethod: e.target.value as MetodoCobroServicio,
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="TRANSFERENCIA">Transferencia</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Fecha limite garantia</label>
                            <input
                                type="date"
                                value={form.fechaLimiteGarantia}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        fechaLimiteGarantia: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Monto pagado por cliente</label>
                            <input
                                type="number"
                                min={0}
                                value={form.montoPagadoCliente}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        montoPagadoCliente: Number(e.target.value),
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Monto colaborador</label>
                            <input
                                type="number"
                                min={0}
                                value={form.montoColaborador}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        montoColaborador: Number(e.target.value),
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Monto Reeparando</label>
                            <input
                                type="number"
                                min={0}
                                value={form.montoReeparando}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        montoReeparando: Number(e.target.value),
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>
                        <div>

                            <label className="mb-1 block text-sm font-medium">Fecha de finalización</label>
                            <input
                                type="date"
                                value={form.fechaFinalizacion}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        fechaFinalizacion: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"

                            />
                        </div>

                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Observaciones cliente</label>
                        <textarea
                            value={form.observacionesCliente}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    observacionesCliente: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Observaciones tecnicas</label>
                        <textarea
                            value={form.observacionesTecnicas}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    observacionesTecnicas: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-4 py-2"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-70"
                        >
                            {loading ? "Guardando..." : "Finalizar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}