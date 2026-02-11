import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { TimeEntry } from "../types/TimeEntry ";


export type TimeEntrySlice = {
    timeEntries: TimeEntry[];
    isLoadingTime: boolean;
    timeError: string | null;

    getTimeByProject: (projectId: string, page?: number, limit?: number) => Promise<void>;
    getTimeByEmployee: (employeeId: string, dateFrom?: string, dateTo?: string) => Promise<void>;
    createTime: (payload: Omit<TimeEntry, "id">) => Promise<TimeEntry>;
    updateTime: (id: string, payload: Partial<TimeEntry>) => Promise<TimeEntry>;
    deleteTime: (id: string) => Promise<void>;
};

export const createTimeEntrySlice: StateCreator<
    TimeEntrySlice,
    [["zustand/devtools", never]],
    [],
    TimeEntrySlice
> = (set, get) => ({
    timeEntries: [],
    isLoadingTime: false,
    timeError: null,

    getTimeByProject: async (projectId, page = 1, limit = 50) => {
        set({ isLoadingTime: true, timeError: null });
        try {
            const { data } = await api.get<TimeEntry[]>("/tiempos", {
                params: { projectId, _page: page, _limit: limit, _sort: "date", _order: "desc" },
            });
            set({ timeEntries: data, isLoadingTime: false });
        } catch (err) {
            set({ isLoadingTime: false, timeError: "Error al cargar tiempos" });
            throw err;
        }
    },

    getTimeByEmployee: async (employeeId, dateFrom, dateTo) => {
        set({ isLoadingTime: true, timeError: null });
        try {
            const params: any = { employeeId, _sort: "date", _order: "desc" };
            if (dateFrom) params.date_gte = dateFrom;
            if (dateTo) params.date_lte = dateTo;
            const { data } = await api.get<TimeEntry[]>("/tiempos", { params });
            set({ timeEntries: data, isLoadingTime: false });
        } catch (err: any) {
            set({ isLoadingTime: false, timeError: err.message ?? "Error al cargar tiempos" });
            throw err;
        }
    },

    createTime: async (payload) => {
        const { data } = await api.post<TimeEntry>("/tiempos", { ...payload, });
        set({ timeEntries: [...get().timeEntries, data] });
        return data;
    },

    updateTime: async (id, payload) => {
        const { data } = await api.patch<TimeEntry>(`/tiempos/${id}`, payload);
        set({ timeEntries: get().timeEntries.map((t) => (t.id === id ? { ...t, ...data } : t)) });
        return data;
    },

    deleteTime: async (id) => {
        await api.delete(`/tiempos/${id}`);
        set({ timeEntries: get().timeEntries.filter((t) => t.id !== id) });
    },
});
