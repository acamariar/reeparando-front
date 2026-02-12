// src/components/CreateClientModal.tsx

import { useForm } from "react-hook-form";
import { useBoundStore } from "../../store";
import { Modal } from "../UI/Modal";
// tu modal genérico

type FormValues = {
    firstName: string;
    lastName: string;
    phone?: string;
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
};

export function CreateClientModal({ open, onClose }: Props) {
    const createClient = useBoundStore((s) => s.createClient);
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        reset,
    } = useForm<FormValues>({
        defaultValues: { firstName: "", lastName: "" },
    });

    const onSubmit = async (data: FormValues) => {
        await createClient({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone ?? "",
            email: data.email ?? "",
            address: data.address ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            zip: data.zip ?? "",
            dni: data.dni ?? "",
            notes: data.notes ?? "",
            createdAt: new Date().toISOString().slice(0, 10),
            referenceMedium: data.referenceMedium ?? "",
            generatedSale: data.generatedSale ?? ""

        });
        reset();
        onClose();
    };

    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Nuevo Cliente"
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
                <input className={inputCls} placeholder="Teléfono" {...register("phone")} />
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
