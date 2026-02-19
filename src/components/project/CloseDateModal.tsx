import { useEffect } from "react";
import { useForm } from "react-hook-form";

type Props = {
    open: boolean;
    currentDate: string;
    onClose: () => void;
    onSave: (date: string) => Promise<void> | void;
};

type FormValues = { endDate: string };

export default function CloseDateModal({ open, currentDate, onClose, onSave }: Props) {
    const { register, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: { endDate: currentDate },
    });

    useEffect(() => reset({ endDate: currentDate }), [currentDate, reset]);
    if (!open) return null;

    const submit = handleSubmit(async ({ endDate }) => {
        if (!endDate) return;
        await onSave(endDate);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Definir fecha de cierre</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>

                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Fecha de cierre</label>
                        <input
                            type="date"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("endDate", { required: true })}
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
