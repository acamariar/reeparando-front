import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../UI/Modal";
import { useBoundStore } from "../../store";
import type {
    CreateColaboradorPayload,
} from "../../types/Colaborador";

type Props = {
    open: boolean;
    onClose: () => void;
    mode?: "create" | "edit";
    collaboratorId?: string;
    initialValues?: Partial<CreateColaboradorPayload>;
    onSave?: (payload: CreateColaboradorPayload) => Promise<void> | void;
};

const today = () => new Date().toLocaleDateString("en-CA");

export function CreateColaboradorModal({
    open,
    onClose,
    mode = "create",
    collaboratorId,
    initialValues,
    onSave,
}: Props) {
    const createColaborador = useBoundStore((s) => s.createColaborador);
    const updateColaborador = useBoundStore((s) => s.updateColaborador);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CreateColaboradorPayload>({
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            alias: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                firstName: initialValues?.firstName ?? "",
                lastName: initialValues?.lastName ?? "",
                phone: initialValues?.phone ?? "",
                email: initialValues?.email ?? "",
                alias: initialValues?.alias ?? "",
                notes: initialValues?.notes ?? "",
            });
        } else {
            reset();
        }
    }, [open, initialValues, reset]);

    const onSubmit = async (data: CreateColaboradorPayload) => {
        const payload: CreateColaboradorPayload = {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone?.trim() || undefined,
            email: data.email?.trim() || undefined,
            alias: data.alias?.trim() || undefined,
            notes: data.notes?.trim() || undefined,
        };

        if (onSave) {
            await onSave(payload);
        } else if (mode === "edit" && collaboratorId) {
            await updateColaborador(collaboratorId, payload);
        } else {
            await createColaborador(payload);
        }

        reset();
        onClose();
    };

    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "edit" ? "Editar colaborador" : "Nuevo colaborador"}
            footer={
                <div className="flex justify-end gap-2">
                    <button className="px-3 py-2 rounded border" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="px-3 py-2 rounded bg-primary text-white disabled:opacity-50"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        Guardar
                    </button>
                </div>
            }
        >
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-600">
                        Nombre
                        <input
                            className={inputCls}
                            placeholder="Nombre"
                            {...register("firstName", { required: "El nombre es obligatorio" })}
                        />
                        {errors.firstName && (
                            <p className="text-xs text-red-600">{errors.firstName.message}</p>
                        )}
                    </label>

                    <label className="text-sm text-slate-600">
                        Apellido
                        <input
                            className={inputCls}
                            placeholder="Apellido"
                            {...register("lastName", { required: "El apellido es obligatorio" })}
                        />
                        {errors.lastName && (
                            <p className="text-xs text-red-600">{errors.lastName.message}</p>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-600">
                        Teléfono
                        <input className={inputCls} placeholder="Teléfono" {...register("phone")} />
                    </label>
                    <label className="text-sm text-slate-600">
                        Email
                        <input className={inputCls} placeholder="Email" {...register("email")} />
                    </label>
                </div>

                <label className="text-sm text-slate-600">
                    Alias
                    <input className={inputCls} placeholder="Alias" {...register("alias")} />
                </label>

                <label className="text-sm text-slate-600">
                    Notas
                    <textarea
                        className={inputCls}
                        rows={3}
                        placeholder="Notas"
                        {...register("notes")}
                    />
                </label>

                <p className="text-xs text-slate-500">
                    La cuenta del colaborador arranca en 0. Fecha alta: {today()}.
                </p>
            </div>
        </Modal>
    );
}