export type TipoVisitaSeguimiento = "RELEVAMIENTO" | "TECNICA";

export type OrigenClienteSeguimiento =
    | "GOOGLE_ADS"
    | "FACEBOOK_ADs"
    | "INSTAGRAM_ADs"
    | "REFERIDO"
    | "RECURRENTE"
    | "WHATSAPP_DIRECTO";

export type EstadoSeguimiento =
    | "A_COORDINAR"
    | "APROBADO"
    | "RECHAZADO"
    | "CULMINADO"
    | "GARANTIA";

export type SeguimientoClient = {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
};

export type SeguimientoColaborador = {
    id: string;
    firstName: string;
    lastName: string;
    alias?: string | null;
    phone?: string | null;
};
export type MetodoCobroServicio = "EFECTIVO" | "TRANSFERENCIA";

export type Seguimiento = {
    id: string;
    numeroVisita: string;

    clientId: string;
    colaboradorId?: string | null;

    direccionServicio: string;
    tipoVisita: TipoVisitaSeguimiento;
    zona?: string | null;

    fechaSolicitud: string;
    fechaVisita?: string | null;

    servicioRequerido: string;
    tipoServicio?: string | null;
    origenCliente: OrigenClienteSeguimiento;
    estado: EstadoSeguimiento;

    montoPresupuestado: number;
    montoPagadoCliente: number;
    montoColaborador: number;
    montoReeparando: number;

    fechaLimiteGarantia?: string | null;
    observacionesCliente?: string | null;
    observacionesTecnicas?: string | null;

    createdAt: string;
    updatedAt?: string | null;
    deletedAt?: string | null;
    deletedReason?: string | null;

    client?: SeguimientoClient | null;
    colaborador?: SeguimientoColaborador | null;
    comisiones?: SeguimientoComision[];
    paymentMethod?: MetodoCobroServicio | null;
    fechaFinalizacion?: string | null;
};

export type CreateSeguimientoPayload = {
    numeroVisita: string;
    clientId: string;
    colaboradorId?: string;
    direccionServicio: string;
    tipoVisita: TipoVisitaSeguimiento;
    zona?: string;
    fechaSolicitud: string;
    fechaVisita?: string;
    servicioRequerido: string;
    tipoServicio?: string;
    origenCliente: OrigenClienteSeguimiento;
    estado?: EstadoSeguimiento;
    montoPresupuestado?: number;
    montoPagadoCliente?: number;
    montoColaborador?: number;
    montoReeparando?: number;
    fechaLimiteGarantia?: string;
    observacionesCliente?: string;
    observacionesTecnicas?: string;
    paymentMethod?: MetodoCobroServicio;
};

export type UpdateSeguimientoPayload = Partial<CreateSeguimientoPayload>;
export type FinalizarSeguimientoPayload = {
    paymentMethod: MetodoCobroServicio;
    montoPagadoCliente: number;
    montoColaborador: number;
    montoReeparando: number;
    fechaLimiteGarantia?: string;
    observacionesCliente?: string;
    observacionesTecnicas?: string;
    fechaFinalizacion?: string;
};
export type SeguimientoComision = {
    id: string;
    seguimientoId: string;
    colaboradorId: string;
    percentage: number;
    amount: number;
    paidAt?: string | null;
    notes?: string | null;
    deletedAt?: string | null;
    seguimiento?: {
        id: string;
        numeroVisita: string;
        tipoVisita: TipoVisitaSeguimiento;
        servicioRequerido: string;
        fechaSolicitud: string;
    } | null;
    colaborador?: {
        id: string;
        firstName: string;
        lastName: string;
        alias?: string | null;
    } | null;
};