// src/store/employee.ts
import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { Employee } from "../types/Employee";

export type EmployeeSlice = {
    employees: Employee[];

    isLoadingEmployees: boolean;
    employeeError: string | null;
    employeePage: number;
    employeePageSize: number;
    employeeTotalPages: number;
    employeeTotalItems: number;
    getEmployees: (page: number, limit?: number) => Promise<void>;
    getEmployeeById: (id: string) => Promise<Employee>;
    createEmployee: (payload: Omit<Employee, "id">) => Promise<Employee>;
    updateEmployee: (id: string, payload: Partial<Employee>) => Promise<Employee>;
    deleteEmployee: (id: string) => Promise<void>;
};

export const createEmployeeSlice: StateCreator<
    EmployeeSlice,
    [["zustand/devtools", never]],
    [],
    EmployeeSlice
> = (set, get) => ({
    employees: [],
    isLoadingEmployees: false,
    employeePage: 1,
    employeePageSize: 10,
    employeeTotalPages: 1,
    employeeTotalItems: 0,
    employeeError: null,

    getEmployees: async (page, limit) => {
        const size = limit ?? get().employeePageSize;
        set({ isLoadingEmployees: true, employeeError: null });
        try {
            const { data, headers } = await api.get<Employee[]>("/personal", {
                params: { _page: page, _limit: size, _sort: "lastName" },
            });
            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));
            set({
                employees: data,
                employeePage: page,
                employeePageSize: size,
                employeeTotalItems: totalItems,
                employeeTotalPages: totalPages,
                isLoadingEmployees: false,
            });
        } catch (err) {
            set({ isLoadingEmployees: false, employeeError: "Error al cargar equipo" });
            throw err;
        }
    },

    getEmployeeById: async (id) => {
        const { data } = await api.get<Employee>(`/personal/${id}`);
        set({ employees: [...get().employees.filter((e) => e.id !== id), data] });
        return data;
    },

    createEmployee: async (payload) => {
        const { data } = await api.post<Employee>("/personal", { ...payload, });
        set({ employees: [...get().employees, data] });
        return data;
    },

    updateEmployee: async (id, payload) => {
        const { data } = await api.patch<Employee>(`/personal/${id}`, payload);
        set({ employees: get().employees.map((e) => (e.id === id ? { ...e, ...data } : e)) });
        return data;
    },

    deleteEmployee: async (id) => {
        await api.delete(`/personal/${id}`);
        set({ employees: get().employees.filter((e) => e.id !== id) });
    },
});
