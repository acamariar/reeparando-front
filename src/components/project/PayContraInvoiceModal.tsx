import { useForm } from "react-hook-form";

type ExpenseOption = { id: string; description?: string; amount?: number };
type Props = {
    open: boolean;
    expenses: ExpenseOption[];
    onClose: () => void;
    onPay: (id: string, amount?: number, description?: string) => Promise<void> | void;
};


export default function PayContraInvoiceModal({ open, expenses, onClose, onPay }: Props) {
    const { register, handleSubmit, reset } = useForm<{ expenseId: string }>({
        defaultValues: { expenseId: expenses[0]?.id ?? "" },
    });
    if (!open) return null;
    const submit = handleSubmit(async ({ expenseId }) => {
        const exp = expenses.find((e) => e.id === expenseId);
        if (!exp) return;
        await onPay(expenseId);
        reset();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Pagar contrafactura</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Selecciona contrafactura</label>
                        <select
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("expenseId", { required: true })}
                        >
                            {expenses.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.description ?? `Contrafactura ${e.id}`} — ${e.amount?.toLocaleString() ?? 0}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="px-3 py-2 text-sm rounded-lg bg-primary text-white">Marcar pagada</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
