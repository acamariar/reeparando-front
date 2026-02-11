import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
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

    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: { amount: undefined },
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
                <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                        <NumericFormat
                            {...field}
                            value={field.value ?? 0}
                            decimalSeparator="."
                            thousandSeparator=","
                            prefix="$ "
                            allowNegative={false}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                            onValueChange={({ floatValue }) => field.onChange(floatValue ?? 0)}
                            placeholder="$ 0.00"
                        />
                    )}
                />
            </div>
        </Modal>
    );
}
