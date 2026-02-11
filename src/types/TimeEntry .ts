export type TimeEntry = {
    id: string;
    projectId: string;
    employeeId: string;
    date: string;       // yyyy-mm-dd
    hours: number;      // horas trabajadas ese día
    amount: number;    // si no se envía, se calcula horas * hourlyRate en el cliente
    notes?: string;
};
