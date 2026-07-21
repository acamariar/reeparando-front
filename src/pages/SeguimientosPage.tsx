import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import Table from "../components/table/Table";
import type { Seguimiento } from "../types/Seguimiento";
import { CreateSeguimientoRelevamientoModal } from "../components/seguimientos/CreateSeguimientoRelevamientoModal";
import { CreateSeguimientoTecnicoModal } from "../components/seguimientos/CreateSeguimientoTecnicoModal";
import FinalizeSeguimientoModal from "../components/seguimientos/FinalizeSeguimientoModal";

const money = (value: number) => `$${Number(value ?? 0).toLocaleString("es-AR")}`;

export default function SeguimientosPage() {
    const {
        seguimientos,
        seguimientoPageSize,
        seguimientoTotalPages,
        isLoadingSeguimientos,
        seguimientoError,
        getSeguimientos,
        deleteSeguimiento,
    } = useBoundStore();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [tipoVisita, setTipoVisita] = useState<"RELEVAMIENTO" | "TECNICA" | "">("");
    const [estado, setEstado] = useState<
        "A_COORDINAR" | "APROBADO" | "RECHAZADO" | "CULMINADO" | "GARANTIA" | ""
    >("");
    const [openRelevamiento, setOpenRelevamiento] = useState(false);
    const [openTecnico, setOpenTecnico] = useState(false);
    const [openFinalizar, setOpenFinalizar] = useState(false);
    const [selectedSeguimiento, setSelectedSeguimiento] = useState<Seguimiento | null>(null);
    useEffect(() => {
        const t = setTimeout(() => {
            void getSeguimientos({
                page,
                limit: seguimientoPageSize,
                search: search || undefined,
                from: from || undefined,
                to: to || undefined,
                tipoVisita: tipoVisita || undefined,
                estado: estado || undefined,
            });
        }, 300);

        return () => clearTimeout(t);
    }, [page, seguimientoPageSize, search, from, to, tipoVisita, estado, getSeguimientos]);

    useEffect(() => {
        setPage(1);
    }, [search, from, to, tipoVisita, estado]);

    const tableItems = useMemo(
        () =>
            seguimientos.map((s) => ({
                ...s,
                clientDisplay: s.client
                    ? `${s.client.firstName} ${s.client.lastName}`
                    : "—",
                colaboradorDisplay: s.colaborador
                    ? `${s.colaborador.firstName} ${s.colaborador.lastName}${s.colaborador.alias ? ` · ${s.colaborador.alias}` : ""
                    }`
                    : "—",
                tipoVisitaDisplay: s.tipoVisita === "TECNICA" ? "Visita técnica" : "Relevamiento",
                estadoDisplay: formatEstado(s.estado),
                origenDisplay: formatOrigen(s.origenCliente),
                montoPresupuestadoDisplay: money(s.montoPresupuestado),
                montoPagadoDisplay: money(s.montoPagadoCliente),
                montoColaboradorDisplay: money(s.montoColaborador),
                montoReeparandoDisplay: money(s.montoReeparando),
            })),
        [seguimientos]
    );

    const tableInfo = {
        "N° visita": "numeroVisita",
        Fecha: "fechaSolicitud",
        Cliente: "clientDisplay",
        Colaborador: "colaboradorDisplay",
        Estado: "estadoDisplay",
        "Monto presup.": "montoPresupuestadoDisplay",
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar seguimiento?")) return;
        await deleteSeguimiento(id);
        await getSeguimientos({
            page,
            limit: seguimientoPageSize,
            search: search || undefined,
            from: from || undefined,
            to: to || undefined,
            tipoVisita: tipoVisita || undefined,
            estado: estado || undefined,
        });
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-500">Seguimientos</p>
                        <h1 className="text-2xl font-bold text-accent">Gestión de visitas</h1>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                            onClick={() => setOpenRelevamiento(true)}
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo relevamiento
                        </button>

                        <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                            onClick={() => setOpenTecnico(true)}
                        >
                            <Plus className="w-4 h-4" />
                            Nueva visita técnica
                        </button>
                    </div>
                </div>

                {seguimientoError && (
                    <div className="text-sm text-red-600">{seguimientoError}</div>
                )}


                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                        <div className="flex flex-wrap gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por visita, cliente, servicio..."
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />

                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />

                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />

                            <select
                                value={tipoVisita}
                                onChange={(e) =>
                                    setTipoVisita(
                                        e.target.value as "RELEVAMIENTO" | "TECNICA" | ""
                                    )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="">Todas las visitas</option>
                                <option value="RELEVAMIENTO">Relevamiento</option>
                                <option value="TECNICA">Visita técnica</option>
                            </select>

                            <select
                                value={estado}
                                onChange={(e) =>
                                    setEstado(
                                        e.target.value as
                                        | "A_COORDINAR"
                                        | "APROBADO"
                                        | "RECHAZADO"
                                        | "CULMINADO"
                                        | "GARANTIA"
                                        | ""
                                    )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="">Todos los estados</option>
                                <option value="A_COORDINAR">A coordinar</option>
                                <option value="APROBADO">Aprobado</option>
                                <option value="RECHAZADO">Rechazado</option>
                                <option value="CULMINADO">Culminado</option>
                                <option value="GARANTIA">Garantía</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Table
                    items={tableItems as Seguimiento[]}
                    tableInfo={tableInfo}
                    page={page}
                    setPage={setPage}
                    totalPages={seguimientoTotalPages}
                    title="Seguimientos"
                    action
                    renderActions={(item) => (

                        <div className="flex gap-2 justify-end ">
                            {item.estado !== "CULMINADO" ? (
                                <button

                                    className="border border-secondary text-secondary hover:bg-blue-50 hover:text-primary px-2 py-1 rounded-lg text-sm"
                                    onClick={() => {
                                        setSelectedSeguimiento(item);
                                        setOpenFinalizar(true);
                                    }}
                                >
                                    Finalizar
                                </button>
                            ) : (
                                <button
                                    className="border border-secondary text-secondary hover:bg-blue-50 hover:text-primary px-2 py-1 rounded-lg text-sm"
                                    onClick={() => {
                                        setSelectedSeguimiento(item);
                                        setOpenFinalizar(true);
                                    }}
                                >
                                    Editar finalizacion
                                </button>
                            )}
                            <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(item.id)}
                                title="Eliminar seguimiento"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                >
                    {isLoadingSeguimientos && (
                        <p className="text-sm text-slate-500 px-3">Cargando seguimientos...</p>
                    )}
                </Table>

                <CreateSeguimientoRelevamientoModal
                    open={openRelevamiento}
                    onClose={() => setOpenRelevamiento(false)}
                />

                <CreateSeguimientoTecnicoModal
                    open={openTecnico}
                    onClose={() => setOpenTecnico(false)}
                />
            </div>
            <FinalizeSeguimientoModal
                open={openFinalizar}
                seguimiento={selectedSeguimiento}
                onClose={() => {
                    setOpenFinalizar(false);
                    setSelectedSeguimiento(null);
                }}
                onSaved={async () => {
                    await getSeguimientos({
                        page,
                        limit: seguimientoPageSize,
                        search: search || undefined,
                        from: from || undefined,
                        to: to || undefined,
                        tipoVisita: tipoVisita || undefined,
                        estado: estado || undefined,
                    });
                }}
            />
        </AppLayout>
    );
}



function formatEstado(estado: string) {
    switch (estado) {
        case "A_COORDINAR":
            return "A coordinar";
        case "APROBADO":
            return "Aprobado";
        case "RECHAZADO":
            return "Rechazado";
        case "CULMINADO":
            return "Culminado";
        case "GARANTIA":
            return "Garantía";
        default:
            return estado;
    }
}

function formatOrigen(origen: string) {
    switch (origen) {
        case "GOOGLE_ADS":
            return "Google Ads";
        case "FACEBOOK":
            return "Facebook";
        case "INSTAGRAM":
            return "Instagram";
        case "REFERIDO":
            return "Referido";
        case "RECURRENTE":
            return "Cliente recurrente";
        case "WHATSAPP_DIRECTO":
            return "WhatsApp directo";
        default:
            return origen;
    }
}