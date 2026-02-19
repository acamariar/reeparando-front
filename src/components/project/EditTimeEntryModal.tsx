import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { TimeEntry } from "../../types/TimeEntry ";


type Props = {
    open: boolean;
    entry: TimeEntry | null;
    onClose: () => void;
    onSave: (data: { id: string; hours: number; amount: number }) => Promise<void> | void;
};

export default function EditTimeEntryModal({ open, entry, onClose, onSave }: Props) {
    const { register, handleSubmit, reset } = useForm<{ hours: number; amount: number }>({
        defaultValues: { hours: entry?.hours ?? 0, amount: entry?.amount ?? 0 },
    });

    useEffect(() => reset({ hours: entry?.hours ?? 0, amount: entry?.amount ?? 0 }), [entry, reset]);
    if (!open || !entry) return null;

    const submit = handleSubmit(async ({ hours, amount }) => {
        await onSave({ id: entry.id, hours: Number(hours), amount: Number(amount) });
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Editar horas</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>

                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Horas</label>
                        <input
                            type="number"
                            step="0.25"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("hours", { required: true, min: 0 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Monto</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("amount", { required: true, min: 0 })}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="px-3 py-2 text-sm rounded-lg bg-primary text-white">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
