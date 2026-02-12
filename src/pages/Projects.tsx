// src/pages/ProjectsPage.tsx
import { useEffect, useState } from "react";
import { MoreHorizontal, Plus, Wrench, Droplets, Paintbrush, Briefcase } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import type { Project } from "../types/project";
import CreateProjectModal from "../components/project/CreateProjectModal";
import { useNavigate } from "react-router-dom";
import { CreateClientModal } from "../components/project/CreateClientModal";

const categoryStyle = {
    impermeabilizacion: { bg: "bg-blue-100", fg: "text-blue-600", icon: <Droplets className="w-5 h-5" /> },
    refaccion: { bg: "bg-amber-100", fg: "text-amber-700", icon: <Wrench className="w-5 h-5" /> },
    puesto: { bg: "bg-purple-100", fg: "text-purple-700", icon: <Briefcase className="w-5 h-5" /> },
    pintura: { bg: "bg-green-100", fg: "text-green-700", icon: <Paintbrush className="w-5 h-5" /> },
} as const;

type CategoryKey = keyof typeof categoryStyle;
const defaultCategory: CategoryKey = "refaccion";

const statusStyle = {
    "En Progreso": { bg: "bg-blue-100", fg: "text-blue-700", bar: "bg-blue-500" },
    Completado: { bg: "bg-primary/15", fg: "text-primary", bar: "bg-primary" },
    Pendiente: { bg: "bg-amber-100", fg: "text-amber-700", bar: "bg-amber-500" },
    Atrasado: { bg: "bg-red-100", fg: "text-red-600", bar: "bg-red-500" },
} as const;

type StatusKey = keyof typeof statusStyle;
const defaultStatus: StatusKey = "Pendiente";
type NewProjectPayload = Omit<Project, "id"> & { team: string[] };
export default function ProjectsPage() {

    const getProjects = useBoundStore((s) => s.getProjects)
    // Lectura de estado
    const projects = useBoundStore((s) => s.projects);
    const page = useBoundStore((s) => s.projectPage);
    const pageSize = useBoundStore((s) => s.projectPageSize);
    const totalPages = useBoundStore((s) => s.projectTotalPages);
    const [openModal, setOpenModal] = useState(false);
    const createProject = useBoundStore((s) => s.createProject);
    const isLoadingProjects = useBoundStore((s) => s.isLoadingProjects);
    const projectError = useBoundStore((s) => s.projectError);
    const [openClient, setOpenClient] = useState(false);
    const navigate = useNavigate();
    const goDetail = (id: string) => navigate(`/proyectos/${id}`);



    useEffect(() => {
        getProjects?.(page, pageSize);
    }, [page, getProjects, pageSize]);

    const goPrev = () => {
        if (page > 1) getProjects?.(page - 1, pageSize);
    };
    const goNext = () => {
        if (page < totalPages) getProjects?.(page + 1, pageSize);
    };
    const safeProjects = projects.map((p) => ({
        ...p,
        budget: Number.isFinite(p.budget) ? p.budget : 0,
        progress: Number.isFinite(p.progress) ? p.progress : 0,
        category: (p.category ?? "refaccion") as CategoryKey,
        status: (p.status ?? "Pendiente") as StatusKey,
        description: p.description ?? "Sin descripción",
        team: Array.isArray(p.team) ? p.team : []
    }));
    const handleCreate = async (payload: NewProjectPayload) => {
        await createProject(payload);
        await getProjects?.(page, pageSize);
        setOpenModal(false);
    };
    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Proyectos</p>
                        <h1 className="text-2xl font-bold text-accent">Resumen</h1>
                    </div>
                    <div>
                        <button
                            className="inline-flex mr-1.5 items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                            onClick={() => setOpenModal(true)}
                        >
                            <Plus className="w-4 h-4" /> Nuevo proyecto
                        </button>
                    </div>

                </div>

                {projectError && <div className="text-red-600 text-sm">{projectError}</div>}

                {isLoadingProjects ? (
                    <div className="text-sm text-slate-500">Cargando proyectos...</div>
                ) : (
                    <div
                        className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
                        {safeProjects.map((p: Project) => {
                            const cat = categoryStyle[p.category] ?? categoryStyle[defaultCategory];
                            const st = statusStyle[p.status] ?? statusStyle[defaultStatus];
                            return (
                                <div key={p.id}
                                    onClick={() => goDetail(p.id)}
                                    className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg} ${cat.fg}`}>
                                                {cat.icon}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{p.name}</p>
                                                <p className="text-xs text-slate-500">{p.id}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-slate-600">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-slate-600 leading-relaxed h-24 overflow-y-auto pr-1">
                                        {p.description || "Sin descripción"}
                                    </p>

                                    <div className="grid grid-cols-2 gap-y-1 text-sm text-slate-600">

                                        <span className="text-slate-500">Presupuesto:</span>
                                        <span className="text-right font-semibold text-slate-900">
                                            ${p.budget.toLocaleString()}
                                        </span>
                                        <span className="text-slate-500">Fecha límite:</span>
                                        <span className="text-right text-slate-900">{p.dueDate}</span>
                                    </div>


                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {(p.team ?? []).map((t) => (
                                                <div
                                                    key={t}
                                                    className="w-8 h-8 rounded-full border-2 border-white bg-accent/80 text-white text-[11px] font-semibold flex items-center justify-center"
                                                >
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                        <span className={`px-3 py-1 text-xs rounded-full ${st.bg} ${st.fg}`}>{p.status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Paginación */}
                <div className="flex items-center justify-center gap-3 text-sm text-slate-700">
                    <button
                        onClick={goPrev}
                        disabled={page <= 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span>
                        Página {page} de {totalPages}

                    </span>
                    <button
                        onClick={goNext}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
            <CreateProjectModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleCreate}
            />
            <CreateClientModal open={openClient} onClose={() => setOpenClient(false)} />
        </AppLayout>
    );
}
