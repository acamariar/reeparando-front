import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ProjectStatus } from "../../types/project";

type Props = {
    open: boolean;
    currentStatus: string;
    options: string[];                 // ["FINALIZADA", "GARANTIA"]
    onClose: () => void;
    onSave: (status: ProjectStatus) => Promise<void> | void;
};

const LABELS: Record<string, string> = {
    EN_PROGRESO: "En progreso",
    FINALIZADA: "Finalizada",
    ATRASADA: "Atrasada",
    GARANTIA: "En garantía",
};

type FormValues = { status: string };

export default function StatusModal({ open, currentStatus, options, onClose, onSave }: Props) {
    const { register, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: { status: currentStatus },
    });

    useEffect(() => {
        reset({ status: currentStatus });
    }, [currentStatus, reset]);

    if (!open) return null;

    const submit = handleSubmit(async ({ status }) => {
        await onSave(status as ProjectStatus);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Cambiar estado</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>

                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Nuevo estado</label>
                        <select
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("status", { required: true })}
                        >
                            {options.map((s) => (
                                <option key={s} value={s}>{LABELS[s] ?? s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700"
                            onClick={onClose}
                        >
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
