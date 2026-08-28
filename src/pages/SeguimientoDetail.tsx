import { useEffect, useMemo } from "react";
import { ArrowLeft, Copy, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import type { Seguimiento } from "../types/Seguimiento";

function formatDate(value?: string | null) {
    if (!value) return "—";

    const parts = value.split("-");
    if (parts.length !== 3) return value;

    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "long",
    }).format(date);
}


function formatMoney(value?: number | null) {
    return `$${Number(value ?? 0).toLocaleString("es-AR")}`;
}

function normalizePhone(phone?: string | null) {
    const digits = (phone ?? "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("54")) return digits;
    return `54${digits}`;
}

function getClientName(item: Seguimiento) {
    return item.client
        ? `${item.client.firstName} ${item.client.lastName}`.trim()
        : "—";
}

function getColaboradorName(item: Seguimiento) {
    if (!item.colaborador) return "—";
    const base = `${item.colaborador.firstName} ${item.colaborador.lastName}`.trim();
    return base
}

function buildHeadline(item: Seguimiento) {
    const tecnico = item.colaborador
        ? `${item.colaborador.firstName}`.trim().toUpperCase()
        : "SIN TECNICO";

    const cliente = item.client
        ? item.client.firstName.toUpperCase()
        : "SIN CLIENTE";

    const zona = (item.zona ?? "SIN ZONA").toUpperCase();

    const hora = item.horaVisita ? item.horaVisita.toUpperCase()
        : "SIN HORARIO";

    return `${item.numeroVisita} ${tecnico}/${cliente}/${zona}-${hora}`;
}

function buildFichaText(item: Seguimiento) {
    const clientPhone = item.client?.phone ?? "—";


    return [
        buildHeadline(item),
        "",
        `Cliente: ${getClientName(item)}`,
        `Dirección: ${item.direccionServicio}`,
        `Zona: ${item.zona ?? "—"}`,
        `Contactó: ${clientPhone}`,
        `Agenda de visita: ${item.fechaVisita ? formatDate(item.fechaVisita) : "—"} a las ${item.horaVisita ?? "—"}`,
        `Técnico: ${getColaboradorName(item)}`,
        `Servicio requerido: ${item.servicioRequerido}`,
        `Tipo de servicio: ${item.tipoServicio ?? "—"}`,
        `Estado: ${item.estado}`,
        `Presupuesto: ${item.tipoVisita === "TECNICA"
            ? formatMoney(item.montoPresupuestado)
            : "A presupuestar"
        }`,
        item.observacionesCliente ? `Observaciones cliente: ${item.observacionesCliente}` : "",
        item.observacionesTecnicas ? `Observaciones técnicas: ${item.observacionesTecnicas}` : "",
    ]
        .filter(Boolean)
        .join("\n");
}

export default function SeguimientoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const getSeguimientoById = useBoundStore((s) => s.getSeguimientoById);
    const seguimientos = useBoundStore((s) => s.seguimientos);
    const isLoading = useBoundStore((s) => s.isLoadingSeguimientos);
    const error = useBoundStore((s) => s.seguimientoError);

    useEffect(() => {
        if (!id) return;
        void getSeguimientoById(id).catch(() => { });
    }, [id, getSeguimientoById]);

    const seguimiento = useMemo(
        () => seguimientos.find((s) => s.id === id) ?? null,
        [seguimientos, id]
    );

    const fichaText = useMemo(() => {
        if (!seguimiento) return "";
        return buildFichaText(seguimiento);
    }, [seguimiento]);

    const whatsappUrl = useMemo(() => {
        if (!seguimiento) return "";

        const phone = normalizePhone(seguimiento.client?.phone);
        if (!phone) return "";

        return `https://wa.me/${phone}?text=${encodeURIComponent(fichaText)}`;
    }, [seguimiento, fichaText]);

    const handleCopy = async () => {
        if (!fichaText) return;
        try {
            await navigator.clipboard.writeText(fichaText);
        } catch {
            // si falla, no rompemos la pantalla
        }
    };

    const handleWhatsapp = () => {
        if (!whatsappUrl) return;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    if (!id) {
        return (
            <AppLayout>
                <div className="p-6 text-sm text-red-600">
                    No se encontró el seguimiento.
                </div>
            </AppLayout>
        );
    }

    if (isLoading && !seguimiento) {
        return (
            <AppLayout>
                <div className="p-6 text-slate-600">Cargando seguimiento...</div>
            </AppLayout>
        );
    }

    if (error && !seguimiento) {
        return (
            <AppLayout>
                <div className="p-6 text-red-600">{error}</div>
            </AppLayout>
        );
    }

    if (!seguimiento) {
        return (
            <AppLayout>
                <div className="p-6 text-slate-600">
                    No se encontró el seguimiento solicitado.
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/seguimientos/facturacion")}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a seguimientos
                    </button>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                        >
                            <Copy className="w-4 h-4" />
                            Copiar ficha
                        </button>

                        <button
                            onClick={handleWhatsapp}
                            disabled={!whatsappUrl}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Enviar por WhatsApp
                        </button>
                    </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-slate-500">Ficha técnica</p>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {buildHeadline(seguimiento)}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Vista detallada del seguimiento y ficha lista para compartir.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-1 md:grid-cols-2 xl:grid-cols-3">
                        <InfoCard label="Cliente" value={getClientName(seguimiento)} />
                        <InfoCard label="Dirección" value={seguimiento.direccionServicio} />
                        <InfoCard label="Zona" value={seguimiento.zona ?? "—"} />
                        <InfoCard label="Contactó" value={seguimiento.client?.phone ?? "—"} />
                        <InfoCard label="Fecha de solicitud" value={formatDate(seguimiento.fechaSolicitud)} />
                        <InfoCard label="Fecha de visita" value={"El Dia " + formatDate(seguimiento.fechaVisita) + " a las " + seguimiento.horaVisita} />
                        <InfoCard label="Técnico" value={getColaboradorName(seguimiento)} />
                        <InfoCard label="Servicio requerido" value={seguimiento.servicioRequerido} />
                        <InfoCard label="Tipo de servicio" value={seguimiento.tipoServicio ?? "—"} />
                        <InfoCard label="Tipo de visita" value={seguimiento.tipoVisita} />
                        <InfoCard label="Estado" value={seguimiento.estado} />
                        <InfoCard
                            label="Presupuesto"
                            value={
                                seguimiento.tipoVisita === "TECNICA"
                                    ? formatMoney(seguimiento.montoPresupuestado)
                                    : "A presupuestar"
                            }
                        />
                    </div>

                    <div className="mt-4 grid gap-1 md:grid-cols-2">
                        <InfoCard
                            label="Observaciones del cliente"
                            value={seguimiento.observacionesCliente ?? "—"}
                        />
                        <InfoCard
                            label="Observaciones técnicas"
                            value={seguimiento.observacionesTecnicas ?? "—"}
                        />
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-medium text-slate-600">Texto de ficha</p>
                        <pre className="mt-3 whitespace-pre-wrap  text-sm leading-6 text-slate-800">
                            {fichaText}
                        </pre>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-medium text-slate-900 whitespace-pre-wrap wrap-break-word">
                {value}
            </p>
        </div>
    );
}