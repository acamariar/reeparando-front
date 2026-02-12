// src/pages/PaymentsPage.tsx
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";

import { useBoundStore } from "../store";
import Table from "../components/table/Table";


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

    const [page, setPage] = useState(paymentPage);

    useEffect(() => {
        void getPayments(page, paymentPageSize);
        getEmployees(1, 100)
    }, [page, paymentPageSize, getPayments, getEmployees]);


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
        Fecha: "date",
        Tipo: "type",
        Monto: "amountFmt",
        Notas: "notes",
    };

    return (
        <AppLayout>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-slate-500">Pagos</p>
                    <h1 className="text-2xl font-bold text-accent">Historial de pagos</h1>
                </div>

                {paymentError && <div className="text-red-600 text-sm">{paymentError}</div>}

                <Table
                    items={tableItems as any}
                    tableInfo={tableInfo}
                    page={page}
                    setPage={setPage}
                    totalPages={paymentTotalPages}
                    title="Pagos"
                    action={false}
                >
                    {isLoadingPayments && (
                        <p className="text-sm text-slate-500 px-3">Cargando pagos...</p>
                    )}
                </Table>
            </div>
        </AppLayout>
    );
}
