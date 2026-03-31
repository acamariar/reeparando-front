// components/AddToolsModal.tsx
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Modal } from "../UI/Modal";
import type { Project } from "../../types/project";


type FormValues = { toolsText: string };

const schema = yup.object({
    toolsText: yup
        .string()
        .trim()
        .required("Ingresa al menos una herramienta")
        .test("has-tools", "Ingresa al menos una herramienta", (value) => {
            const arr = toArray(value ?? "");
            return arr.length > 0;
        }),
});

function toArray(raw: string) {
    return Array.from(
        new Set(
            raw
                .split(/[,\n]/)
                .map((t) => t.trim())
                .filter(Boolean)
        )
    );
}

type Props = {
    open: boolean;
    initialTools?: string[];   // opcional, para precargar
    projectId: string;
    onClose: () => void;
    onSaved?: (tools: string[]) => void; // opcional para refrescar UI local
    updateProject: (id: string, payload: Partial<{ tools: string[] }>) => Promise<Project>;
};

export default function AddToolsModal({
    open,
    onClose,
    projectId,
    initialTools = [],
    updateProject,
    onSaved,
}: Props) {
    const defaultText = useMemo(() => initialTools.join(", "), [initialTools]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { toolsText: defaultText },
    });

    // si cambia initialTools mientras está abierto, rehidrata
    useEffect(() => {
        if (open) reset({ toolsText: defaultText });
    }, [open, defaultText, reset]);

    const onSubmit = handleSubmit(async ({ toolsText }) => {
        const tools = toArray(toolsText);
        await updateProject(projectId, { tools });
        onSaved?.(tools);
        onClose();
    });

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose}>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">Editar herramientas</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                    <label className="text-sm text-slate-700 block">
                        Herramientas (separadas por coma o línea)
                        <textarea
                            rows={4}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                            placeholder="martillo, taladro, escalera"
                            {...register("toolsText")}
                        />
                    </label>
                    {errors.toolsText && (
                        <p className="text-xs text-red-600">{errors.toolsText.message}</p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-60"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>

        </Modal>
    );
}
