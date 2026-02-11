import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal } from "../UI/Modal";
import { Select } from "../UI/Select";
import { useBoundStore } from "../../store";

type FormValues = { employeeId: string };

const schema = yup.object({
    employeeId: yup.string().required("Selecciona personal"),
});

type Props = {
    open: boolean;
    onClose: () => void;
    projectId: string;
    currentTeam: string[];
};

export default function AddTeamModal({ open, onClose, projectId, currentTeam }: Props) {
    const getEmployees = useBoundStore((s) => s.getEmployees);
    const employees = useBoundStore((s) => s.employees);
    const updateProject = useBoundStore((s) => s.updateProject);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { employeeId: "" },
    });

    useEffect(() => {
        if (open) {
            getEmployees?.(1, 100).catch(() => { });
            reset({ employeeId: "" });
        }
    }, [open, getEmployees, reset]);

    const options = useMemo(
        () => employees.map((e) => ({
            value: e.id,
            label: `${e.firstName} ${e.lastName} · ${e.specialty}`,
            disabled: currentTeam.includes(e.id),
        })),
        [employees, currentTeam]
    );

    const onSubmit = async (values: FormValues) => {
        if (!values.employeeId || currentTeam.includes(values.employeeId)) return onClose();
        await updateProject(projectId, { team: [...currentTeam, values.employeeId] });
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Añadir personal"
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
            <div className="space-y-2">
                <p className="text-sm text-slate-700">Selecciona personal</p>
                <Controller
                    control={control}
                    name="employeeId"
                    render={({ field }) => (
                        <Select
                            label=""
                            value={field.value}
                            onChange={(v: string) => field.onChange(v)}
                            options={options}
                            error={errors.employeeId?.message}
                        />
                    )}
                />
            </div>
        </Modal>
    );
}
