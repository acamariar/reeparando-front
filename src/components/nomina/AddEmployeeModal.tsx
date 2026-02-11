import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../UI/Modal";
import { useBoundStore } from "../../store";

type FormValues = {
    firstName: string;
    lastName: string;
    birthDate: string;
    address: string;
    addressProof: string;
    criminalRecord: string;
    email: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    alias: string;
    cbu: string;
    specialty: string;
    coverageAreas: string;   // texto separado por comas
    availability: string;
    shirtSize: "XS" | "S" | "M" | "L" | "XL" | "XXL";
    shoeSize: string;
};

type Props = { open: boolean; onClose: () => void };

export default function AddEmployeeModal({ open, onClose }: Props) {
    const createEmployee = useBoundStore((s) => s.createEmployee);
    const getEmployees = useBoundStore((s) => s.getEmployees);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            birthDate: "",
            address: "",
            addressProof: "",
            criminalRecord: "",
            email: "",
            phone: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            alias: "",
            cbu: "",
            specialty: "",
            coverageAreas: "",
            availability: "",
            shirtSize: "XS",
            shoeSize: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                firstName: "",
                lastName: "",
                birthDate: "",
                address: "",
                addressProof: "",
                criminalRecord: "",
                email: "",
                phone: "",
                emergencyContactName: "",
                emergencyContactPhone: "",
                alias: "",
                cbu: "",
                specialty: "",
                coverageAreas: "",
                availability: "",
                shirtSize: "XS",
                shoeSize: ""
            });
        }
    }, [open, reset]);

    const onSubmit = async (values: FormValues) => {
        const newEmp = {
            ...values,
            saldoActual: 0,
            status: "activo" as const,
            coverageAreas: values.coverageAreas
                ? values.coverageAreas.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
            startDate: new Date().toISOString().slice(0, 10)
        };
        await createEmployee(newEmp);
        await getEmployees?.(1, 10);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Agregar empleado"
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
            <div className="grid gap-3 md:grid-cols-2">
                <Text label="Nombre" {...register("firstName")} />
                <Text label="Apellido" {...register("lastName")} />
                <Text label="Fecha de nacimiento" type="date" {...register("birthDate")} />
                <Text label="Teléfono" {...register("phone")} />
                <Text label="Email" {...register("email")} />
                <Text label="Dirección" className="md:col-span-2" {...register("address")} />
                <Text label="Comprobante domicilio" {...register("addressProof")} />
                <Text label="Antecedentes penales" {...register("criminalRecord")} />
                <Text label="Contacto de emergencia" {...register("emergencyContactName")} />
                <Text label="Tel. contacto emergencia" {...register("emergencyContactPhone")} />
                <Text label="Alias" {...register("alias")} />
                <Text label="CBU" {...register("cbu")} />
                <Text label="Especialidad" className="md:col-span-2" {...register("specialty")} />
                <Text label="Zonas (separar por coma)" className="md:col-span-2" {...register("coverageAreas")} />
                <Text label="Disponibilidad" className="md:col-span-2" {...register("availability")} />
                <Text label="Talle remera" {...register("shirtSize")} />
                <Text label="Talle calzado" {...register("shoeSize")} />

            </div>
        </Modal>
    );
}

type TextProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string };
function Text({ label, className = "", ...rest }: TextProps) {
    return (
        <label className={`text-sm text-slate-700 block ${className}`}>
            {label}
            <input
                {...rest}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
            />
        </label>
    );
}
