import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Modal } from "../UI/Modal";
import { useBoundStore } from "../../store";

type FormValues = { amount?: number };

type Props = {
    open: boolean;
    onClose: () => void;
    projectId: string;
    currentBudget: number;
};

export default function AddBudgetModal({ open, onClose, projectId, currentBudget }: Props) {
    const updateProject = useBoundStore((s) => s.updateProject);
    const getProjects = useBoundStore((s) => s.getProjects);

    const { control, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: { amount: 0 },
    });

    useEffect(() => {
        if (open) reset({ amount: undefined });
    }, [open, reset]);

    const onSubmit = async (values: FormValues) => {
        const add = Number(values.amount ?? 0);
        if (!add) return onClose();
        await updateProject(projectId, { budget: currentBudget + add });
        await getProjects?.(1, 10);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Añadir presupuesto"
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
                <p className="text-sm text-slate-700">Monto a agregar al presupuesto actual</p>
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


            </div>
        </Modal>
    );
}
