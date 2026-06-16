import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../UI/Modal";
import { Select } from "../UI/Select";
import { useBoundStore } from "../../store";
import type {
    CreateVentaServicioPayload
} from "../../types/VentaServicio";

type Props = {
    open: boolean;
    onClose: () => void;
    mode?: "create" | "edit";
    saleId?: string;
    initialValues?: Partial<CreateVentaServicioPayload>;
    onSave?: (payload: CreateVentaServicioPayload) => Promise<void> | void;
};

const today = () => new Date().toLocaleDateString("en-CA");
const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;

export function CreateVentaServicioModal({
    open,
    onClose,
    mode = "create",
    saleId,
    initialValues,
    onSave,
}: Props) {
    const colaboradores = useBoundStore((s) => s.colaboradores);
    const getColaboradores = useBoundStore((s) => s.getColaboradores);
    const createSale = useBoundStore((s) => s.createSale);
    const updateSale = useBoundStore((s) => s.updateSale);
    const clients = useBoundStore((s) => s.clients);
    const getClients = useBoundStore((s) => s.getClients);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<CreateVentaServicioPayload>({
        defaultValues: {
            date: today(),
            description: "",
            serviceCode: "",
            serviceType: "",
            paymentMethod: "EFECTIVO",
            collaboratorId: "",
            clientName: "",
            clientId: "",
            amount: 0,
            commissionPercent: 85,
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                date: initialValues?.date ?? today(),
                description: initialValues?.description ?? "",
                serviceCode: initialValues?.serviceCode ?? "",
                serviceType: initialValues?.serviceType ?? "",
                paymentMethod: initialValues?.paymentMethod ?? "EFECTIVO",
                collaboratorId: initialValues?.collaboratorId ?? "",
                clientName: initialValues?.clientName ?? "",
                amount: initialValues?.amount ?? 0,
                commissionPercent: initialValues?.commissionPercent ?? 80,
                notes: initialValues?.notes ?? "",
                clientId: initialValues?.clientId ?? "",
            });

            void getColaboradores(1, 5000).catch(() => { });
            void getClients(1, 5000).catch(() => { });
        } else {
            reset();
        }
    }, [open, initialValues, reset, getColaboradores, getClients]);

    const amount = Number(watch("amount") ?? 0);
    const commissionPercent = Number(watch("commissionPercent") ?? 0);

    const collaboratorOptions = useMemo(
        () => [
            ...colaboradores.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
            })),
        ],
        [colaboradores]
    );

    const commissionAmount = (amount * commissionPercent) / 100;
    const companyNet = amount - commissionAmount;

    const onSubmit = async (data: CreateVentaServicioPayload) => {
        const selectedClient = clients.find((c) => c.id === data.clientId);
        const payload: CreateVentaServicioPayload = {
            date: data.date,
            description: data.description.trim(),
            serviceCode: data.serviceCode.trim(),
            serviceType: data.serviceType.trim(),
            paymentMethod: data.paymentMethod,
            collaboratorId: data.collaboratorId?.trim() || undefined,
            clientName: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : undefined,
            clientId: data.clientId?.trim() || undefined,
            amount: Number(data.amount ?? 0),
            commissionPercent: Number(data.commissionPercent ?? 0),
            notes: data.notes?.trim() || undefined,

        };

        if (onSave) {
            await onSave(payload);
        } else if (mode === "edit" && saleId) {
            await updateSale(saleId, payload);
        } else {
            await createSale(payload);
        }

        reset();
        onClose();
    };
    const clientOptions = useMemo(
        () => [

            ...clients.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
            })),
        ],
        [clients]
    );


    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "edit" ? "Editar venta" : "Nueva venta"}
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
                        Fecha
                        <input
                            type="date"
                            className={inputCls}
                            {...register("date", { required: "La fecha es obligatoria" })}
                        />
                        {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
                    </label>

                    <label className="text-sm text-slate-600">
                        Forma de cobro
                        <select
                            className={inputCls}
                            {...register("paymentMethod", {
                                required: "La forma de cobro es obligatoria",
                            })}
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                    </label>
                </div>
                <label className="text-sm text-slate-600">
                    Código de venta
                    <input
                        className={inputCls + " uppercase"}
                        placeholder="VT0568"
                        {...register("serviceCode", { required: "El código es obligatorio" })}
                    />
                    {errors.serviceCode && (
                        <p className="text-xs text-red-600">{errors.serviceCode.message}</p>

                    )}

                </label>
                <label className="text-sm text-slate-600">
                    Servicio
                    <input
                        className={inputCls}
                        placeholder="Cambio de grifería"
                        {...register("serviceType", { required: "El servicio es obligatorio" })}
                    />
                    {errors.serviceType && (
                        <p className="text-xs text-red-600">{errors.serviceType.message}</p>
                    )}
                </label>

                <label className="text-sm text-slate-600">
                    Descripción
                    <textarea
                        className={inputCls}
                        rows={3}
                        placeholder="Detalle de la venta / trabajo"
                        {...register("description", { required: "La descripción es obligatoria" })}
                    />
                    {errors.description && (
                        <p className="text-xs text-red-600">{errors.description.message}</p>
                    )}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select
                        label="Colaborador"
                        value={watch("collaboratorId") ?? ""}
                        onChange={(value) =>
                            setValue("collaboratorId", value, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }
                        options={collaboratorOptions}
                        searchable
                    />

                    <label className="text-sm text-slate-600">
                        <Select
                            label="Cliente"
                            value={watch("clientId") ?? ""}
                            onChange={(value) =>
                                setValue("clientId", value, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                            }
                            options={clientOptions}
                            searchable
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-600">
                        Monto
                        <input
                            type="number"
                            step="0.01"
                            className={inputCls}
                            {...register("amount", {
                                valueAsNumber: true,
                                required: "El monto es obligatorio",
                                min: { value: 0, message: "No puede ser negativo" },
                            })}
                        />
                        {errors.amount && (
                            <p className="text-xs text-red-600">{errors.amount.message}</p>
                        )}
                    </label>

                    <label className="text-sm text-slate-600">
                        Comisión %
                        <input
                            type="number"
                            step="1"
                            className={inputCls}
                            {...register("commissionPercent", {
                                valueAsNumber: true,
                                required: "El porcentaje es obligatorio",
                                min: { value: 0, message: "No puede ser negativo" },
                            })}
                        />
                        {errors.commissionPercent && (
                            <p className="text-xs text-red-600">
                                {errors.commissionPercent.message}
                            </p>
                        )}
                    </label>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Comisión estimada</span>
                        <strong>{money(commissionAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Neto empresa</span>
                        <strong>{money(companyNet)}</strong>
                    </div>
                    <p className="text-xs text-slate-500">
                        Efectivo: el colaborador te debe el neto de empresa. Transferencia: la
                        empresa le debe la comisión.
                    </p>
                </div>

                <label className="text-sm text-slate-600">
                    Notas
                    <textarea
                        className={inputCls}
                        rows={2}
                        placeholder="Observaciones"
                        {...register("notes")}
                    />
                </label>
            </div>
        </Modal>
    );
}