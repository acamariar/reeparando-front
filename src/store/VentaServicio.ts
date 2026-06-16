import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type {
    CreateVentaServicioPayload,
    UpdateVentaServicioPayload,
    VentaServicio,
} from "../types/VentaServicio";

export type VentaServicioSlice = {
    sales: VentaServicio[];
    salePage: number;
    salePageSize: number;
    saleTotalPages: number;
    saleTotalItems: number;
    isLoadingSales: boolean;
    saleError: string | null;

    setSalePage: (page: number) => void;
    setSalePageSize: (size: number) => void;

    getSales: (
        page: number,
        limit?: number,
        search?: string,
        from?: string,
        to?: string,
    ) => Promise<void>;
    getSaleById: (id: string) => Promise<VentaServicio>;
    createSale: (payload: CreateVentaServicioPayload) => Promise<VentaServicio>;
    updateSale: (id: string, payload: UpdateVentaServicioPayload) => Promise<VentaServicio>;
    deleteSale: (id: string, reason?: string) => Promise<void>;
};

export const createVentaServicioSlice: StateCreator<
    VentaServicioSlice,
    [["zustand/devtools", never]],
    [],
    VentaServicioSlice
> = (set, get) => ({
    sales: [],
    salePage: 1,
    salePageSize: 10,
    saleTotalPages: 1,
    saleTotalItems: 0,
    isLoadingSales: false,
    saleError: null,

    setSalePage: (page) => set({ salePage: page }),
    setSalePageSize: (size) => set({ salePageSize: size }),

    getSales: async (page, limit, search, from, to) => {
        const size = limit ?? get().salePageSize;
        set({ isLoadingSales: true, saleError: null });

        try {
            const { data, headers } = await api.get<VentaServicio[]>("/ventas-servicio", {
                params: {
                    _page: page,
                    _limit: size,
                    _sort: "createdAt",
                    _order: "desc",
                    search,
                    from,
                    to,
                },
            });

            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));

            set({
                sales: data,
                salePage: page,
                salePageSize: size,
                saleTotalItems: totalItems,
                saleTotalPages: totalPages,
                isLoadingSales: false,
            });
        } catch (err) {
            set({ isLoadingSales: false, saleError: "Error al cargar ventas" });
            throw err;
        }
    },

    getSaleById: async (id) => {
        const { data } = await api.get<VentaServicio>(`/ventas-servicio/${id}`);
        set({ sales: [...get().sales.filter((s) => s.id !== id), data] });
        return data;
    },

    createSale: async (payload) => {
        const { data } = await api.post<VentaServicio>("/ventas-servicio", payload);
        set({ sales: [...get().sales, data] });
        return data;
    },

    updateSale: async (id, payload) => {
        const { data } = await api.patch<VentaServicio>(`/ventas-servicio/${id}`, payload);
        set({
            sales: get().sales.map((s) => (s.id === id ? { ...s, ...data } : s)),
        });
        return data;
    },

    deleteSale: async (id, reason) => {
        if (reason) {
            await api.delete(`/ventas-servicio/${id}`, { params: { reason } });
        } else {
            await api.delete(`/ventas-servicio/${id}`);
        }

        set({
            sales: get().sales.filter((s) => s.id !== id),
            saleTotalItems: Math.max(0, get().saleTotalItems - 1),
        });
    },
});