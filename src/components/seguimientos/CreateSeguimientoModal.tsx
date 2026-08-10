import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Modal } from "../UI/Modal";
import { Select } from "../UI/Select";
import { useBoundStore } from "../../store";
import type {
    CreateSeguimientoPayload,
    EstadoSeguimiento,
    OrigenClienteSeguimiento,
    Seguimiento,
    TipoVisitaSeguimiento,
} from "../../types/Seguimiento";

type Props = {
    open: boolean;
    onClose: () => void;
    mode: TipoVisitaSeguimiento;
    action?: "create" | "edit";
    seguimiento?: Seguimiento
};

type FormValues = {
    numeroVisita: string;
    clientId: string;
    colaboradorId?: string;
    direccionServicio: string;
    zona?: string;
    fechaSolicitud: string;
    fechaVisita?: string;
    horaVisita?: string;
    servicioRequerido: string;
    tipoServicio?: string;
    origenCliente: OrigenClienteSeguimiento;
    estado?: EstadoSeguimiento;
    montoPresupuestado?: number;
    observacionesCliente?: string;
};

const today = () => new Date().toLocaleDateString("en-CA");

function getBackendError(err: unknown) {
    if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        return Array.isArray(msg) ? msg[0] : msg ?? "No se pudo guardar el seguimiento";
    }

    return "No se pudo guardar el seguimiento";
}

export function CreateSeguimientoModal({ open, onClose, mode, seguimiento, action }: Props) {
    const createSeguimiento = useBoundStore((s) => s.createSeguimiento);
    const clientes = useBoundStore((s) => s.clients);
    const colaboradores = useBoundStore((s) => s.colaboradores);
    const getClients = useBoundStore((s) => s.getClients);
    const getColaboradores = useBoundStore((s) => s.getColaboradores);
    const updateSeguimiento = useBoundStore((s) => s.updateSeguimiento);
    const [backendError, setBackendError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<FormValues>({
        defaultValues: {
            numeroVisita: "",
            clientId: "",
            colaboradorId: "",
            direccionServicio: "",
            zona: "",
            fechaSolicitud: today(),
            fechaVisita: "",
            horaVisita: "",
            servicioRequerido: "",
            tipoServicio: "",
            origenCliente: "WHATSAPP_DIRECTO",
            estado: "A_COORDINAR",
            montoPresupuestado: 0,
            observacionesCliente: "",
        },
    });

    const emptyValues: FormValues = {
        numeroVisita: "",
        clientId: "",
        colaboradorId: "",
        direccionServicio: "",
        zona: "",
        fechaSolicitud: today(),
        fechaVisita: "",
        horaVisita: "",
        servicioRequerido: "",
        tipoServicio: "",
        origenCliente: "WHATSAPP_DIRECTO",
        estado: "A_COORDINAR",
        montoPresupuestado: 0,
        observacionesCliente: "",
    };

    useEffect(() => {
        if (!open) {
            reset(emptyValues);
            setBackendError("");
            return;
        }

        if (action === "edit" && seguimiento) {
            reset({
                numeroVisita: seguimiento.numeroVisita ?? "",
                clientId: seguimiento.clientId ?? "",
                colaboradorId: seguimiento.colaboradorId ?? "",
                direccionServicio: seguimiento.direccionServicio ?? "",
                zona: seguimiento.zona ?? "",
                fechaSolicitud: seguimiento.fechaSolicitud ?? today(),
                fechaVisita: seguimiento.fechaVisita ?? "",
                horaVisita: seguimiento.horaVisita ?? "",
                servicioRequerido: seguimiento.servicioRequerido ?? "",
                tipoServicio: seguimiento.tipoServicio ?? "",
                origenCliente: seguimiento.origenCliente ?? "WHATSAPP_DIRECTO",
                estado: seguimiento.estado ?? "A_COORDINAR",
                montoPresupuestado: seguimiento.montoPresupuestado ?? 0,
                observacionesCliente: seguimiento.observacionesCliente ?? "",
            });
        } else {
            reset(emptyValues);
        }

        void getClients(1, 5000).catch(() => { });
        void getColaboradores(1, 5000).catch(() => { });
        setBackendError("");
    }, [open, action, seguimiento, reset, getClients, getColaboradores]);

    const clientOptions = useMemo(
        () =>
            clientes.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
            })),
        [clientes]
    );

    const colaboradorOptions = useMemo(
        () =>
            colaboradores.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}${c.alias ? ` · ${c.alias}` : ""}`,
            })),
        [colaboradores]
    );

    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100";

    const onSubmit = async (values: FormValues) => {
        setBackendError("");

        const payload: CreateSeguimientoPayload = {
            numeroVisita: values.numeroVisita.trim(),
            clientId: values.clientId,
            colaboradorId: values.colaboradorId?.trim() || undefined,
            direccionServicio: values.direccionServicio.trim(),
            tipoVisita: mode,
            zona: values.zona?.trim() || undefined,
            fechaSolicitud: values.fechaSolicitud,
            fechaVisita: values.fechaVisita || undefined,
            horaVisita: values.horaVisita || undefined,
            servicioRequerido: values.servicioRequerido.trim(),
            tipoServicio: values.tipoServicio?.trim() || undefined,
            origenCliente: values.origenCliente,
            estado: values.estado ?? "A_COORDINAR",
            montoPresupuestado:
                mode === "TECNICA" ? Number(values.montoPresupuestado ?? 0) : 0,
            observacionesCliente: values.observacionesCliente?.trim() || undefined,
        };

        try {
            if (action === "edit" && seguimiento) {
                await updateSeguimiento(seguimiento.id, payload);
            } else {
                await createSeguimiento(payload);
            }
            reset();
            onClose();
        } catch (err: unknown) {
            setBackendError(getBackendError(err));
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "TECNICA" ? "Nueva visita técnica" : "Nuevo relevamiento"}
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
                    <label className="text-sm text-slate-700 block">
                        Número de visita
                        <input
                            {...register("numeroVisita", { required: "El número de visita es obligatorio" })}
                            className={inputCls}
                            placeholder="VT0701"
                        />
                        {errors.numeroVisita && (
                            <p className="text-xs text-rose-600">{errors.numeroVisita.message}</p>
                        )}
                    </label>

                    <Select
                        label="Cliente"
                        value={watch("clientId") ?? ""}
                        onChange={(value) => {
                            setValue("clientId", value, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });

                            const selectedClient = clientes.find((c) => c.id === value);

                            if (selectedClient) {
                                setValue("direccionServicio", selectedClient.address ?? "", {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });

                                setValue("zona", selectedClient.city ?? "", {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }
                        }}
                        options={clientOptions}
                        searchable
                    />
                </div>

                <label className="text-sm text-slate-700 block">
                    Dirección del servicio
                    <input
                        {...register("direccionServicio", {
                            required: "La dirección es obligatoria",
                        })}
                        className={inputCls}
                        placeholder="Av. Rivadavia 1234"

                    />
                    {errors.direccionServicio && (
                        <p className="text-xs text-rose-600">{errors.direccionServicio.message}</p>
                    )}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-700 block">
                        Zona
                        <input
                            {...register("zona")}
                            className={inputCls}
                            placeholder="Caballito"
                        />
                    </label>

                    <label className="text-sm text-slate-700 block">
                        Fecha de solicitud
                        <input
                            type="date"
                            {...register("fechaSolicitud", { required: "La fecha es obligatoria" })}
                            className={inputCls}
                        />
                        {errors.fechaSolicitud && (
                            <p className="text-xs text-rose-600">{errors.fechaSolicitud.message}</p>
                        )}
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-700 block">
                        Fecha de Visita
                        <input
                            type="date"
                            {...register("fechaVisita")}
                            className={inputCls}
                        />
                    </label>

                    <label className="text-sm text-slate-700 block">
                        Hora de Visita
                        <input
                            type="time"
                            {...register("horaVisita")}
                            className={inputCls}
                        />
                        {errors.fechaSolicitud && (
                            <p className="text-xs text-rose-600">{errors.fechaSolicitud.message}</p>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-700 block">
                        Servicio requerido
                        <input
                            {...register("servicioRequerido", {
                                required: "El servicio requerido es obligatorio",
                            })}
                            className={inputCls}
                            placeholder="Cambio de grifería"
                        />
                        {errors.servicioRequerido && (
                            <p className="text-xs text-rose-600">
                                {errors.servicioRequerido.message}
                            </p>
                        )}
                    </label>

                    <label className="text-sm text-slate-700 block">
                        Tipo de servicio
                        <input
                            {...register("tipoServicio")}
                            className={inputCls}
                            placeholder="Plomería"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-700 block">
                        Origen del cliente
                        <select {...register("origenCliente")} className={inputCls}>
                            <option value="GOOGLE_ADS">Google Ads</option>
                            <option value="FACEBOOK_ADS">Facebook Ads</option>
                            <option value="INSTAGRAM_ADS">Instagram Ads</option>
                            <option value="REFERIDO">Referido</option>
                            <option value="RECURRENTE">Cliente recurrente</option>
                            <option value="WHATSAPP_DIRECTO">WhatsApp directo</option>
                        </select>
                    </label>

                    <label className="text-sm text-slate-700 block">
                        Colaborador
                        <Select
                            label=""
                            value={watch("colaboradorId") ?? ""}
                            onChange={(value) =>
                                setValue("colaboradorId", value, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                            }
                            options={colaboradorOptions}
                            searchable
                        />
                    </label>
                </div>

                <label className="text-sm text-slate-700 block">
                    Estado
                    <select {...register("estado")} className={inputCls}>
                        <option value="A_COORDINAR">A coordinar</option>
                        <option value="APROBADO">Aprobado</option>
                        <option value="RECHAZADO">Rechazado</option>
                        <option value="CULMINADO">Culminado</option>
                        <option value="GARANTIA">Garantía</option>
                    </select>
                </label>

                {mode === "TECNICA" && (
                    <label className="text-sm text-slate-700 block">
                        Monto presupuestado
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            {...register("montoPresupuestado", {
                                valueAsNumber: true,
                                required: "El monto presupuestado es obligatorio",
                            })}
                            className={inputCls}
                        />
                        {errors.montoPresupuestado && (
                            <p className="text-xs text-rose-600">
                                {errors.montoPresupuestado.message}
                            </p>
                        )}
                    </label>
                )}

                <label className="text-sm text-slate-700 block">
                    Observaciones del cliente
                    <textarea
                        rows={3}
                        {...register("observacionesCliente")}
                        className={inputCls}
                        placeholder="Comentarios del cliente..."
                    />
                </label>

                {backendError && <p className="text-sm text-red-600">{backendError}</p>}
            </div>
        </Modal>
    );
}