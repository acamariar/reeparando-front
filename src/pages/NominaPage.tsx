// src/pages/Nomina.tsx
import { useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import AddPaymentModal from "../components/nomina/AddPaymentModal";
import AddEmployeeModal from "../components/nomina/AddEmployeeModal";
import { useNavigate } from "react-router-dom";


export default function NominaPage() {
    const employees = useBoundStore((s) => s.employees);
    const getEmployees = useBoundStore((s) => s.getEmployees);
    // TODO: conecta estos modales

    const [payEmpId, setPayEmpId] = useState<string | null>(null);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const navigate = useNavigate()


    useEffect(() => {
        getEmployees?.(1, 20).catch(() => { });
    }, [getEmployees]);

    return (
        <AppLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Nómina</p>
                        <h1 className="text-2xl font-bold text-accent">Resumen de personal</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white  hover:bg-primary/90"
                            onClick={() => setShowAddEmployee(true)}
                        >
                            <Plus className="w-4 h-4" /> Agregar empleado
                        </button>
                        <button
                            onClick={() => navigate("/nomina/pagos")}
                            className="inline-flex mr-1.5 items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                        >
                            Pagos Realizados
                        </button>

                    </div>
                </div>

                {/* Lista */}
                <div className="grid gap-3 lg:grid-cols-2">
                    {employees.map((e) => (
                        <div
                            key={e.id}
                            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">
                                    {e.firstName[0]}{e.lastName[0]}
                                </div>
                                <div>
                                    <p
                                        onClick={() => navigate(`/empleados/${e.id}`)}
                                        className="font-semibold text-slate-900 cursor-pointer hover:underline ">{e.firstName} {e.lastName}</p>
                                    <p className="text-xs text-slate-500">{e.specialty}</p>
                                    <p className="text-xs text-slate-500">{e.phone}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Saldo actual</p>
                                <p className={`text-lg font-bold ${Number(e.saldoActual ?? 0) > 0 ? "text-rose-600" : "text-green-600"}`}>
                                    ${Number(e.saldoActual ?? 0).toLocaleString()}
                                </p>
                                <button
                                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                                    onClick={() => setPayEmpId(e.id)}
                                >
                                    <Wallet className="w-4 h-4" /> Pagar
                                </button>
                            </div>
                        </div>
                    ))}
                    {employees.length === 0 && (
                        <div className="text-sm text-slate-500">No hay empleados cargados.</div>
                    )}
                </div>
            </div>
            <AddPaymentModal
                open={!!payEmpId}
                onClose={() => setPayEmpId(null)}
                employeeId={payEmpId ?? ""}
                employeeName={employees.find(e => e.id === payEmpId)?.firstName + " " + employees.find(e => e.id === payEmpId)?.lastName || ""}
            />
            <AddEmployeeModal
                open={showAddEmployee}
                onClose={() => setShowAddEmployee(false)} />
        </AppLayout >
    );
}
