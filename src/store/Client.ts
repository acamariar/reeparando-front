import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { Client } from "../types/Client";


export type ClientSlice = {
    clients: Client[];
    clientPage: number;
    clientPageSize: number;
    clientTotalPages: number;
    clientTotalItems: number;
    isLoadingClients: boolean;
    clientError: string | null;

    getClients: (page: number, limit?: number) => Promise<void>;
    getClientById: (id: string) => Promise<Client>;
    createClient: (payload: Omit<Client, "id">) => Promise<Client>;
    updateClient: (id: string, payload: Partial<Client>) => Promise<Client>;
    deleteClient: (id: string) => Promise<void>;
};

export const createClientSlice: StateCreator<
    ClientSlice,
    [["zustand/devtools", never]],
    [],
    ClientSlice
> = (set, get) => ({
    clients: [],
    clientPage: 1,
    clientPageSize: 10,
    clientTotalPages: 1,
    clientTotalItems: 0,
    isLoadingClients: false,
    clientError: null,

    getClients: async (page, limit) => {
        const size = limit ?? get().clientPageSize;
        set({ isLoadingClients: true, clientError: null });
        try {
            const { data, headers } = await api.get<Client[]>("/clientes", {
                params: { _page: page, _limit: size, _sort: "lastName", _order: "asc" },
            });
            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));
            set({
                clients: data,
                clientPage: page,
                clientPageSize: size,
                clientTotalItems: totalItems,
                clientTotalPages: totalPages,
                isLoadingClients: false,
            });
        } catch (err) {
            set({ isLoadingClients: false, clientError: "Error al cargar clientes" });
            throw err;
        }
    },

    getClientById: async (id) => {
        const { data } = await api.get<Client>(`/clientes/${id}`);
        set({ clients: [...get().clients.filter((c) => c.id !== id), data] });
        return data;
    },

    createClient: async (payload) => {
        const { data } = await api.post<Client>("/clientes", { ...payload, });
        set({ clients: [...get().clients, data] });
        return data;
    },

    updateClient: async (id, payload) => {
        const { data } = await api.patch<Client>(`/clientes/${id}`, payload);
        set({ clients: get().clients.map((c) => (c.id === id ? { ...c, ...data } : c)) });
        return data;
    },

    deleteClient: async (id) => {
        await api.delete(`/clientes/${id}`);
        set({ clients: get().clients.filter((c) => c.id !== id) });
    },
});
