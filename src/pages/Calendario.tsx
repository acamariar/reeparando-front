import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import type { TimeEntry } from "../types/TimeEntry ";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function toYmd(date: Date) {
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeekSunday(date: Date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 domingo
    d.setDate(d.getDate() - day);
    return d;
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function monthLabel(date: Date) {
    return new Intl.DateTimeFormat("es-AR", {
        month: "long",
        year: "numeric",
    })
        .format(date)
        .toUpperCase();
}



export default function Calendario() {
    const employees = useBoundStore((s) => s.employees);
    const getEmployees = useBoundStore((s) => s.getEmployees);
    const getProjects = useBoundStore((s) => s.getProjects);

    const timeEntries = useBoundStore((s) => s.timeEntries);
    const isLoadingTime = useBoundStore((s) => s.isLoadingTime);
    const timeError = useBoundStore((s) => s.timeError);
    const getTimeRange = useBoundStore((s) => s.getTimeRange);

    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [employeeId, setEmployeeId] = useState("");
    const [projectId, setProjectId] = useState("");

    useEffect(() => {
        void getEmployees?.(1, 500).catch(() => { });
        void getProjects?.(1, 500).catch(() => { });
    }, [getEmployees, getProjects]);

    const from = useMemo(() => toYmd(startOfMonth(currentMonth)), [currentMonth]);
    const to = useMemo(() => toYmd(endOfMonth(currentMonth)), [currentMonth]);

    useEffect(() => {
        void getTimeRange(from, to, employeeId || undefined, projectId || undefined).catch(() => { });
    }, [from, to, employeeId, projectId, getTimeRange]);

    const monthDays = useMemo(() => {
        const firstDay = startOfMonth(currentMonth);
        const lastDay = endOfMonth(currentMonth);
        const gridStart = startOfWeekSunday(firstDay);

        const days: Date[] = [];
        const totalCells = 42; // 6 semanas x 7 días

        for (let i = 0; i < totalCells; i++) {
            days.push(addDays(gridStart, i));
        }

        return {
            firstDay,
            lastDay,
            days,
        };
    }, [currentMonth]);

    const entriesByDate = useMemo(() => {
        const map = new Map<string, TimeEntry[]>();

        for (const entry of timeEntries) {
            const key = entry.date;
            const current = map.get(key) ?? [];
            current.push(entry);
            map.set(key, current);
        }

        return map;
    }, [timeEntries]);





    const clearFilters = () => {
        setEmployeeId("");
        setProjectId("");
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                                    )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                                aria-label="Mes anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="min-w-40 text-lg font-extrabold tracking-wide text-slate-900">
                                {monthLabel(currentMonth)}
                            </div>

                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                                    )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                                aria-label="Mes siguiente"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => setCurrentMonth(new Date())}
                                className="ml-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Hoy
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <button
                                onClick={clearFilters}
                                className="text-orange-500 hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
                        <label className="text-sm text-slate-700">
                            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                                <Users className="h-3.5 w-3.5" />
                                Empleado:
                            </div>
                            <select
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="min-w-[230px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="">Todos los empleados</option>
                                {employees.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.firstName} {e.lastName}
                                    </option>
                                ))}
                            </select>
                        </label>

                    </div>
                </div>


                {timeError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {timeError}
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                            <div key={d} className="px-3 py-2 text-center">
                                {d}
                            </div>
                        ))}
                    </div>

                    {isLoadingTime ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            Cargando calendario...
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {monthDays.days.map((day) => {
                                const key = toYmd(day);
                                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                const dayEntries = entriesByDate.get(key) ?? [];

                                return (
                                    <div
                                        key={key}
                                        className={[
                                            "min-h-[130px] border-r border-b border-slate-200 p-2",
                                            isCurrentMonth ? "bg-white" : "bg-slate-50/80 text-slate-400",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold">
                                                {day.getDate()}
                                            </span>
                                            {dayEntries.length > 0 && (
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                    {dayEntries.length}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            {dayEntries.slice(0, 4).map((entry, index) => {
                                                const employee = employees.find(
                                                    (e) => e.id === entry.employeeId
                                                );
                                                const name = employee
                                                    ? `${employee.firstName} ${employee.lastName}`
                                                    : entry.employeeId;

                                                return (
                                                    <div
                                                        key={`${entry.id}-${index}`}
                                                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate font-medium">
                                                                {name}
                                                            </span>
                                                            <span className="text-slate-500">
                                                                {Number(entry.hours ?? 0)}h
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {dayEntries.length > 4 && (
                                                <div className="text-[11px] text-slate-500">
                                                    +{dayEntries.length - 4} más
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="text-xs text-slate-500">
                    Mostrando {monthLabel(currentMonth)}. Filtrado por rango{" "}
                    {from} - {to}.
                </div>
            </div>
        </AppLayout>
    );
}

