export type EmployeePaymentType = "adelanto" | "pago";

export type EmployeePayment = {
    id: string;
    employeeId: string;
    projectId?: string;   // opcional, si quieres asociar a una obra
    date: string;         // yyyy-mm-dd
    type: EmployeePaymentType;
    amount: number;
    notes?: string;
};
