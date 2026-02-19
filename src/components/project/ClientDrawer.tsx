import { Pencil, X } from "lucide-react";
import type { Client } from "../../types/Client";
import { CreateClientModal } from "./CreateClientModal";
import { useState } from "react";
import { useBoundStore } from "../../store";

type Props = {
    open: boolean;
    client: Client | null;
    onClose: () => void;
};

export default function ClientDrawer({ open, client, onClose }: Props) {
    const [showEdit, setShowEdit] = useState(false);
    const [drawerClient, setDrawerClient] = useState<Client | null>(null);
    const updateClient = useBoundStore((s) => s.updateClient);
    const getClients = useBoundStore((s) => s.getClients);
    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-hidden
            />
            {/* Panel */}
            <div
                className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                        <p className="text-xs text-slate-500">Cliente</p>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {client ? `${client.firstName} ${client.lastName}` : "Cargando..."}
                        </h2>
                    </div>
                    <div>
                        <button onClick={() => {
                            setDrawerClient(client);
                            setShowEdit(true);
                        }} className="p-2 text-slate-500 hover:text-slate-700">
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700">
                            <X className="w-5 h-5" />
                        </button>

                    </div>

                </div>

                <div className="p-4 space-y-3 text-sm text-slate-700 overflow-y-auto h-[calc(100%-56px)]">
                    {!client ? (
                        <div className="text-slate-500">Cargando...</div>
                    ) : (
                        <>
                            <Row label="Correo" value={client.email} />
                            <Row label="Teléfono" value={client.phone} />
                            <Row label="Dirección" value={client.address} />
                            <Row label="Ciudad / Provincia" value={`${client.city}, ${client.state}`} />
                            <Row label="Código postal" value={client.zip} />
                            <Row label="DNI" value={client.dni} />
                            <Row label="Medio de referencia" value={client.referenceMedium} />
                            <Row label="Venta generada" value={client.generatedSale} />
                            <Row label="Creado" value={client.createdAt} />
                            <Row label="Notas" value={client.notes ?? "—"} full />
                        </>
                    )}
                </div>
            </div>
            <CreateClientModal
                open={showEdit}
                mode="edit"
                initialValues={drawerClient ?? undefined}
                onClose={() => setShowEdit(false)}
                onSave={async (values) => {
                    await updateClient(drawerClient!.id, values);
                    await getClients(1, 50);
                }}
            />
        </div>
    );
}

function Row({ label, value, full }: { label: string; value: string; full?: boolean }) {
    return (
        <div className={full ? "w-full" : ""}>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-base text-slate-800">{value}</p>
        </div>
    );
}
