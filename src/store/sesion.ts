
import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { User } from "../types/userType";



type LoginResponse = {
    accessToken: string;
    user: User;
    passwordSet: boolean;
};
export type SessionSlice = {
    isAuthenticated: boolean;
    users: User[];
    user: User;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (usuario: string, clave: string) => Promise<LoginResponse>;
    logout: () => void;
    getUser: () => Promise<void>
    hydrateSession: () => void;
}
const initialSessionData: User = {
    id: "",
    usuario: "",
    clave: "",
    nivel: 1,
    passwordSet: false,
}

export const createSessionSlice: StateCreator<
    SessionSlice,
    [["zustand/devtools", never]],
    [],
    SessionSlice
> = (set) => ({
    isAuthenticated: false,
    users: [],
    user: initialSessionData,
    token: localStorage.getItem("token"),
    isLoading: false,
    error: null,

    hydrateSession: () => {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");

        if (!token || !userRaw) {
            set({
                token: null,
                user: initialSessionData,
                isAuthenticated: false,
            });
            return;
        }

        try {
            const user = JSON.parse(userRaw) as User;
            set({
                token,
                user,
                isAuthenticated: true,
            });
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            set({
                token: null,
                user: initialSessionData,
                isAuthenticated: false,
            });
        }
    },

    login: async (usuario, clave) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post<LoginResponse>("/auth/login", { usuario, clave });
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            set({ isAuthenticated: true, user: data.user, token: data.accessToken, isLoading: false });
            return data;
        } catch (err) {
            set({ isAuthenticated: false, user: initialSessionData, token: null, isLoading: false, error: "Credenciales incorrectas" });
            throw err;
        }
    },
    logout: () => set({ isAuthenticated: false, user: initialSessionData, token: null }),
    getUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get<User[]>("/usuarios");
            set({ users: data })
        } catch (err) {
            set({ user: initialSessionData, isLoading: false });
            throw err;
        }
    },
});