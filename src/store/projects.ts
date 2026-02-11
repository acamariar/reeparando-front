// src/store/projects.ts
import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { Project } from "../types/project";


export type ProjectSlice = {
    project: Project;
    projectPage: number;
    projectPageSize: number;
    projectTotalPages: number;
    projectTotalItems: number;
    projects: Project[];
    isLoadingProjects: boolean;
    projectError: string | null;
    fetchProjectById: (id: string) => Promise<Project>;
    getProjects: (page: number, limit?: number) => Promise<void>;
    createProject: (payload: Omit<Project, "id">) => Promise<Project>;
    updateProject: (id: string, payload: Partial<Project>) => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
};

export const createProjectSlice: StateCreator<
    ProjectSlice,
    [["zustand/devtools", never]],
    [],
    ProjectSlice
> = (set, get) => ({
    project: {
        id: "",
        name: "",
        client: "",
        address: "",
        status: "En Progreso",
        progress: 0,
        dueDate: "",
        budget: 0,
        description: "",
        team: [],
        category: "impermeabilizacion",
    },
    projectPage: 1,
    projectPageSize: 6,
    projectTotalPages: 1,
    projectTotalItems: 0,
    projects: [],
    isLoadingProjects: false,
    projectError: null,

    getProjects: async (page, limit) => {
        const size = limit ?? get().projectPageSize;
        set({ isLoadingProjects: true, projectError: null });
        try {
            const { data, headers } = await api.get<Project[]>("/proyectos", {
                params: { _page: page, _limit: size, _sort: "id", _order: "desc" },
            });
            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));

            set({
                projects: data,
                projectPage: page,
                projectPageSize: size,
                projectTotalItems: totalItems,
                projectTotalPages: totalPages,
                isLoadingProjects: false,
            });
        } catch (err) {
            set({ isLoadingProjects: false, projectError: "Error al cargar proyectos" });
            throw err;
        }
    },
    fetchProjectById: async (id: string) => {
        set({ isLoadingProjects: true, projectError: null });
        try {
            const { data } = await api.get<Project>(`/proyectos/${id}`);
            set({
                isLoadingProjects: false,
                projects: [
                    ...get().projects.filter((p) => p.id !== id),
                    data,
                ],
            });
            return data;
        } catch (err) {
            set({ isLoadingProjects: false, projectError: "Error al cargar proyecto" });
            throw err;
        }
    },

    createProject: async (payload) => {
        const { data } = await api.post<Project>("/proyectos", {
            ...payload
        });
        set({ projects: [...get().projects, data] });
        return data;
    },

    updateProject: async (id, payload) => {
        const { data } = await api.patch<Project>(`/proyectos/${id}`, payload);
        set({
            projects: get().projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        });
        return data;
    },

    deleteProject: async (id) => {
        await api.delete(`/proyectos/${id}`);
        set({ projects: get().projects.filter((p) => p.id !== id) });
    },
});
