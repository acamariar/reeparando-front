// src/components/CreateClientModal.tsx

import { useForm } from "react-hook-form";
import { useBoundStore } from "../../store";
import { Modal } from "../UI/Modal";
import { useEffect, useState } from "react";
import axios from "axios";
// tu modal genérico

type FormValues = {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    dni?: string;
    notes?: string;
    referenceMedium?: string;
    generatedSale?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    mode?: "create" | "edit";
    initialValues?: Partial<FormValues>;
    onSave?: (data: FormValues) => Promise<void> | void;
};

export function CreateClientModal({ open, onClose, mode = "create", initialValues, onSave }: Props) {
    const createClient = useBoundStore((s) => s.createClient);
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        reset,
    } = useForm<FormValues>({
        defaultValues: initialValues ?? { firstName: "", lastName: "", phone: "" },
    });
    const [backendError, setBackendError] = useState("");
    const onSubmit = async (data: FormValues) => {
        setBackendError("");

        try {
            if (onSave) {
                await onSave(data);
            } else {
                await createClient({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    email: data.email ?? "",
                    address: data.address ?? "",
                    city: data.city ?? "",
                    state: data.state ?? "",
                    zip: data.zip ?? "",
                    dni: data.dni ?? "",
                    notes: data.notes ?? "",
                    referenceMedium: data.referenceMedium ?? "",
                    generatedSale: data.generatedSale ?? "",
                    createdAt: new Date().toISOString().slice(0, 10),
                });
            }

            reset();
            onClose();
        } catch (err: string | unknown) {
            let msg = "No se pudo guardar el cliente";

            if (axios.isAxiosError(err)) {
                const backendMsg = err.response?.data?.message;
                msg = Array.isArray(backendMsg)
                    ? backendMsg[0]
                    : backendMsg ?? msg;
            }

            setBackendError(msg);
        }
    };
    useEffect(() => {
        if (open) {
            reset({
                firstName: initialValues?.firstName ?? "",
                lastName: initialValues?.lastName ?? "",
                phone: initialValues?.phone ?? "",
                email: initialValues?.email ?? "",
                address: initialValues?.address ?? "",
                city: initialValues?.city ?? "",
                state: initialValues?.state ?? "",
                zip: initialValues?.zip ?? "",
                dni: initialValues?.dni ?? "",
                notes: initialValues?.notes ?? "",
                referenceMedium: initialValues?.referenceMedium ?? "",
                generatedSale: initialValues?.generatedSale ?? "",
            });
        } else {
            reset();
        }
    }, [open, initialValues, reset]);
    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "edit" ? "Editar cliente" : "Nuevo cliente"}
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
                <input className={inputCls} placeholder="Nombre" {...register("firstName", { required: true })} />
                <input className={inputCls} placeholder="Apellido" {...register("lastName", { required: true })} />
                <input
                    {...register("phone", { required: "El teléfono es obligatorio" })}
                    className={inputCls}
                    placeholder="Teléfono"

                />
                {backendError && <p className="text-xs text-red-600">{backendError}</p>}
                <input className={inputCls} placeholder="Email" {...register("email")} />
                <input className={inputCls} placeholder="Dirección" {...register("address")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Ciudad" {...register("city")} />
                    <input className={inputCls} placeholder="Estado/Provincia" {...register("state")} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="ZIP/CP" {...register("zip")} />
                    <input className={inputCls} placeholder="DNI" {...register("dni")} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Medio de Referencia" {...register("referenceMedium")} />
                    <input className={inputCls} placeholder="Venta Generada?" {...register("generatedSale")} />
                </div>
                <textarea className={inputCls} rows={2} placeholder="Notas" {...register("notes")} />
            </div>
        </Modal>
    );
}
