import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal } from "../UI/Modal";
import type { ProjectCategory } from "../../types/project";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { useBoundStore } from "../../store";
import { Select } from "../UI/Select";
import type { Employee } from "../../types/Employee";

type FormValues = {
    name: string;
    client: string;
    address: string;
    category: ProjectCategory;
    budget: number;
    dueDate: string;
    description: string;
    team: string; // comma separated
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: Omit<FormValues, "team"> & { team: string[] }) => Promise<void> | void;
};

const schema: yup.ObjectSchema<FormValues> = yup.object({
    name: yup.string().required("Nombre requerido"),
    client: yup.string().required("Cliente requerido"),
    address: yup.string().required("Dirección requerida"),
    category: yup.mixed<ProjectCategory>().oneOf(["impermeabilizacion", "refaccion", "puesto de Trabajo", "pintura"]).required(),
    budget: yup.number().typeError("Monto inválido").min(0, "No negativo").required("Presupuesto requerido"),
    dueDate: yup.string().required("Fecha requerida"),
    description: yup.string().default(""),
    team: yup.string().default(""),
});

export default function CreateProjectModal({ open, onClose, onSubmit }: Props) {
    const employees = useBoundStore((s) => s.employees);
    const employeePage = useBoundStore((s) => s.employeePage);
    const employeeTotalItems = useBoundStore((s) => s.employeeTotalItems);
    const getEmployees = useBoundStore((s) => s.getEmployees);
    const clients = useBoundStore((s) => s.clients);
    const getClients = useBoundStore((s) => s.getClients);

    const { control, register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            client: "",
            address: "",
            category: "refaccion",
            budget: 0,
            dueDate: "",
            description: "",
            team: "",
        },
    });

    // usar useWatch en vez de watch
    const client = useWatch({ control, name: "client", defaultValue: "" });

    const teamIds = useWatch({ control, name: "team" });
    const budget = useWatch({ control, name: "budget", defaultValue: 0 });
    const submit = async (values: FormValues) => {
        await onSubmit({
            ...values,
            team: values.team
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        });
        reset();
        onClose();
    };
    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName} · ${e.id}`,
    }));
    const clientOptions = clients.map((c) => ({
        value: c.id,
        label: `${c.firstName} ${c.lastName} · ${c.dni}`,
    }));
    useEffect(() => {
        if (!open) reset();
        if (open) getEmployees(employeePage, employeeTotalItems).catch(() => { });
        if (open) getClients(1, 50).catch(() => { });
    }, [open, reset, getEmployees, employeePage, employeeTotalItems, getClients]);

    return (
        <Modal open={open} onClose={onClose} title="Nuevo proyecto">
            <form className="space-y-3" onSubmit={handleSubmit(submit)}>
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm text-slate-600">
                        Nombre
                        <input {...register("name")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100" />
                        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                    </label>
                    <Select
                        label="Cliente"
                        value={client}
                        onChange={(v) => setValue("client", v, { shouldValidate: true, shouldDirty: true })}
                        options={clientOptions}
                        error={errors.client?.message}

                    />
                    <label className="text-sm text-slate-600 col-span-2">
                        Dirección
                        <input {...register("address")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100" />
                        {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
                    </label>

                    <label className="text-sm text-slate-600">
                        Categoría
                        <select {...register("category")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100">
                            <option value="impermeabilizacion">Impermeabilización</option>
                            <option value="refaccion">Refacción</option>
                            <option value="puesto de Trabajo">Puesto de trabajo</option>
                            <option value="pintura">Pintura</option>
                        </select>
                    </label>
                    <label className="text-sm text-slate-600">
                        Presupuesto
                        <Controller
                            control={control}
                            name="budget"
                            render={({ field }) => (
                                <NumericFormat
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                                    {...field}
                                    value={budget ?? 0} // vacío al iniciar
                                    thousandSeparator=","
                                    decimalSeparator="."
                                    prefix="$ "
                                    allowNegative={false}
                                    inputMode="decimal"
                                    placeholder="$ 0.00"
                                    onValueChange={(v: NumberFormatValues) => {
                                        setValue("budget", v.floatValue ?? 0, { shouldValidate: true })
                                    }}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {errors.budget && <p className="text-xs text-red-600">{errors.budget.message}</p>}
                    </label>
                    <label className="text-sm text-slate-600">
                        Fecha límite
                        <input type="date" {...register("dueDate")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100" />
                        {errors.dueDate && <p className="text-xs text-red-600">{errors.dueDate.message}</p>}
                    </label>
                    <Select
                        label="Equipo asignado"
                        value={teamIds}
                        onChange={(val) =>
                            setValue("team", val as Employee["lastName"], { shouldValidate: true, shouldDirty: true })
                        }
                        options={employeeOptions}
                        searchable={true}
                        error={errors.team?.message}
                    />

                </div>

                <label className="text-sm text-slate-600 block">
                    Descripción
                    <textarea {...register("description")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100" rows={2} />
                </label>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
