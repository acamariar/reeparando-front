// src/pages/ProjectDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Pencil, Calendar, MapPin, Phone, Mail, MessageSquareReply } from "lucide-react";
import { useParams } from "react-router-dom";
import { useBoundStore } from "../store";
import type { Project } from "../types/project";
import type { Client } from "../types/Client";
import type { Employee } from "../types/Employee";
import AppLayout from "../layout/AppLayout";
import AddExpenseModal from "../components/project/AddExpenseModal";
import AddTeamModal from "../components/project/AddTeamModal";
import AddTimeModal from "../components/project/AddTimeModal";
import AddBudgetModal from "../components/project/AddBudgetModal";
import ExpensesDrawer from "../components/project/BudgetDrawer";
import type { ProjectExpense } from "../types/projectExpense";

export default function ProjectDetail() {
    const { id: projectId } = useParams();


    // stores
    const project = useBoundStore((s) => s.projects.find((p) => p.id === projectId)) as Project | undefined;
    const getProjects = useBoundStore((s) => s.getProjects);
    const clients = useBoundStore((s) => s.clients);
    const getClients = useBoundStore((s) => s.getClients);
    const employees = useBoundStore((s) => s.employees);
    const getEmployees = useBoundStore((s) => s.getEmployees);
    const expenses = useBoundStore((s) => s.expenses);
    const getTimeByProject = useBoundStore((s) => s.getTimeByProject);
    const timeEntries = useBoundStore((s) => s.timeEntries);
    const isLoadingExpenses = useBoundStore((s) => s.isLoadingExpenses)
    const getExpensesByProject = useBoundStore((s) => s.getExpensesByProject);
    const [showAddTeam, setShowAddTeam] = useState(false);
    const [showAddTime, setShowAddTime] = useState(false);
    const [showAddBudget, setShowAddBudget] = useState(false);
    const [open, setOpen] = useState(false);
    const { deleteExpense, updateExpense } = useBoundStore();
    const [editing, setEditing] = useState<ProjectExpense | null>(null);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);

    useEffect(() => {
        if (projectId) {
            getProjects?.(1, 50);
            getClients?.(1, 50);
            getEmployees?.(1, 50);
            getExpensesByProject?.(projectId, 1, 100);
            if (projectId) getTimeByProject(projectId, 1, 200).catch(() => { });
        }
    }, [projectId, getProjects, getClients, getEmployees, getExpensesByProject, getTimeByProject]);

    const client: Client | undefined = useMemo(() => {
        if (!project?.client) return undefined;
        return clients.find((c) => c.id === project.client);
    }, [project, clients]);
    const phoneForWhatsapp = client?.phone?.replace(/\D/g, ""); // deja solo dígitos

    const team = useMemo(() => {
        if (!project?.team?.length) return [];
        const map = new Map(employees.map((e) => [e.id, e]));
        return project.team.map((id) => map.get(id)).filter(Boolean) as Employee[];
    }, [project, employees]);

    const totalBudget = project?.budget ?? 0;
    const totalSpent = useMemo(() => expenses.reduce((acc, g) => acc + (g.amount ?? 0), 0), [expenses]);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const usedPct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const breakdown = useMemo(() => {
        const m = new Map<string, number>();
        expenses.forEach((g) => m.set(g.category, (m.get(g.category) ?? 0) + (g.amount ?? 0)));
        return Array.from(m.entries());
    }, [expenses]);

    if (!project) return <div className="p-6">Cargando proyecto...</div>;
    const entriesByDate: Record<string, { employeeId: string; hours: number; amount: number }[]> =
        timeEntries
            .filter(t => t.projectId === projectId)
            .reduce((acc, t) => {
                const list = acc[t.date] ?? [];
                list.push({ employeeId: t.employeeId, hours: t.hours, amount: t.amount });
                acc[t.date] = list;
                return acc;
            }, {} as Record<string, { employeeId: string; hours: number; amount: number }[]>);
    const employeesMap = new Map(employees.map(e => [e.id, e]));
    const dates = Object.keys(entriesByDate).sort();

    const openDrawer = () => {
        setOpen(true);
        void getExpensesByProject(projectId, 1, 20);
    };

    const onEditExpense = (g: ProjectExpense) => {
        setEditing(g);
        setExpenseModalOpen(true);
    };

    const onDeleteExpense = async (id: string) => {
        if (!confirm("¿Eliminar gasto?")) return;
        await deleteExpense(id);
        await getExpensesByProject(projectId, 1, 20);
    };
    return (
        <AppLayout>
            {/* Header */}
            <div className="bg-white border-slate-100 rounded-xl p-4 shadow-sm flex justify-between items-end text-slate-800">

                <div>
                    <p className="text-sm text-slate-500 mb-2">{project.id}</p>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-xl font-bold">{project.name}</h1>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{project.status}</span>
                    </div>
                </div>
                <div className="flex gap-2 ">
                    <button
                        className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
                        onClick={() => {
                            setEditing(null);
                            setExpenseModalOpen(true);
                        }} // abre modal gasto
                    >
                        + Añadir gasto
                    </button>
                    <button
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800"
                        onClick={() => setShowAddTeam(true)} // abre modal equipo
                    >
                        + Añadir personal
                    </button>
                    <button
                        className="px-3 py-2 rounded-lg bg-secondary text-white text-sm font-semibold"
                        onClick={() => setShowAddBudget(true)} // abre modal presupuesto
                    >
                        + Añadir presupuesto
                    </button>
                </div>
            </div>
            <div className="p-6 space-y-4">


                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Columna izquierda: info general */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">Información General</h2>
                                <button className="text-slate-500 hover:text-slate-700">
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{project.description || "Sin descripción"}</p>

                            <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm text-slate-700">
                                <InfoRow label="Tipo de Proyecto" value={project.category || "N/D"} />
                                <InfoRow label="Fecha Límite" value={project.dueDate || "N/D"} icon={<Calendar className="w-4 h-4" />} />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">Horas (semanal)</h3>
                                <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm" onClick={() => setShowAddTime(true)}>
                                    + Añadir horas
                                </button>
                            </div>

                            {dates.length === 0 ? (
                                <p className="text-sm text-slate-500">Sin horas registradas.</p>
                            ) : (
                                <div className="space-y-3">
                                    {dates.map((d) => (
                                        <div key={d} className="border rounded-lg p-3">
                                            <div className="text-sm font-semibold text-slate-800 mb-2">{d}</div>
                                            <div className="space-y-1">
                                                {entriesByDate[d].map((item, idx) => {
                                                    const emp = employeesMap.get(item.employeeId);
                                                    return (
                                                        <div key={idx} className="flex justify-between text-sm text-slate-700">
                                                            <span>{emp ? `${emp.firstName} ${emp.lastName}` : item.employeeId}</span>
                                                            <span className="font-semibold">${item.amount} / {item.hours} h  </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                    </div>

                    {/* Columna derecha: presupuesto y equipo */}
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-3">Información del Cliente</h2>
                            {client ? (
                                <div className="space-y-3 text-sm text-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">
                                            {client.firstName[0]}{client.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-base">
                                                {client.firstName} {client.lastName}
                                            </p>
                                            <p className="text-slate-500 text-sm">Cliente</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3 space-y-2">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Phone className="w-4 h-4 text-slate-500" />
                                            {client.phone || "Sin teléfono"}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            {client.email || "Sin email"}
                                        </div>
                                        <div className="flex items-start gap-2 text-slate-700">
                                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                                            <span>{client.address}, {client.city}, {client.state}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!phoneForWhatsapp) return;
                                            window.open(`https://wa.me/${phoneForWhatsapp}`, "_blank");
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white font-semibold text-sm border border-orange-100">
                                        <MessageSquareReply className="w-4 h-4" />
                                        Enviar Mensaje
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Cliente no asignado.</p>
                            )}
                        </div>
                        <div
                            onClick={openDrawer}
                            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2 cursor-pointer hover:opacity-80">
                            <h3 className="font-semibold text-slate-900">Presupuesto</h3>
                            <Row label="Presupuesto Total" value={totalBudget} color="text-slate-900" />
                            <Row label="Gastado" value={totalSpent} color="text-blue-600" />
                            <Row label="Restante" value={remaining} color="text-green-600" />
                            <div className="mt-2 h-2 rounded-full bg-slate-200">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
                            </div>
                            <div className="text-xs text-center text-slate-500">{usedPct}% del presupuesto utilizado</div>
                            <div className="pt-2 text-sm space-y-1">
                                <p className="font-semibold text-slate-800">Desglose de Gastos</p>
                                {breakdown.map(([cat, amt]) => (
                                    <div key={cat} className="flex justify-between">
                                        <span className="text-slate-600">{cat}</span>
                                        <span className="font-semibold text-slate-900">${amt.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">Equipo Asignado</h3>
                                <button className="text-primary text-sm font-semibold">+</button>
                            </div>
                            <div className="space-y-3">
                                {team.map((m) => (
                                    <div key={m.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/80 text-white flex items-center justify-center font-semibold">
                                            {m.firstName[0]}{m.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">{m.firstName} {m.lastName}</p>
                                            <p className="text-xs text-slate-500">{m.specialty}</p>
                                        </div>
                                    </div>
                                ))}
                                {team.length === 0 && <p className="text-sm text-slate-500">Sin equipo asignado.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddExpenseModal
                open={expenseModalOpen}
                onClose={() => { setExpenseModalOpen(false); setEditing(null); }}
                projectId={projectId!}
                categories={["Materiales", "Mano de Obra", "Equipo", "Otros"]}
                initialValues={editing}
            />
            <AddTeamModal
                open={showAddTeam}
                onClose={() => setShowAddTeam(false)}
                projectId={projectId!}
                currentTeam={project.team ?? []}
            />
            <AddTimeModal
                open={showAddTime}
                onClose={() => setShowAddTime(false)}
                projectId={projectId!}
                teamIds={project.team ?? []}
            />
            <AddBudgetModal
                open={showAddBudget}
                onClose={() => setShowAddBudget(false)}
                projectId={projectId!}
                currentBudget={project.budget ?? 0}
            />
            <ExpensesDrawer
                open={open}
                expenses={expenses}
                loading={isLoadingExpenses}
                onClose={() => setOpen(false)}
                onEdit={onEditExpense}
                onDelete={onDeleteExpense}
            />
        </AppLayout>
    );
}

function Row({ label, value, color = "text-slate-900" }: { label: string; value: number; color?: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-600">{label}</span>
            <span className={`font-semibold ${color}`}>${value.toLocaleString()}</span>
        </div>
    );
}

function InfoRow({ label, value, icon, badge }: { label: string; value: string; icon?: React.ReactNode; badge?: boolean }) {
    if (badge) {
        return (
            <div className="flex flex-col">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 w-fit">{value}</span>
            </div>
        );
    }
    return (
        <div className="flex flex-col">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-sm text-slate-800 flex items-center gap-1">
                {icon} {value}
            </span>
        </div>
    );
}
