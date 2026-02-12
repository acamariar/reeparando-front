// src/pages/EmployeeDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import type { Employee } from "../types/Employee"; // ajusta la ruta/tipo
import { ArrowLeft, Save } from "lucide-react";

export default function EmployeeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getEmployeeById, updateEmployee } = useBoundStore();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [form, setForm] = useState<Partial<Employee>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            try {
                if (!id) return;
                const emp = await getEmployeeById(id);
                if (alive) {
                    setEmployee(emp);
                    setForm(emp);
                }
            } catch (e) {
                if (alive) setError("No se pudo cargar el empleado" + e);
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        return () => { alive = false; };
    }, [id, getEmployeeById]);

    const handleChange = (key: keyof Employee, value: Employee[keyof Employee]) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const handleSave = async () => {
        if (!employee || !id) return;
        setSaving(true);
        try {
            await updateEmployee(id, form);
            navigate(-1); // vuelve a la lista
        } catch (e) {
            setError("No se pudo guardar los cambios" + e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AppLayout><div className="p-6 text-sm text-slate-500">Cargando...</div></AppLayout>;
    if (error || !employee) return <AppLayout><div className="p-6 text-sm text-red-600">{error ?? "Empleado no encontrado"}</div></AppLayout>;

    return (
        <AppLayout>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Input label="Nombre" value={form.firstName ?? ""} onChange={(v) => handleChange("firstName", v)} />
                    <Input label="Apellido" value={form.lastName ?? ""} onChange={(v) => handleChange("lastName", v)} />
                    <Input label="Fecha de nacimiento" type="date" value={form.birthDate ?? ""} onChange={(v) => handleChange("birthDate", v)} />
                    <Input label="Correo" value={form.email ?? ""} onChange={(v) => handleChange("email", v)} />
                    <Input label="Teléfono" value={form.phone ?? ""} onChange={(v) => handleChange("phone", v)} />
                    <Input label="Alias" value={form.alias ?? ""} onChange={(v) => handleChange("alias", v)} />
                    <Input label="CBU" value={form.cbu ?? ""} onChange={(v) => handleChange("cbu", v)} />
                    <Input label="Dirección" value={form.address ?? ""} onChange={(v) => handleChange("address", v)} />
                    <Input label="Comprobante de domicilio" value={form.addressProof ?? ""} onChange={(v) => handleChange("addressProof", v)} />
                    <Input label="Antecedentes penales" value={form.criminalRecord ?? ""} onChange={(v) => handleChange("criminalRecord", v)} />
                    <Input label="Contacto de emergencia" value={form.emergencyContactName ?? ""} onChange={(v) => handleChange("emergencyContactName", v)} />
                    <Input label="Tel. contacto de emergencia" value={form.emergencyContactPhone ?? ""} onChange={(v) => handleChange("emergencyContactPhone", v)} />
                    <Input label="Especialidad" value={form.specialty ?? ""} onChange={(v) => handleChange("specialty", v)} />
                    <Input label="Disponibilidad" value={form.availability ?? ""} onChange={(v) => handleChange("availability", v)} />
                    <Input label="Talla camisa" value={form.shirtSize ?? ""} onChange={(v) => handleChange("shirtSize", v)} />
                    <Input label="Talla zapato" value={form.shoeSize ?? ""} onChange={(v) => handleChange("shoeSize", v)} />
                    <Input label="Estado" value={form.status ?? ""} onChange={(v) => handleChange("status", v)} />
                    <Input label="Fecha inicio" type="date" value={form.startDate ?? ""} onChange={(v) => handleChange("startDate", v)} />
                    <TextArea label="Zonas de cobertura (coma o salto de línea)"
                        value={Array.isArray(form.coverageAreas) ? form.coverageAreas.join("\n") : ""}
                        onChange={(v) => handleChange("coverageAreas", v.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean))}
                        className="md:col-span-2" />
                </div>
            </div>
        </AppLayout>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    disabled = false,
    className = "",
}: {
    label: string;
    value: string;
    type?: string;
    disabled?: boolean;
    className?: string;
    onChange: (v: string) => void;
}) {
    return (
        <label className={`text-sm text-slate-700 space-y-1 ${className}`}>
            <span>{label}</span>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:ring-emerald-200 disabled:bg-slate-100"
            />
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
    className = "",
}: {
    label: string;
    value: string;
    className?: string;
    onChange: (v: string) => void;
}) {
    return (
        <label className={`text-sm text-slate-700 space-y-1 ${className}`}>
            <span>{label}</span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:ring-emerald-200"
            />
        </label>
    );
}
