import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Modal } from "../UI/Modal";
import { useBoundStore } from "../../store";
import type { CompraEmpresa } from "../../types/CompraEmpresa";

type FormValues = {
    concept: string;
    category: string;
    amount: number;
    date: string;
    provider?: string;
    invoiceRef: string;
    notes?: string;
};

const schema = yup.object({
    concept: yup.string().required("Ingresa un concepto"),
    category: yup.string().required("Selecciona una categoría"),
    amount: yup
        .number()
        .typeError("Monto inválido")
        .moreThan(0, "Debe ser mayor a 0")
        .required("El monto es obligatorio"),
    date: yup.string().required("Fecha requerida"),
    provider: yup.string().optional(),
    invoiceRef: yup.string().required("La referencia de factura es obligatoria"),
    notes: yup.string().optional(),
});

type Props = {
    open: boolean;
    onClose: () => void;
    initialValues?: CompraEmpresa | null;
};

export default function CreateCompraEmpresaModal({
    open,
    onClose,
    initialValues,
}: Props) {
    const createCompra = useBoundStore((s) => s.createCompra);
    const updateCompra = useBoundStore((s) => s.updateCompra);

    const [backendError, setBackendError] = useState("");

    const {
        handleSubmit,
        control,
        register,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            concept: "",
            category: "Materiales",
            amount: 0,
            date: new Date().toISOString().slice(0, 10),
            provider: "",
            invoiceRef: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            setBackendError("");

            if (initialValues) {
                reset({
                    concept: initialValues.concept ?? "",
                    category: initialValues.category ?? "Materiales",
                    amount: initialValues.amount ?? 0,
                    date: initialValues.date ?? new Date().toISOString().slice(0, 10),
                    provider: initialValues.provider ?? "",
                    invoiceRef: initialValues.invoiceRef ?? "",
                    notes: initialValues.notes ?? "",
                });
            } else {
                reset({
                    concept: "",
                    category: "Materiales",
                    amount: 0,
                    date: new Date().toISOString().slice(0, 10),
                    provider: "",
                    invoiceRef: "",
                    notes: "",
                });
            }
        } else {
            reset();
            setBackendError("");
        }
    }, [open, initialValues, reset]);

    const amount = useWatch({ control, name: "amount" }) ?? 0;

    const categories = [
        "Materiales",
        "Mano de Obra",
        "Herramientas",
        "Traslado",
        "Alquiler",
        "Servicios",
        "Otros",
    ];

    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100";

    const onSubmit = async (values: FormValues) => {
        setBackendError("");

        const payload = {
            concept: values.concept.trim(),
            category: values.category.trim(),
            amount: Number(values.amount ?? 0),
            date: values.date,
            provider: values.provider?.trim() || undefined,
            invoiceRef: values.invoiceRef.trim(),
            notes: values.notes?.trim() || undefined,
        };

        try {
            if (initialValues?.id) {
                await updateCompra(initialValues.id, payload);
            } else {
                await createCompra(payload);
            }

            reset();
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setBackendError(
                Array.isArray(msg) ? msg[0] : msg || "No se pudo guardar la compra",
            );
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={initialValues?.id ? "Editar compra" : "Nuevo gasto"}
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
                <label className="text-sm text-slate-700 block">
                    Ref. factura
                    <input
                        {...register("invoiceRef")}
                        className={inputCls}
                        placeholder="FAC-000123"
                    />
                    {errors.invoiceRef && (
                        <p className="text-xs text-rose-600">{errors.invoiceRef.message}</p>
                    )}
                </label>

                {backendError && (
                    <p className="text-sm text-red-600">{backendError}</p>
                )}
                <label className="text-sm text-slate-700 block">
                    Concepto
                    <input
                        {...register("concept")}
                        className={inputCls}
                        placeholder="Ej. Membrana, mano de obra..."
                    />
                    {errors.concept && (
                        <p className="text-xs text-rose-600">{errors.concept.message}</p>
                    )}
                </label>

                <label className="text-sm text-slate-700 block">
                    Categoría
                    <select {...register("category")} className={inputCls}>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="text-xs text-rose-600">{errors.category.message}</p>
                    )}
                </label>

                <label className="text-sm text-slate-700 block">
                    Monto
                    <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="decimal"
                        value={amount}
                        className={inputCls}
                        onValueChange={(v: NumberFormatValues) => {
                            setValue("amount", v.floatValue ?? 0, { shouldValidate: true });
                        }}
                        placeholder="$ 0"
                    />
                    {errors.amount && (
                        <p className="text-xs text-rose-600">{errors.amount.message}</p>
                    )}
                </label>

                <label className="text-sm text-slate-700 block">
                    Fecha
                    <input type="date" {...register("date")} className={inputCls} />
                    {errors.date && (
                        <p className="text-xs text-rose-600">{errors.date.message}</p>
                    )}
                </label>

                <label className="text-sm text-slate-700 block">
                    Proveedor
                    <input
                        {...register("provider")}
                        className={inputCls}
                        placeholder="Opcional"
                    />
                </label>


            </div>
        </Modal>
    );
}