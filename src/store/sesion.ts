
import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { User } from "../types/userType";



export type SessionSlice = {
    isAuthenticated: boolean;
    users: User[];
    user: User;
    isLoading: boolean;
    error: string | null;
    login: (usuario: string, clave: string) => Promise<User>;
    logout: () => void;
    getUser: () => Promise<void>
}
const initialSessionData: User = {
    id: "",
    usuario: "",
    clave: "",
    nivel: 'superAdmin'

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
    isLoading: false,
    error: null,
    login: async (usuario, clave) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post("/usuarios/login", { usuario, clave });
            set({ isAuthenticated: true, user: data.user, isLoading: false });
            return data;
        } catch (err) {
            set({ isAuthenticated: false, user: initialSessionData, isLoading: false, error: "Credenciales incorrectas" });
            throw err;
        }
    },
    logout: () => set({ isAuthenticated: false, user: initialSessionData }),
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