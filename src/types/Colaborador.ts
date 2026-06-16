export type Colaborador = {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    alias?: string | null;
    notes?: string | null;
    active: boolean;
    saldoActual: number;
    createdAt: string;
    deletedAt?: string | null;
    deletedReason?: string | null;
};

export type CreateColaboradorPayload = {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    alias?: string;
    notes?: string;
};

export type UpdateColaboradorPayload = Partial<CreateColaboradorPayload>;