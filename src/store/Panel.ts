import type { StateCreator } from "zustand";
import api from "../axios/mainAxios";
import type { PanelResumen } from "../types/Panel";

export type PanelSlice = {
    panelResumen: PanelResumen | null;
    isLoadingPanel: boolean;
    panelError: string | null;
    panelDate: string;

    setPanelDate: (date: string) => void;
    getPanelResumen: (date?: string) => Promise<void>;
};

export const createPanelSlice: StateCreator<
    PanelSlice,
    [["zustand/devtools", never]],
    [],
    PanelSlice
> = (set, get) => ({
    panelResumen: null,
    isLoadingPanel: false,
    panelError: null,
    panelDate: new Date().toLocaleDateString("en-CA"),

    setPanelDate: (date) => set({ panelDate: date }),

    getPanelResumen: async (date) => {
        const selectedDate = date ?? get().panelDate;

        set({ isLoadingPanel: true, panelError: null });

        try {
            const { data } = await api.get<PanelResumen>("/panel/resumen", {
                params: { date: selectedDate },
            });

            set({
                panelResumen: data,
                panelDate: selectedDate,
                isLoadingPanel: false,
            });
        } catch (err) {
            set({
                isLoadingPanel: false,
                panelError: "No se pudo cargar el panel",
            });
            throw err;
        }
    },
});