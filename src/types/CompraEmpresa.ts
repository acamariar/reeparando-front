export type CompraEmpresa = {
    id: string;
    date: string;
    concept: string;
    category: string;
    amount: number;
    provider?: string | null;
    invoiceRef: string;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    deletedAt?: string | null;
    deletedReason?: string | null;
};

export type CreateCompraEmpresaPayload = {
    date: string;
    concept: string;
    category: string;
    amount: number;
    provider?: string;
    invoiceRef: string;
    notes?: string;
};

export type UpdateCompraEmpresaPayload = Partial<CreateCompraEmpresaPayload>;