export type PanelVisitItem = {
    id: string;
    numeroVisita: string;
    fechaSolicitud: string;
    fechaVisita?: string | null;
    horaVisita?: string | null;
    estado: "A_COORDINAR" | "APROBADO" | "RECHAZADO" | "CULMINADO" | "GARANTIA";
    tipoVisita: "RELEVAMIENTO" | "TECNICA";
    servicioRequerido: string;
    tipoServicio?: string | null;
    direccionServicio: string;
    zona?: string | null;
    clientName: string;
    clientPhone?: string | null;
    colaboradorName: string;
    colaboradorPhone?: string | null;
    agendaLabel: string;
    fichaText: string;
    reminderClientText: string;
    reminderCollaboratorText: string;
    whatsappClientUrl: string;
    whatsappCollaboratorUrl: string;
};

export type PanelBucket = {
    count: number;
    items: PanelVisitItem[];
};

export type PanelResumen = {
    date: string;
    nextDate: string;
    today: PanelBucket;
    tomorrow: PanelBucket;
    overdue: PanelBucket;
    alerts: {
        todayPending: number;
        tomorrowPending: number;
        overduePending: number;
        totalPending: number;
    };
};