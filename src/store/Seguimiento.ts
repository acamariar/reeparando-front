import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type {
    CreateSeguimientoPayload,
    EstadoSeguimiento,
    FinalizarSeguimientoPayload,
    Seguimiento,
    TipoVisitaSeguimiento,
    UpdateSeguimientoPayload,
} from "../types/Seguimiento";

export type SeguimientoSlice = {
    seguimientos: Seguimiento[];
    seguimientoPage: number;
    seguimientoPageSize: number;
    seguimientoTotalPages: number;
    seguimientoTotalItems: number;
    isLoadingSeguimientos: boolean;
    seguimientoError: string | null;

    setSeguimientoPage: (page: number) => void;
    setSeguimientoPageSize: (size: number) => void;

    getSeguimientos: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        estado?: EstadoSeguimiento;
        tipoVisita?: TipoVisitaSeguimiento;
        from?: string;
        to?: string;
    }) => Promise<void>;

    getSeguimientoById: (id: string) => Promise<Seguimiento>;
    createSeguimiento: (payload: CreateSeguimientoPayload) => Promise<Seguimiento>;
    updateSeguimiento: (id: string, payload: UpdateSeguimientoPayload) => Promise<Seguimiento>;
    finalizarSeguimiento: (
        id: string,
        payload: FinalizarSeguimientoPayload
    ) => Promise<Seguimiento>;
    deleteSeguimiento: (id: string, reason?: string) => Promise<void>;
};

export const createSeguimientoSlice: StateCreator<
    SeguimientoSlice,
    [["zustand/devtools", never]],
    [],
    SeguimientoSlice
> = (set, get) => ({
    seguimientos: [],
    seguimientoPage: 1,
    seguimientoPageSize: 10,
    seguimientoTotalPages: 1,
    seguimientoTotalItems: 0,
    isLoadingSeguimientos: false,
    seguimientoError: null,

    setSeguimientoPage: (page) => set({ seguimientoPage: page }),
    setSeguimientoPageSize: (size) => set({ seguimientoPageSize: size }),

    getSeguimientos: async (params) => {
        const page = Math.max(1, params?.page ?? 1);
        const size = Math.max(1, params?.limit ?? get().seguimientoPageSize);

        set({ isLoadingSeguimientos: true, seguimientoError: null });

        try {
            const { data, headers } = await api.get<Seguimiento[]>("/seguimientos", {
                params: {
                    _page: page,
                    _limit: size,
                    _sort: "fechaSolicitud",
                    _order: "desc",
                    search: params?.search,
                    estado: params?.estado,
                    tipoVisita: params?.tipoVisita,
                    from: params?.from,
                    to: params?.to,
                },
            });

            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));

            set({
                seguimientos: data,
                seguimientoPage: page,
                seguimientoPageSize: size,
                seguimientoTotalItems: totalItems,
                seguimientoTotalPages: totalPages,
                isLoadingSeguimientos: false,
            });
        } catch (err) {
            set({
                isLoadingSeguimientos: false,
                seguimientoError: "Error al cargar seguimientos",
            });
            throw err;
        }
    },

    getSeguimientoById: async (id) => {
        const { data } = await api.get<Seguimiento>(`/seguimientos/${id}`);
        set({ seguimientos: [...get().seguimientos.filter((s) => s.id !== id), data] });
        return data;
    },

    createSeguimiento: async (payload) => {
        const { data } = await api.post<Seguimiento>("/seguimientos", payload);
        set({ seguimientos: [...get().seguimientos, data] });
        return data;
    },

    updateSeguimiento: async (id, payload) => {
        const { data } = await api.patch<Seguimiento>(`/seguimientos/${id}`, payload);
        set({
            seguimientos: get().seguimientos.map((s) => (s.id === id ? { ...s, ...data } : s)),
        });
        return data;
    },

    finalizarSeguimiento: async (id, payload) => {
        const { data } = await api.patch<Seguimiento>(`/seguimientos/${id}/finalizar`, payload);
        set({
            seguimientos: get().seguimientos.map((s) => (s.id === id ? { ...s, ...data } : s)),
        });
        return data;
    },

    deleteSeguimiento: async (id, reason) => {
        if (reason) {
            await api.delete(`/seguimientos/${id}`, { params: { reason } });
        } else {
            await api.delete(`/seguimientos/${id}`);
        }

        set({
            seguimientos: get().seguimientos.filter((s) => s.id !== id),
            seguimientoTotalItems: Math.max(0, get().seguimientoTotalItems - 1),
        });
    },
});