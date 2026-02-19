import { useForm } from "react-hook-form";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (data: { amount: number; description: string; ref: string }) => Promise<void> | void;
};

export default function AddContraInvoiceModal({ open, onClose, onSave }: Props) {
    const { register, handleSubmit, reset } = useForm<{ amount: number; description: string; ref: string }>({
        defaultValues: { amount: 0, description: "", ref: "" },
    });
    if (!open) return null;

    const submit = handleSubmit(async (values) => {
        await onSave({ amount: Number(values.amount), description: values.description, ref: values.ref });
        reset();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Agregar contrafactura</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Monto</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("amount", { required: true, min: 0.01 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Descripción</label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("description", { required: true })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Referencia</label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("ref", { required: true })}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="px-3 py-2 text-sm rounded-lg bg-primary text-white">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
