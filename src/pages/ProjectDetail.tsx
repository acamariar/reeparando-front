// src/pages/ProjectDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Pencil, Calendar, MapPin, Phone, Mail, MessageSquareReply, BanknoteArrowDown, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useBoundStore } from "../store";
import type { Project, ProjectStatus } from "../types/project";
import type { Client } from "../types/Client";
import type { Employee } from "../types/Employee";
import AppLayout from "../layout/AppLayout";
import AddExpenseModal from "../components/project/AddExpenseModal";
import AddTeamModal from "../components/project/AddTeamModal";
import AddTimeModal from "../components/project/AddTimeModal";
import AddBudgetModal from "../components/project/AddBudgetModal";
import ExpensesDrawer from "../components/project/BudgetDrawer";

import StatusModal from "../components/project/StatusModal";
import CloseDateModal from "../components/project/CloseDateModal";
import type { TimeEntry } from "../types/TimeEntry ";
import EditTimeEntryModal from "../components/project/EditTimeEntryModal";
import AddContraInvoiceModal from "../components/project/AddContraInvoiceModal";
import PayContraInvoiceModal from "../components/project/PayContraInvoiceModal";
import CreateProjectModal from "../components/project/CreateProjectModal";
import type { ProjectExpense } from "../types/ProjectExpense";

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
    const { deleteExpense } = useBoundStore();
    const [editing, setEditing] = useState<ProjectExpense | null>(null);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const updateProject = useBoundStore((s) => s.updateProject); // ajusta al nombre real
    const [showStatusModal, setShowStatusModal] = useState(false);
    const { updateTime, deleteTime } = useBoundStore();
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [showCloseDateModal, setShowCloseDateModal] = useState(false);
    const updateEmployee = useBoundStore((s) => s.updateEmployee);
    const [showContraModal, setShowContraModal] = useState(false);
    const [showPayContraModal, setShowPayContraModal] = useState(false);
    const createExpense = useBoundStore((s) => s.createExpense);   // ya debe existir
    const updateExpense = useBoundStore((s) => s.updateExpense);   // PATCH /gastos/:id
    // estado nuevo (ya usas useState)
    const [showActions, setShowActions] = useState(false);
    const [showEditProject, setShowEditProject] = useState(false);


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



    if (!project) return <div className="p-6">Cargando proyecto...</div>;
    const entriesByDate: Record<string, TimeEntry[]> = timeEntries
        .filter((t) => t.projectId === projectId)
        .reduce((acc, t) => {
            (acc[t.date] ??= []).push(t); // guarda la entrada completa con id
            return acc;
        }, {} as Record<string, TimeEntry[]>);

    const employeesMap = new Map(employees.map((e) => [e.id, e]));
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
    const facturaPendiente = expenses.filter((e) => e.category === "Contrafactura");
    const factuPen = facturaPendiente.map((e) => e.amount ?? 0).reduce((a, b) => a + b, 0);

    const expensesEmployes = expenses.filter(e => e.category === "Personal" && e.projectId === projectId);
    const totalExpenses = expensesEmployes.reduce((sum, e) => sum + (e.amount ?? 0), 0);

    console.log("Total gastos de personal:", totalExpenses);







    return (
        <AppLayout>
            {/* Header */}
            <div className="bg-white border-slate-100 rounded-xl p-4 shadow-sm  text-slate-800 sm:flex sm:justify-between md:grid md:grid-cols-1">
                <div className="lg:flex lg:justify-between mb-3 max-w-96 md:grid md:grid-cols-1 gap-4">
                    <p className="text-sm text-slate-500 mb-1">{project.id}</p>

                    <h1 className="text-lg sm:text-xl font-bold truncate">{project.name}</h1>
                    <span className="px-2 py-1 text-[11px] rounded-full bg-blue-100 text-blue-700">{project.status}</span>

                </div>

                {/* Botones completos solo en md+ */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-2">
                    <button className="h-9 rounded-lg bg-primary text-white text-sm font-semibold" onClick={() => { setEditing(null); setExpenseModalOpen(true); }}>+ Añadir gasto</button>
                    <button className="h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800" onClick={() => setShowAddTeam(true)}>+ Añadir personal</button>
                    <button className="h-9 rounded-lg bg-secondary text-white text-sm font-semibold" onClick={() => setShowAddBudget(true)}>+ Añadir presupuesto</button>
                    <button className="h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800" onClick={() => setShowStatusModal(true)}>Cambiar estado</button>
                    <button className="h-9 rounded-lg bg-primary text-white text-sm font-semibold" onClick={() => setShowContraModal(true)}>Agregar contrafactura</button>
                    <button className="h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800" onClick={() => setShowPayContraModal(true)}>Pagar contrafactura</button>
                </div>

                {/* Hamburguesa solo en mobile */}
                <button
                    className="md:hidden px-3 py-2 rounded-lg border border-slate-200 text-sm h-9"
                    onClick={() => setShowActions(true)}
                >
                    ☰
                </button>
                {showActions && (
                    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
                        <div className="w-72 max-w-[80%] bg-white h-full p-4 space-y-3 shadow-xl">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Acciones</span>
                                <button onClick={() => setShowActions(false)}>✕</button>
                            </div>
                            <div className="grid gap-2">
                                <button className="h-10 rounded-lg bg-primary text-white text-sm font-semibold" onClick={() => { setEditing(null); setExpenseModalOpen(true); setShowActions(false); }}>+ Añadir gasto</button>
                                <button className="h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800" onClick={() => { setShowAddTeam(true); setShowActions(false); }}>+ Añadir personal</button>
                                <button className="h-10 rounded-lg bg-secondary text-white text-sm font-semibold" onClick={() => { setShowAddBudget(true); setShowActions(false); }}>+ Añadir presupuesto</button>
                                <button className="h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800" onClick={() => { setShowStatusModal(true); setShowActions(false); }}>Cambiar estado</button>
                                <button className="h-10 rounded-lg bg-primary text-white text-sm font-semibold" onClick={() => { setShowContraModal(true); setShowActions(false); }}>Agregar contrafactura</button>
                                <button className="h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800" onClick={() => { setShowPayContraModal(true); setShowActions(false); }}>Pagar contrafactura</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-6 space-y-4">


                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Columna izquierda: info general */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">Información General</h2>
                                <button className="text-slate-500 hover:text-slate-700"
                                    onClick={() => setShowEditProject(true)}>
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{project.description || "Sin descripción"}</p>

                            <div className="grid md:grid-cols-4 gap-3 mt-4 text-sm text-slate-700">
                                <InfoRow label="Tipo de Proyecto" value={project.category || "N/D"} />
                                <InfoRow label="Fecha de Inicio" value={project.startDate || "N/D"} icon={<Calendar className="w-4 h-4" />} />
                                <InfoRow label="Fecha Límite" value={project.dueDate || "N/D"} icon={<Calendar className="w-4 h-4" />} />
                                <div className="flex flex-col cursor-pointer" onClick={() => setShowCloseDateModal(true)}>
                                    <span className="text-xs text-slate-500">Fecha de Cierre</span>
                                    <span className="text-sm text-slate-800 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {project.endDate || "N/D"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">Horas (semanal)</h3>
                                <button className="cursor-pointer px-3 py-1.5 rounded-lg bg-primary text-white text-sm" onClick={() => setShowAddTime(true)}>
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
                                                            <span className="font-semibold">${item.amount} / {item.hours} h
                                                                <button
                                                                    className="text-slate-500 mx-2 hover:text-slate-700"
                                                                    onClick={() => setEditingEntry(item)}>
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    className="text-red-500 hover:text-red-600"
                                                                    onClick={async () => {
                                                                        if (!confirm("¿Eliminar horas?")) return;
                                                                        const amount = item.amount ?? 0;
                                                                        const empId = item.employeeId;

                                                                        await deleteTime(item.id);

                                                                        // resta el monto al saldo del empleado
                                                                        const emp = employeesMap.get(empId);
                                                                        const newBalance = Math.max(0, (emp?.saldoActual ?? 0) - amount);
                                                                        await updateEmployee(empId, { saldoActual: newBalance });

                                                                        // refresca vistas
                                                                        await Promise.all([
                                                                            getTimeByProject(projectId!, 1, 200),
                                                                            getEmployees?.(1, 50),
                                                                        ]);
                                                                    }}
                                                                ><Trash2 className="w-3 h-3" /></button></span>

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
                                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white font-semibold text-sm border border-orange-100 cursor-pointer">
                                        <MessageSquareReply className="w-4 h-4" />
                                        Enviar Mensaje
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Cliente no asignado.</p>
                            )}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2 ">
                            <h3 className="font-semibold text-slate-900">Presupuesto</h3>
                            <Row label="Presupuesto Total" value={totalBudget} color="text-slate-900" />
                            <Row label="Gastado" value={totalSpent} color="text-blue-600" />


                            <Row label="contra Factura" value={factuPen} color="text-red-600" />
                            <Row label="Personal" value={totalExpenses} color="text-slate-700" />
                            <Row label="Restante" value={remaining} color="text-green-600" />
                            <div className="mt-2 h-2 rounded-full bg-slate-200">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
                            </div>
                            <div className="text-xs text-center text-slate-500">{usedPct}% del presupuesto utilizado</div>

                            <button
                                onClick={openDrawer}
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white font-semibold text-sm border border-orange-100 cursor-pointer">
                                <BanknoteArrowDown className="w-4 h-4" />
                                Ver Gastos
                            </button>
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
            <StatusModal
                open={showStatusModal}
                currentStatus={project.status}
                options={["FINALIZADA", "GARANTIA"]}
                onClose={() => setShowStatusModal(false)}
                onSave={async (newStatus: ProjectStatus) => {
                    try {
                        await updateProject(projectId as string, { status: newStatus });
                    } catch (e) {
                        console.error("Error al actualizar estado", e);
                    }
                    await getProjects?.(1, 50);
                    setShowStatusModal(false);
                }
                }
            />
            <CloseDateModal
                open={showCloseDateModal}
                currentDate={project.endDate || ""}
                onClose={() => setShowCloseDateModal(false)}
                onSave={async (newDate) => {
                    if (!projectId) return;
                    await updateProject(projectId, { endDate: newDate }); // usa la clave que espera el backend
                    await getProjects?.(1, 50);
                    setShowCloseDateModal(false);
                }}
            />
            <EditTimeEntryModal
                open={!!editingEntry}
                entry={editingEntry}
                onClose={() => setEditingEntry(null)}
                onSave={async ({ id, hours, amount }) => {
                    if (!editingEntry) return;

                    // 1) Actualiza la entrada
                    await updateTime(id, { hours, amount });

                    // 2) Ajusta saldo del empleado con la diferencia
                    const empId = editingEntry.employeeId;
                    const prevAmount = editingEntry.amount ?? 0;
                    const delta = (amount ?? 0) - prevAmount; // positivo si sube, negativo si baja

                    const emp = employeesMap.get(empId);
                    if (emp) {
                        const newBalance = (emp.saldoActual ?? 0) + delta; // usa la clave real de saldo
                        await updateEmployee(empId, { saldoActual: newBalance });
                    }

                    // 3) Refresca listas para ver el saldo actualizado
                    await Promise.all([
                        getTimeByProject(projectId!, 1, 200),
                        getEmployees?.(1, 50),
                    ]);

                    setEditingEntry(null);
                }}
            />
            <AddContraInvoiceModal
                open={showContraModal}
                onClose={() => setShowContraModal(false)}
                onSave={async ({ amount, ref }) => {
                    if (!projectId) return;
                    const value = Number(amount) || 0;

                    // 1) Crear gasto
                    await createExpense({
                        projectId,
                        amount: value,
                        concept: "Contrafactura pendiente",
                        category: "Contrafactura",
                        date: new Date().toISOString().split("T")[0],
                        invoiceRef: ref
                    });

                    // 2) Aumentar presupuesto
                    const currentBudget = project?.budget ?? 0;
                    await updateProject(projectId, { budget: currentBudget + value });

                    // 3) Refrescar listas
                    await Promise.all([
                        getExpensesByProject(projectId, 1, 100),
                        getProjects?.(1, 50),
                    ]);

                    setShowContraModal(false);
                }}
            />

            <PayContraInvoiceModal
                open={showPayContraModal}
                onClose={() => setShowPayContraModal(false)}
                expenses={expenses.filter((e) => e.category === "Contrafactura")}
                onPay={async (id) => {
                    const g = expenses.find((e) => e.id === id);
                    if (!g) return;

                    await updateExpense(id, {
                        projectId: g.projectId,
                        concept: "Pago de contrafactura",
                        category: "ContrafacturaPagada",
                    });

                    await getExpensesByProject(projectId!, 1, 100);
                    await getProjects?.(1, 50);
                    setShowPayContraModal(false);
                }} />
            <CreateProjectModal
                open={showEditProject}
                mode="edit"
                initialValues={{
                    name: project.name,
                    client: project.client,
                    address: project.address,
                    category: project.category,
                    budget: project.budget ?? 0,
                    dueDate: project.dueDate ?? "",
                    startDate: project.startDate ?? "",
                    endDate: project.endDate ?? "",
                    status: project.status,
                    description: project.description ?? "",

                }}
                onClose={() => setShowEditProject(false)}
                onSubmit={async (values) => {
                    await updateProject(projectId!, values); // tu acción patch
                    await getProjects?.(1, 50);
                    setShowEditProject(false);
                }}
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
