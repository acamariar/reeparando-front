import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createSessionSlice, type SessionSlice } from "./sesion";
import { createProjectSlice, type ProjectSlice } from "./projects";
import { createEmployeeSlice, type EmployeeSlice } from "./Employee";
import { createClientSlice, type ClientSlice } from "./Client";
import { createProjectExpenseSlice, type ProjectExpenseSlice } from "./ProjectExpense";
import { createTimeEntrySlice, type TimeEntrySlice } from "./TimeEntry";
import { createEmployeePaymentSlice, type EmployeePaymentSlice } from "./EmployeePayment ";
import { createVentaServicioSlice, type VentaServicioSlice } from "./VentaServicio";
import { createColaboradorSlice, type ColaboradorSlice } from "./Colaborador";
import { createCompraEmpresaSlice, type CompraEmpresaSlice } from "./CompraEmpresa";
import { createSeguimientoSlice, type SeguimientoSlice } from "./Seguimiento";
import { createPanelSlice, type PanelSlice } from "./Panel";




export type BoundState = SessionSlice
    & ProjectSlice
    & EmployeeSlice
    & ClientSlice
    & ProjectExpenseSlice
    & TimeEntrySlice
    & EmployeePaymentSlice
    & ColaboradorSlice
    & VentaServicioSlice
    & CompraEmpresaSlice
    & SeguimientoSlice
    & PanelSlice


// extiende con `& OtroSlice` cuando agregues más

export const useBoundStore = create<BoundState>()(
    devtools((...a) => ({
        ...createSessionSlice(...a),
        ...createProjectSlice(...a),
        ...createEmployeeSlice(...a),
        ...createClientSlice(...a),
        ...createProjectExpenseSlice(...a),
        ...createTimeEntrySlice(...a),
        ...createEmployeePaymentSlice(...a),
        ...createColaboradorSlice(...a),
        ...createVentaServicioSlice(...a),
        ...createCompraEmpresaSlice(...a),
        ...createSeguimientoSlice(...a),
        ...createPanelSlice(...a),
        // ...otros slices
    })))