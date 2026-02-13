// src/components/project/ExpensesDrawer.tsx
import { Pencil, Trash2, X } from "lucide-react";
import type { ProjectExpense } from "../../types/projectExpense";

type Props = {
    open: boolean;
    expenses: ProjectExpense[];
    loading: boolean;
    onClose: () => void;
    onEdit: (g: ProjectExpense) => void
    onDelete: (id: string) => Promise<void>
};

export default function ExpensesDrawer({ open, expenses, loading, onClose, onDelete, onEdit }: Props) {


    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
        >
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div
                className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h2 className="text-lg font-semibold text-slate-800">Gastos del proyecto</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-[calc(100%-56px)] overflow-y-auto p-4 space-y-3 text-sm text-slate-700">
                    {loading && <div className="text-slate-500">Cargando...</div>}
                    {!loading && expenses.length === 0 && (
                        <div className="text-slate-500">Sin gastos registrados.</div>
                    )}
                    {!loading &&
                        expenses.map((g) => (
                            <div
                                key={g.id}
                                className="rounded-lg border border-slate-200 p-3 shadow-xs"
                            >

                                <div className="flex justify-between">
                                    <div className="">
                                        <span className="font-semibold text-slate-900 mr-2">
                                            {g.category}
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            ${Number(g.amount ?? 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="">
                                        <button
                                            onClick={() => onEdit(g)}
                                            className="p-2 rounded-full text-slate-500 hover:text-emerald-600 hover:bg-slate-100"
                                            aria-label="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(g.id)}
                                            className="p-2 rounded-full text-slate-500 hover:text-red-600 hover:bg-slate-100"
                                            aria-label="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500">{g.date}</div>
                                <div className="text-xs text-slate-500">{g.supplier}</div>
                                <div className="text-xs text-slate-500">FC: {g.invoiceRef}</div>
                                {g.concept && (
                                    <div className="text-slate-600 mt-1">{g.concept}</div>
                                )}
                            </div>
                        ))}
                </div>
            </div>

        </div>
    );
}
