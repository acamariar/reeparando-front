import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Modal } from "../UI/Modal";
import { Select } from "../UI/Select";
import { useBoundStore } from "../../store";

type FormValues = {
    type: "pago" | "adelanto";
    date: string;
    amount: number;
    notes?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
};

export default function AddPaymentModal({ open, onClose, employeeId, employeeName }: Props) {
    const createPayment = useBoundStore((s) => s.createPayment);
    const updateEmployee = useBoundStore((s) => s.updateEmployee);
    const employees = useBoundStore((s) => s.employees);
    const getPaymentsByEmployee = useBoundStore((s) => s.getPaymentsByEmployee);
    const employee = employees.find((e) => e.id === employeeId);

    const { control, handleSubmit, register, reset, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            type: "pago",
            date: new Date().toISOString().slice(0, 10),
            amount: 0,
            notes: ""
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                type: "pago",
                date: new Date().toISOString().slice(0, 10),
                amount: 0,
                notes: ""
            });
        }
    }, [open, reset]);

    const onSubmit = async (values: FormValues) => {
        const amt = values.amount ?? 0;
        if (!amt) return;
        await createPayment({
            employeeId,
            date: values.date,
            type: values.type,
            amount: amt,
            notes: values.notes,
        });
        // Resta el pago del saldo
        if (employee) {
            await updateEmployee(employeeId, { saldoActual: (employee.saldoActual ?? 0) - amt });
        }
        await getPaymentsByEmployee(employeeId, undefined, 1, 10);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Pagar a ${employeeName}`}
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
                <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <Select
                            label="Tipo"
                            value={field.value}
                            onChange={(v: string) => field.onChange(v)}   // v = "pago" | "adelanto"
                            options={[
                                { value: "pago", label: "Pago" },
                                { value: "adelanto", label: "Adelanto" },
                            ]}

                        />
                    )}
                />



                <label className="text-sm text-slate-700 block">
                    Fecha
                    <input
                        type="date"
                        {...register("date")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                    />
                </label>

                <label className="text-sm text-slate-700 block">
                    Monto
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
                </label>

                <label className="text-sm text-slate-700 block">
                    Nota (opcional)
                    <textarea
                        {...register("notes")}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                        rows={2}
                    />
                </label>
            </div>
        </Modal>
    );
}
