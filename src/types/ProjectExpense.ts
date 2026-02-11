export type ProjectExpense = {
    id: string;
    projectId: string;
    concept: string;
    category: string;   // ej: materiales, mano de obra, equipo, otros
    amount: number;
    date: string;       // ISO yyyy-mm-dd
    supplier?: string;
    invoiceRef?: string;
};
