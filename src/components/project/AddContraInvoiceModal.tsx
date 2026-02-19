import { useForm, useWatch } from "react-hook-form";
import { NumericFormat, type NumberFormatValues } from "react-number-format";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (data: { amount: number; description: string; ref: string }) => Promise<void> | void;
};

export default function AddContraInvoiceModal({ open, onClose, onSave }: Props) {
    const { register, handleSubmit, reset, control, setValue } = useForm<{ amount: number; description: string; ref: string }>({
        defaultValues: { amount: 0, description: "", ref: "" },
    });
    const amount = useWatch({ control, name: "amount" });
    if (!open) return null;

    const submit = handleSubmit(async (values) => {
        await onSave({ amount: Number(values.amount), description: values.description, ref: values.ref });
        reset();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Agregar contrafactura</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-700 block">
                            Monto

                            <NumericFormat
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                inputMode="decimal"
                                value={amount ?? 0}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                                onValueChange={(v: NumberFormatValues) => {
                                    setValue("amount", v.floatValue ?? 0, { shouldValidate: true });
                                }}
                                placeholder="$ 0.00"
                            />

                        </label>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Descripción</label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("description", { required: true })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600">Referencia</label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            {...register("ref", { required: true })}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="px-3 py-2 text-sm rounded-lg bg-primary text-white">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
