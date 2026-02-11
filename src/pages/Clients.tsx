// src/pages/ClientsPage.tsx
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
// <-- ajusta al path real de tu table.tsx
import { useBoundStore } from "../store";
import type { Client } from "../types/Client";
import Table from "../components/table/Table";
import { Plus } from "lucide-react";
import ClientDrawer from "../components/project/ClientDrawer";

export default function ClientsPage() {
    const {
        clients,
        clientPage,
        clientPageSize,
        clientTotalPages,
        isLoadingClients,
        clientError,
        getClients,
    } = useBoundStore();

    const [page, setPage] = useState(clientPage);
    const [openModal, setOpenModal] = useState(false);
    const [drawerClient, setDrawerClient] = useState<Client | null>(null);
    const [editing, setEditing] = useState<Client | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Cargar cuando cambia la página
    useEffect(() => {
        void getClients(page, clientPageSize);
    }, [page, clientPageSize, getClients]);

    // Items adaptados para que la tabla pueda mostrar nombre completo
    const tableItems = useMemo(
        () =>
            clients.map((c) => ({
                ...c,
                name: `${c.firstName} ${c.lastName}`,
            })),
        [clients]
    );

    // Columnas que muestra la tabla
    const tableInfo = {
        Nombre: "name",
        Teléfono: "phone",
        Ciudad: "city",
        DNI: "dni",
    };

    const handleView = (client: Client) => {
        setEditing(client);
        setOpenModal(true); // usa tu modal si ya lo tienes; si no, cámbialo por navigate al detalle
    };



    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Clientes</p>
                        <h1 className="text-2xl font-bold text-accent">Lista</h1>
                    </div>
                    <div>
                        <button
                            className="inline-flex mr-1.5 items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                            onClick={() => setOpenModal(true)}
                        >
                            <Plus className="w-4 h-4" /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {clientError && <div className="text-red-600 text-sm">{clientError}</div>}
                <Table
                    items={tableItems as any}          // tu Table espera ClientTypes; es el mismo shape
                    tableInfo={tableInfo}
                    onView={() => setDrawerOpen(true)}
                    page={page}
                    selectedItem={(c: Client | null) => setDrawerClient(c)}
                    setPage={setPage}
                    title="Clientes"
                    totalPages={clientTotalPages}
                >
                    {isLoadingClients && (
                        <p className="text-sm text-slate-500 px-3">Cargando clientes...</p>
                    )}
                </Table>

                <ClientDrawer
                    open={drawerOpen}
                    client={drawerClient}
                    onClose={() => setDrawerOpen(false)}
                />
            </div>
        </AppLayout>
    );
}
