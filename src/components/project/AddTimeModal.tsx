import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Modal } from "../UI/Modal";
import { Select } from "../UI/Select";
import { useBoundStore } from "../../store";

type FormValues = {
    employeeId: string;
    date: string;
    hours: number;
    amount: number;   // pago del día
    notes?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    projectId: string;
    teamIds: string[];
};

export default function AddTimeModal({ open, onClose, projectId, teamIds }: Props) {
    const employees = useBoundStore((s) => s.employees);
    const getEmployees = useBoundStore((s) => s.getEmployees);
    const createTime = useBoundStore((s) => s.createTime);
    const getTimeByProject = useBoundStore((s) => s.getTimeByProject);
    const updateEmployee = useBoundStore((s) => s.updateEmployee)
    const createExpense = useBoundStore((s) => s.createExpense)

    const { control, handleSubmit, register, reset, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            employeeId: "",
            date: new Date().toISOString().slice(0, 10),
            hours: 0,
            amount: 0,
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            getEmployees?.(1, 200).catch(() => { });
            reset({
                employeeId: "",
                date: new Date().toISOString().slice(0, 10),
                hours: 0,
                amount: 0,
                notes: "",
            });
        }
    }, [open, getEmployees, reset]);

    const options = useMemo(
        () =>
            employees
                .filter((e) => teamIds.includes(e.id))
                .map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })),
        [employees, teamIds]
    );


    const onSubmit = async (values: FormValues) => {
        if (!values.employeeId) return;            // bloqueo mínimo
        const hours = values.hours ?? 0;
        const amount = values.amount ?? 0;
        const emp = employees.find(e => e.id === values.employeeId);
        const add = Number(values.amount ?? 0);
        await createTime({
            projectId,
            employeeId: values.employeeId,
            date: values.date,
            hours,
            amount,
            notes: values.notes,
        });
        if (emp && add) {
            await updateEmployee(values.employeeId, { saldoActual: (emp.saldoActual ?? 0) + add });
        }
        await getTimeByProject(projectId, 1, 200);
        await getEmployees?.(1, 100);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Añadir horas"
            footer={
                <div className="flex justify-end gap-2">
                    <button type="button" className="px-3 py-2 rounded border" onClick={onClose}>Cancelar</button>
                    <button
                        type="button"
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
                    name="employeeId"
                    render={({ field }) => (
                        <Select
                            label="Empleado"
                            value={field.value}
                            onChange={(v: string) => field.onChange(v)}
                            options={options}
                            error={undefined}
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
                    Horas trabajadas
                    <Controller
                        control={control}
                        name="hours"
                        render={({ field }) => (
                            <NumericFormat
                                {...field}
                                value={field.value ?? 0}
                                allowNegative={false}
                                decimalSeparator="."
                                thousandSeparator=","
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                                onValueChange={({ floatValue }) => field.onChange(floatValue ?? 0)}
                                placeholder="0.00"
                            />
                        )}
                    />
                </label>

                <label className="text-sm text-slate-700 block">
                    Monto pagado (día)
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
                    Notas (opcional)
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
