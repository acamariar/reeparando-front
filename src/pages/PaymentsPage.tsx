// src/pages/PaymentsPage.tsx
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";

import { useBoundStore } from "../store";
import Table from "../components/table/Table";
import { TrashIcon } from "@heroicons/react/16/solid";
import type { EmployeePayment } from "../types/EmployeePayment";


export default function PaymentsPage() {
    const {
        payments,
        paymentPage,
        paymentPageSize,
        paymentTotalPages,
        isLoadingPayments,
        paymentError,
        getPayments,
        employees,
        getEmployees
    } = useBoundStore();

    const deletePayment = useBoundStore((s) => s.deletePayment);   // DELETE /pagos/:id



    const [page, setPage] = useState(paymentPage);
    const [search, setSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");



    useEffect(() => {
        const t = setTimeout(() => {
            getEmployees(1, 50)
            getPayments(page, paymentPageSize, search || undefined, from || undefined, to || undefined);
        }, 300); // debounce
        return () => clearTimeout(t);
    }, [page, paymentPageSize, search, from, to, getPayments, getEmployees]);


    const employeeMap = useMemo(
        () =>
            Object.fromEntries(
                employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`])
            ),
        [employees]
    );
    // Prepara items; formatea fecha y monto si quieres
    const tableItems = useMemo(
        () =>
            payments.map((p) => ({
                ...p,
                amountFmt: `$${Number(p.amount ?? 0).toLocaleString()}`,
                employeeName: employeeMap[p.employeeId] ?? p.employeeId ?? "—",
            })),
        [payments, employeeMap]
    );

    // Columnas que se mostrarán
    const tableInfo = {
        Nombre: "employeeName",
        Fecha: "date",
        Tipo: "type",
        Monto: "amountFmt",
        Notas: "notes",
    };
    const handleDelete = async (paymentId: string) => {
        if (!confirm("¿Eliminar pago?")) return;
        await deletePayment(paymentId);
        await getPayments(page, paymentPageSize, search || undefined, from || undefined, to || undefined);
    };


    return (
        <AppLayout>
            <div className="space-y-4">
                <div className=" lg:flex lg:justify-between ">
                    <div>
                        <p className="text-sm text-slate-500">Pagos</p>
                        <h1 className="text-2xl font-bold text-accent">Historial de pagos</h1>
                    </div>
                    <div className="flex gap-2 items-center mt-4">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre..."
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>
                </div>



                {paymentError && <div className="text-red-600 text-sm">{paymentError}</div>}

                <Table
                    items={tableItems as EmployeePayment[]}
                    tableInfo={tableInfo}
                    page={page}
                    setPage={setPage}
                    totalPages={paymentTotalPages}
                    title="Pagos"
                    action={true}
                    renderActions={(item) => (
                        <div className="flex gap-2 justify-end">

                            <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => {

                                    handleDelete(item.id);
                                }}
                                title="Eliminar pago"
                            >
                                <TrashIcon className="w-3.5 max-h-3.5" />
                            </button>
                        </div>
                    )}
                >
                    {isLoadingPayments && (
                        <p className="text-sm text-slate-500 px-3">Cargando pagos...</p>
                    )}
                </Table>
            </div>

        </AppLayout>
    );
}
