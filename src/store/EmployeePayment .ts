import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { EmployeePayment } from "../types/EmployeePayment";

export type EmployeePaymentSlice = {
    payments: EmployeePayment[];
    isLoadingPayments: boolean;
    paymentError: string | null;
    paymentPage: number;
    paymentPageSize: number;
    paymentTotalPages: number;
    paymentTotalItems: number;

    getPaymentsByEmployee: (employeeId: string, projectId?: string, page?: number, limit?: number) => Promise<void>;
    createPayment: (payload: Omit<EmployeePayment, "id">) => Promise<EmployeePayment>;
};

export const createEmployeePaymentSlice: StateCreator<
    EmployeePaymentSlice,
    [["zustand/devtools", never]],
    [],
    EmployeePaymentSlice
> = (set, get) => ({
    payments: [],
    paymentPage: 1,
    paymentPageSize: 10,
    paymentTotalPages: 1,
    paymentTotalItems: 0,
    isLoadingPayments: false,
    paymentError: null,

    getPaymentsByEmployee: async (employeeId, projectId, page = 1, limit) => {
        const size = limit ?? get().paymentPageSize ?? 10;
        set({ isLoadingPayments: true, paymentError: null });
        try {
            const params: Record<string, any> = { employeeId, _sort: "date", _order: "desc", _page: page, _limit: size };
            if (projectId) params.projectId = projectId;
            const { data, headers } = await api.get<EmployeePayment[]>("/pagosPersonal", { params });
            const totalItems = Number(headers["x-total-count"] ?? data.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / size));
            set({
                payments: data,
                paymentPage: page,
                paymentPageSize: size,
                paymentTotalItems: totalItems,
                paymentTotalPages: totalPages,
                isLoadingPayments: false,
            });
        } catch (err: any) {
            set({ isLoadingPayments: false, paymentError: err.message ?? "Error al cargar pagos" });
            throw err;
        }
    },
    createPayment: async (payload) => {
        const { data } = await api.post<EmployeePayment>("/pagosPersonal", { ...payload, });
        set((s) => ({ payments: [...s.payments, data] }));
        return data;
    },
});
