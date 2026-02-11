import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createSessionSlice, type SessionSlice } from "./sesion";
import { createProjectSlice, type ProjectSlice } from "./projects";
import { createEmployeeSlice, type EmployeeSlice } from "./Employee";
import { createClientSlice, type ClientSlice } from "./Client";
import { createProjectExpenseSlice, type ProjectExpenseSlice } from "./ProjectExpense";
import { createTimeEntrySlice, type TimeEntrySlice } from "./TimeEntry";
import { createEmployeePaymentSlice, type EmployeePaymentSlice } from "./EmployeePayment ";




export type BoundState = SessionSlice
    & ProjectSlice
    & EmployeeSlice
    & ClientSlice
    & ProjectExpenseSlice
    & TimeEntrySlice
    & EmployeePaymentSlice

// extiende con `& OtroSlice` cuando agregues más

export const useBoundStore = create<BoundState>()(
    devtools((...a) => ({
        ...createSessionSlice(...a),
        ...createProjectSlice(...a),
        ...createEmployeeSlice(...a),
        ...createClientSlice(...a),
        ...createProjectExpenseSlice(...a),
        ...createTimeEntrySlice(...a),
        ...createEmployeePaymentSlice(...a)

        // ...otros slices
    })))