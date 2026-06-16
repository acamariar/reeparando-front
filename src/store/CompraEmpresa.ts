import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type {
    CompraEmpresa,
    CreateCompraEmpresaPayload,
    UpdateCompraEmpresaPayload,
} from "../types/CompraEmpresa";

export type CompraEmpresaSlice = {
    compras: CompraEmpresa[];
    compraPage: number;
    compraPageSize: number;
    compraTotalPages: number;
    compraTotalItems: number;
    isLoadingCompras: boolean;
    compraError: string | null;

    setCompraPage: (page: number) => void;
    setCompraPageSize: (size: number) => void;

    getCompras: (
        page: number,
        limit?: number,
        search?: string,
        from?: string,
        to?: string,
    ) => Promise<void>;
    getCompraById: (id: string) => Promise<CompraEmpresa>;
    createCompra: (payload: CreateCompraEmpresaPayload) => Promise<CompraEmpresa>;
    updateCompra: (id: string, payload: UpdateCompraEmpresaPayload) => Promise<CompraEmpresa>;
    deleteCompra: (id: string, reason?: string) => Promise<void>;
};

export const createCompraEmpresaSlice: StateCreator<
    CompraEmpresaSlice,
    [["zustand/devtools", never]],
    [],
    CompraEmpresaSlice
> = (set, get) => ({
    compras: [],
    compraPage: 1,
    compraPageSize: 10,
    compraTotalPages: 1,
    compraTotalItems: 0,
    isLoadingCompras: false,
    compraError: null,

    setCompraPage: (page) => set({ compraPage: page }),
    setCompraPageSize: (size) => set({ compraPageSize: size }),

    getCompras: async (page, limit, search, from, to) => {
        const size = limit ?? get().compraPageSize;
        set({ isLoadingCompras: true, compraError: null });

        try {
            const { data, headers } = await api.get<CompraEmpresa[]>("/compras-empresa", {
                params: {
                    _page: page,
                    _limit: size,
                    _sort: "date",
                    _order: "desc",
                    search,
                    from,
                    to,
                },
            });

            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));

            set({
                compras: data,
                compraPage: page,
                compraPageSize: size,
                compraTotalItems: totalItems,
                compraTotalPages: totalPages,
                isLoadingCompras: false,
            });
        } catch (err) {
            set({ isLoadingCompras: false, compraError: "Error al cargar compras" });
            throw err;
        }
    },

    getCompraById: async (id) => {
        const { data } = await api.get<CompraEmpresa>(`/compras-empresa/${id}`);
        set({ compras: [...get().compras.filter((c) => c.id !== id), data] });
        return data;
    },

    createCompra: async (payload) => {
        const { data } = await api.post<CompraEmpresa>("/compras-empresa", payload);
        set({ compras: [...get().compras, data] });
        return data;
    },

    updateCompra: async (id, payload) => {
        const { data } = await api.patch<CompraEmpresa>(`/compras-empresa/${id}`, payload);
        set({
            compras: get().compras.map((c) => (c.id === id ? { ...c, ...data } : c)),
        });
        return data;
    },

    deleteCompra: async (id, reason) => {
        if (reason) {
            await api.delete(`/compras-empresa/${id}`, { params: { reason } });
        } else {
            await api.delete(`/compras-empresa/${id}`);
        }

        set({
            compras: get().compras.filter((c) => c.id !== id),
            compraTotalItems: Math.max(0, get().compraTotalItems - 1),
        });
    },
});