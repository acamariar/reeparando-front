import { useEffect } from "react";
import { CalendarDays, MessageCircle, AlarmClock, ArrowRight } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import type { PanelVisitItem } from "../types/Panel";



function formatShortDate(value?: string | null) {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00-03:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
    }).format(date);
}

function formatTime(value?: string | null) {
    if (!value) return "—";

    const raw = value.trim();
    if (/^\d{1,2}$/.test(raw)) {
        return `${raw.padStart(2, "0")}:00`;
    }

    if (/^\d{1,2}:\d{2}$/.test(raw)) {
        const [h, m] = raw.split(":");
        return `${h.padStart(2, "0")}:${m}`;
    }

    return raw;
}

function formatAgenda(item: PanelVisitItem) {
    if (!item.fechaVisita) return "—";
    const date = formatShortDate(item.fechaVisita);
    const time = formatTime(item.horaVisita);
    return time === "—" ? date : `${date} a las ${time}`;
}

export default function PanelCentral() {
    const panelResumen = useBoundStore((s) => s.panelResumen);
    const isLoadingPanel = useBoundStore((s) => s.isLoadingPanel);
    const panelError = useBoundStore((s) => s.panelError);
    const panelDate = useBoundStore((s) => s.panelDate);
    const setPanelDate = useBoundStore((s) => s.setPanelDate);
    const getPanelResumen = useBoundStore((s) => s.getPanelResumen);

    useEffect(() => {
        void getPanelResumen(panelDate).catch(() => { });
    }, [getPanelResumen, panelDate]);

    const handleRefresh = () => {
        void getPanelResumen(panelDate).catch(() => { });
    };

    const handleWhatsapp = (url: string) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-500">Panel central</p>
                        <h1 className="text-2xl font-bold text-accent">Agenda y recordatorios</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={panelDate}
                            onChange={(e) => setPanelDate(e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <button
                            onClick={handleRefresh}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                        >
                            Actualizar
                        </button>
                    </div>
                </div>

                {panelError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {panelError}
                    </div>
                )}

                {isLoadingPanel && !panelResumen ? (
                    <div className="text-sm text-slate-500">Cargando panel...</div>
                ) : (
                    <>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Visitas de hoy"
                                value={String(panelResumen?.alerts.todayPending ?? 0)}
                                note="Pendientes para hoy"
                                icon={<CalendarDays className="w-5 h-5" />}
                            />
                            <StatCard
                                label="Visitas de mañana"
                                value={String(panelResumen?.alerts.tomorrowPending ?? 0)}
                                note="Pendientes para mañana"
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                            <StatCard
                                label="Vencidas"
                                value={String(panelResumen?.alerts.overduePending ?? 0)}
                                note="Aún no finalizadas"
                                icon={<AlarmClock className="w-5 h-5" />}
                            />
                            <StatCard
                                label="Total alertas"
                                value={String(panelResumen?.alerts.totalPending ?? 0)}
                                note="Pendientes totales"
                                icon={<MessageCircle className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-3">
                            <VisitsCard
                                title="Visitas de hoy"
                                items={panelResumen?.today.items ?? []}
                                onWhatsapp={handleWhatsapp}
                                emptyMessage="No hay visitas para hoy."
                            />
                            <VisitsCard
                                title="Visitas de mañana"
                                items={panelResumen?.tomorrow.items ?? []}
                                onWhatsapp={handleWhatsapp}
                                emptyMessage="No hay visitas para mañana."
                            />
                            <VisitsCard
                                title="Vencidas no finalizadas"
                                items={panelResumen?.overdue.items ?? []}
                                onWhatsapp={handleWhatsapp}
                                emptyMessage="No hay visitas vencidas."
                            />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({
    label,
    value,
    note,
    icon,
}: {
    label: string;
    value: string;
    note?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                    {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
                </div>
                {icon ? (
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
                ) : null}
            </div>
        </div>
    );
}

function VisitsCard({
    title,
    items,
    onWhatsapp,
    emptyMessage,
}: {
    title: string;
    items: PanelVisitItem[];
    onWhatsapp: (url: string) => void;
    emptyMessage: string;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm h-80 overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-900">
                                    {item.numeroVisita}
                                </p>
                                <p className="text-sm text-slate-600">{item.clientName}</p>
                                <p className="text-xs text-slate-500">{item.direccionServicio}</p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {item.estado}
                            </span>
                        </div>

                        <div className="mt-3 grid gap-1 text-sm text-slate-700">
                            <p><span className="font-medium">Agenda:</span> {formatAgenda(item)}</p>
                            <p><span className="font-medium">Técnico:</span> {item.colaboradorName}</p>
                            <p><span className="font-medium">Servicio:</span> {item.servicioRequerido}</p>
                            <p><span className="font-medium">Zona:</span> {item.zona ?? "—"}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => onWhatsapp(item.whatsappClientUrl)}
                                disabled={!item.whatsappClientUrl}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Recordar cliente
                            </button>

                            <button
                                onClick={() => onWhatsapp(item.whatsappCollaboratorUrl)}
                                disabled={!item.whatsappCollaboratorUrl}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Recordar técnico
                            </button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <p className="text-sm text-slate-500">{emptyMessage}</p>
                )}
            </div>
        </section>
    );
}