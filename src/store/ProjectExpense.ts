import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { ProjectExpense } from "../types/ProjectExpense"



export type ProjectExpenseSlice = {
    expenses: ProjectExpense[];
    expensePage: number;
    expensePageSize: number;
    expenseTotalPages: number;
    expenseTotalItems: number;
    expensesTotalAmount: number; // suma de amount de la página actual
    isLoadingExpenses: boolean;
    expenseError: string | null;

    getExpensesByProject: (projectId?: string, page?: number, limit?: number) => Promise<void>;
    createExpense: (payload: Omit<ProjectExpense, "id">) => Promise<ProjectExpense>;
    updateExpense: (id: string, payload: Partial<ProjectExpense>) => Promise<ProjectExpense>;
    deleteExpense: (id: string) => Promise<void>;
};

export const createProjectExpenseSlice: StateCreator<
    ProjectExpenseSlice,
    [["zustand/devtools", never]],
    [],
    ProjectExpenseSlice
> = (set, get) => ({
    expenses: [],
    expensePage: 1,
    expensePageSize: 10,
    expenseTotalPages: 1,
    expenseTotalItems: 0,
    expensesTotalAmount: 0,
    isLoadingExpenses: false,
    expenseError: null,

    getExpensesByProject: async (projectId, page, limit) => {
        const size = limit ?? get().expensePageSize;
        set({ isLoadingExpenses: true, expenseError: null });
        try {
            const { data, headers } = await api.get<ProjectExpense[]>("/gastosProyecto", {
                params: { projectId, _page: page, _limit: size, _sort: "date", _order: "desc" },
            });
            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));
            const totalAmount = data.reduce((acc, g) => acc + (g.amount ?? 0), 0);

            set({
                expenses: data,
                expensePage: page,
                expensePageSize: size,
                expenseTotalItems: totalItems,
                expenseTotalPages: totalPages,
                expensesTotalAmount: totalAmount,
                isLoadingExpenses: false,
            });
        } catch (err) {
            set({ isLoadingExpenses: false, expenseError: "Error al cargar gastos" });
            throw err;
        }
    },

    createExpense: async (payload) => {
        const { data } = await api.post<ProjectExpense>("/gastosProyecto", {
            ...payload,

        });
        set({ expenses: [...get().expenses, data] });
        return data;
    },

    updateExpense: async (id, payload) => {
        const { data } = await api.patch<ProjectExpense>(`/gastosProyecto/${id}`, payload);
        set({
            expenses: get().expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
        });
        return data;
    },

    deleteExpense: async (id) => {
        await api.delete(`/gastosProyecto/${id}`);
        set({ expenses: get().expenses.filter((e) => e.id !== id) });
    },
});
