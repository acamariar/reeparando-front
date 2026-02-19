import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal } from "../UI/Modal";
import type { ProjectCategory, ProjectStatus } from "../../types/project";
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
    status: ProjectStatus;
    startDate: string;
    endDate?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: Omit<FormValues, "team"> & { team: string[] }) => Promise<void> | void;
    mode?: "create" | "edit";
    initialValues?: Partial<FormValues>;
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
    startDate: yup.string().required("Fecha de inicio requerida"),
    endDate: yup.string().default(""),
    status: yup.mixed<ProjectStatus>().oneOf(["EN_PROGRESO", "FINALIZADA", "ATRASADA", "GARANTIA"]).required(),

});

export default function CreateProjectModal({ open, onClose, onSubmit, mode = "create", initialValues }: Props) {
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
            startDate: "",
            endDate: "",
            status: "EN_PROGRESO",
            description: "",
            team: "",
        },
    });
    useEffect(() => {
        if (open && initialValues) {
            reset({
                name: initialValues.name ?? "",
                client: initialValues.client ?? "",
                address: initialValues.address ?? "",
                category: initialValues.category ?? "refaccion",
                budget: initialValues.budget ?? 0,
                dueDate: initialValues.dueDate ?? "",
                startDate: initialValues.startDate ?? "",
                endDate: initialValues.endDate ?? "",
                status: initialValues.status ?? "EN_PROGRESO",
                description: initialValues.description ?? "",
                team: (initialValues.team as unknown as string[])?.join(", ") ?? "",
            });
        }
        if (!open) reset();
    }, [open, initialValues, reset]);



    // usar useWatch en vez de watch
    const client = useWatch({ control, name: "client", defaultValue: "" });

    const teamIds = useWatch({ control, name: "team" });

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
        <Modal open={open} onClose={onClose} title={mode === "edit" ? "Editar proyecto" : "Nuevo proyecto"}>
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
                        <NumericFormat
                            thousandSeparator="."
                            decimalSeparator=","
                            allowNegative={false}
                            inputMode="decimal"
                            value={useWatch({ control, name: "budget" }) ?? 0}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                            onValueChange={(v: NumberFormatValues) => {
                                setValue("budget", v.floatValue ?? 0, { shouldValidate: true });
                            }}
                            placeholder="$ 0.00"
                        />
                        {errors.budget && <p className="text-xs text-red-600">{errors.budget.message}</p>}
                    </label>
                    <label className="text-sm text-slate-600">
                        Fecha de inicio
                        <input
                            type="date"
                            {...register("startDate")}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.startDate && (
                            <p className="text-xs text-red-600">{errors.startDate.message}</p>
                        )}
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
