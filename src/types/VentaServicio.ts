export type MetodoCobroServicio = "EFECTIVO" | "TRANSFERENCIA";

export type TipoMovimientoColaborador =
    | "VENTA"
    | "PAGO"
    | "AJUSTE"
    | "LIQUIDACION";

export type DireccionCuentaColaborador =
    | "COLABORADOR_DEBE_EMPRESA"
    | "EMPRESA_DEBE_COLABORADOR";

export type VentaServicio = {
    id: string;
    date: string;
    serviceCode: string;
    description: string;
    serviceType: string;
    paymentMethod: MetodoCobroServicio;
    collaboratorId?: string | null;
    clientId?: string | null;
    clientName?: string | null;
    amount: number;
    commissionPercent: number;
    commissionAmount: number;
    companyNet: number;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    deletedAt?: string | null;
    deletedReason?: string | null;
};

export type CreateVentaServicioPayload = {
    date: string;
    description: string;
    serviceCode: string;
    serviceType: string;
    paymentMethod: MetodoCobroServicio;
    collaboratorId?: string;
    clientId?: string;
    clientName?: string;
    amount: number;
    commissionPercent?: number;
    notes?: string;
};

export type UpdateVentaServicioPayload = Partial<CreateVentaServicioPayload>;

export type MovimientoCuentaColaborador = {
    id: string;
    collaboratorId: string;
    saleId?: string | null;
    type: TipoMovimientoColaborador;
    direction: DireccionCuentaColaborador;
    amount: number;
    paidAmount: number;
    pendingAmount: number;
    createdAt: string;
    paidAt?: string | null;
    notes?: string | null;
    deletedAt?: string | null;
};

export type CreateMovimientoCuentaColaboradorPayload = {
    collaboratorId: string;
    saleId?: string;
    type: TipoMovimientoColaborador;
    direction: DireccionCuentaColaborador;
    amount: number;
    paidAmount?: number;
    paidAt?: string;
    pendingAmount?: number;
    notes?: string;
};

export type UpdateMovimientoCuentaColaboradorPayload =
    Partial<CreateMovimientoCuentaColaboradorPayload>;