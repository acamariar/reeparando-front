import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { NumericFormat } from "react-number-format";
import { Modal } from "../UI/Modal";
import { useBoundStore } from "../../store";
import type { ProjectExpense } from "../../types/projectExpense";

type FormValues = {
    concept: string;
    category: string;
    amount: number;
    date: string;
    supplier?: string;
    invoiceRef?: string;
};

const schema = yup.object({
    concept: yup.string().required("Ingresa un concepto"),
    category: yup.string().required("Selecciona una categoría"),
    amount: yup.number().typeError("Monto inválido").moreThan(0, "Debe ser mayor a 0").required(),
    date: yup.string().required("Fecha requerida"),
    supplier: yup.string().optional(),
    invoiceRef: yup.string().optional(),
});

type Props = {
    open: boolean;
    onClose: () => void;
    projectId: string;
    categories?: string[]; // opcional
};

export default function AddExpenseModal({ open, onClose, projectId, categories = ["Materiales", "Mano de Obra", "Equipo", "Otros"] }: Props) {
    const createExpense = useBoundStore((s) => s.createExpense); // del slice de gastos
    const {
        handleSubmit,
        control,
        register,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            concept: "",
            category: categories[0] ?? "Otros",
            amount: 0,
            date: new Date().toISOString().slice(0, 10),
            supplier: "",
            invoiceRef: "",
        },
    });

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const onSubmit = async (values: FormValues) => {
        const payload: Omit<ProjectExpense, "id"> = {
            projectId,
            concept: values.concept,
            category: values.category,
            amount: values.amount,
            date: values.date,
            supplier: values.supplier || "",
            invoiceRef: values.invoiceRef || "",
        };
        await createExpense(payload);
        reset();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Nuevo gasto"
            footer={
                <div className="flex justify-end gap-2">
                    <button className="px-3 py-2 rounded border" onClick={onClose}>Cancelar</button>
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
                    Concepto
                    <input
                        {...register("concept")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                        placeholder="Ej. Membrana, mano de obra..."
                    />
                    {errors.concept && <p className="text-xs text-rose-600">{errors.concept.message}</p>}
                </label>

                <label className="text-sm text-slate-700 block">
                    Categoría
                    <select
                        {...register("category")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                    >
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-xs text-rose-600">{errors.category.message}</p>}
                </label>

                <label className="text-sm text-slate-700 block">
                    Monto
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field }) => (
                            <NumericFormat
                                {...field}
                                value={field.value ?? ""}
                                thousandSeparator=","
                                decimalSeparator="."
                                prefix="$ "
                                allowNegative={false}
                                fixedDecimalScale
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                                onValueChange={({ floatValue }) => field.onChange(floatValue ?? 0)}
                                placeholder="$ 0.00"
                            />
                        )}
                    />
                    {errors.amount && <p className="text-xs text-rose-600">{errors.amount.message}</p>}
                </label>

                <label className="text-sm text-slate-700 block">
                    Fecha
                    <input
                        type="date"
                        {...register("date")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                    />
                    {errors.date && <p className="text-xs text-rose-600">{errors.date.message}</p>}
                </label>

                <label className="text-sm text-slate-700 block">
                    Proveedor (opcional)
                    <input
                        {...register("supplier")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                    />
                </label>

                <label className="text-sm text-slate-700 block">
                    Ref. factura (opcional)
                    <input
                        {...register("invoiceRef")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                    />
                </label>
            </div>
        </Modal>
    );
}
