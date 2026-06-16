import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type {
    Colaborador,
    CreateColaboradorPayload,
    UpdateColaboradorPayload,
} from "../types/Colaborador";
import type {
    CreateMovimientoCuentaColaboradorPayload,
    MovimientoCuentaColaborador,
} from "../types/VentaServicio";

export type ColaboradorSlice = {
    colaboradores: Colaborador[];
    colaboradorPage: number;
    colaboradorPageSize: number;
    colaboradorTotalPages: number;
    colaboradorTotalItems: number;
    isLoadingColaboradores: boolean;
    colaboradorError: string | null;

    movimientos: MovimientoCuentaColaborador[];
    movimientoPage: number;
    movimientoPageSize: number;
    movimientoTotalPages: number;
    movimientoTotalItems: number;
    isLoadingMovimientos: boolean;
    movimientoError: string | null;

    setColaboradorPage: (page: number) => void;
    setColaboradorPageSize: (size: number) => void;

    getColaboradores: (page: number, limit?: number, search?: string) => Promise<void>;
    getColaboradorById: (id: string) => Promise<Colaborador>;
    createColaborador: (payload: CreateColaboradorPayload) => Promise<Colaborador>;
    updateColaborador: (id: string, payload: UpdateColaboradorPayload) => Promise<Colaborador>;
    deleteColaborador: (id: string, reason?: string) => Promise<void>;

    getMovimientosByColaborador: (
        collaboratorId: string,
        page?: number,
        limit?: number
    ) => Promise<void>;
    createMovimientoCuenta: (
        payload: CreateMovimientoCuentaColaboradorPayload
    ) => Promise<MovimientoCuentaColaborador>;
};

export const createColaboradorSlice: StateCreator<
    ColaboradorSlice,
    [["zustand/devtools", never]],
    [],
    ColaboradorSlice
> = (set, get) => ({
    colaboradores: [],
    colaboradorPage: 1,
    colaboradorPageSize: 10,
    colaboradorTotalPages: 1,
    colaboradorTotalItems: 0,
    isLoadingColaboradores: false,
    colaboradorError: null,

    movimientos: [],
    movimientoPage: 1,
    movimientoPageSize: 10,
    movimientoTotalPages: 1,
    movimientoTotalItems: 0,
    isLoadingMovimientos: false,
    movimientoError: null,

    setColaboradorPage: (page) => set({ colaboradorPage: page }),
    setColaboradorPageSize: (size) => set({ colaboradorPageSize: size }),

    getColaboradores: async (page, limit, search) => {
        const size = limit ?? get().colaboradorPageSize;
        set({ isLoadingColaboradores: true, colaboradorError: null });
        try {
            const { data, headers } = await api.get<Colaborador[]>("/colaboradores", {
                params: {
                    _page: page,
                    _limit: size,
                    _sort: "lastName",
                    _order: "asc",
                    search,
                },
            });

            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));

            set({
                colaboradores: data,
                colaboradorPage: page,
                colaboradorPageSize: size,
                colaboradorTotalItems: totalItems,
                colaboradorTotalPages: totalPages,
                isLoadingColaboradores: false,
            });
        } catch (err) {
            set({
                isLoadingColaboradores: false,
                colaboradorError: "Error al cargar colaboradores",
            });
            throw err;
        }
    },

    getColaboradorById: async (id) => {
        const { data } = await api.get<Colaborador>(`/colaboradores/${id}`);
        set({ colaboradores: [...get().colaboradores.filter((c) => c.id !== id), data] });
        return data;
    },

    createColaborador: async (payload) => {
        const { data } = await api.post<Colaborador>("/colaboradores", {
            ...payload,
            active: true,
            createdAt: new Date().toLocaleDateString("en-CA"),
        });

        set({ colaboradores: [...get().colaboradores, data] });
        return data;
    },

    updateColaborador: async (id, payload) => {
        const { data } = await api.patch<Colaborador>(`/colaboradores/${id}`, payload);
        set({
            colaboradores: get().colaboradores.map((c) => (c.id === id ? { ...c, ...data } : c)),
        });
        return data;
    },

    deleteColaborador: async (id, reason) => {
        if (reason) {
            await api.delete(`/colaboradores/${id}`, { params: { reason } });
        } else {
            await api.delete(`/colaboradores/${id}`);
        }

        set({
            colaboradores: get().colaboradores.filter((c) => c.id !== id),
            colaboradorTotalItems: Math.max(0, get().colaboradorTotalItems - 1),
        });
    },

    getMovimientosByColaborador: async (collaboratorId, page, limit) => {
        const size = limit ?? get().movimientoPageSize;
        const currentPage = page ?? 1;

        set({ isLoadingMovimientos: true, movimientoError: null });

        try {
            const { data, headers } = await api.get<MovimientoCuentaColaborador[]>(
                "/ventas-servicio/movimientos",
                {
                    params: {
                        collaboratorId,
                        _page: currentPage,
                        _limit: size,
                    },
                }
            );

            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));

            set({
                movimientos: data,
                movimientoPage: currentPage,
                movimientoPageSize: size,
                movimientoTotalItems: totalItems,
                movimientoTotalPages: totalPages,
                isLoadingMovimientos: false,
            });
        } catch (err) {
            set({
                isLoadingMovimientos: false,
                movimientoError: "Error al cargar movimientos",
            });
            throw err;
        }
    },

    createMovimientoCuenta: async (payload) => {
        const { data } = await api.post<MovimientoCuentaColaborador>(
            "/ventas-servicio/movimientos",
            payload
        );

        const delta =
            payload.direction === "EMPRESA_DEBE_COLABORADOR"
                ? Number(payload.amount ?? 0)
                : -Number(payload.amount ?? 0);

        set({
            movimientos: [data, ...get().movimientos],
            colaboradores: get().colaboradores.map((c) =>
                c.id === payload.collaboratorId
                    ? { ...c, saldoActual: Number(c.saldoActual ?? 0) + delta }
                    : c
            ),
        });

        return data;
    },
});