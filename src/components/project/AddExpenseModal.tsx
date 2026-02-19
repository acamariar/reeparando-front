import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Modal } from "../UI/Modal";
import { useBoundStore } from "../../store";
import type { ProjectExpense } from "../../types/projectExpense";

type FormValues = {
    concept: string;
    category: string;
    amount: number;
    date: string;
    supplier?: string;
    invoiceRef: string;
};

const schema = yup.object({
    concept: yup.string().required("Ingresa un concepto"),
    category: yup.string().required("Selecciona una categoría"),
    amount: yup.number().typeError("Monto inválido").moreThan(0, "Debe ser mayor a 0").required(),
    date: yup.string().required("Fecha requerida"),
    supplier: yup.string().optional(),
    invoiceRef: yup.string().required("Numero de Factura Obligatorio"),
});

type Props = {
    open: boolean;
    onClose: () => void;
    projectId: string;
    categories?: string[]; // opcional
    initialValues?: ProjectExpense | null;
};

export default function AddExpenseModal({ open, onClose, projectId, categories = ["Materiales", "Mano de Obra", "Equipo", "Otros", "Contrafactura", "ContrafacturaPagada"], initialValues }: Props) {
    const { updateExpense, getExpensesByProject } = useBoundStore()
    const createExpense = useBoundStore((s) => s.createExpense); // del slice de gastos




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
            category: categories[0] ?? "Otros",
            amount: 0,
            date: new Date().toISOString().slice(0, 10),
            supplier: "",
            invoiceRef: "",
        },
    });
    useEffect(() => {
        if (initialValues) {
            reset({
                concept: initialValues.concept ?? "",
                category: initialValues.category ?? categories[0] ?? "Otros",
                amount: initialValues.amount ?? 0,
                date: initialValues.date ?? new Date().toISOString().slice(0, 10),
                supplier: initialValues.supplier ?? "",
                invoiceRef: initialValues.invoiceRef ?? "",
            });
        } else {
            reset({
                concept: "",
                category: categories[0] ?? "Otros",
                amount: 0,
                date: new Date().toISOString().slice(0, 10),
                supplier: "",
                invoiceRef: "",
            });
        }
    }, [initialValues, categories, reset]);


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
        if (initialValues?.id) {
            await updateExpense(initialValues.id, payload);
        } else {
            await createExpense(payload);
        }

        await getExpensesByProject(projectId, 1, 20);
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

                    <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="decimal"
                        value={useWatch({ control, name: "amount" }) ?? 0}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                        onValueChange={(v: NumberFormatValues) => {
                            setValue("amount", v.floatValue ?? 0, { shouldValidate: true });
                        }}
                        placeholder="$ 0.00"
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
