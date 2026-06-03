import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import { useBoundStore } from "../store";
import type { Client } from "../types/Client";
import Table from "../components/table/Table";
import { Plus } from "lucide-react";
import ClientDrawer from "../components/project/ClientDrawer";
import { CreateClientModal } from "../components/project/CreateClientModal";

export default function ClientsPage() {
    const {
        clients,
        clientPageSize,
        isLoadingClients,
        clientError,
        getClients,
    } = useBoundStore();

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [openModal, setOpenModal] = useState(false);
    const [drawerClient, setDrawerClient] = useState<Client | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);


    useEffect(() => {
        void getClients(1, 1000);
    }, [getClients]);

    const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));

    const visibleClients = useMemo(() => {
        const start = (page - 1) * pageSize;

        return clients.slice(start, start + pageSize);
    }, [clients, page]);
    const tableItems = useMemo(
        () =>
            visibleClients.map((c) => ({
                ...c,
                name: `${c.firstName} ${c.lastName}`,
            })),
        [visibleClients]
    );

    const tableInfo = {
        Nombre: "name",
        Teléfono: "phone",
        Ciudad: "city",
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
                    items={tableItems}
                    tableInfo={tableInfo}
                    onView={() => setDrawerOpen(true)}
                    page={page}
                    selectedItem={(c) => setDrawerClient(c as Client)}
                    setPage={setPage}
                    title="Clientes"
                    totalPages={totalPages}
                    action={true}
                >
                    {isLoadingClients && (
                        <p className="text-sm text-slate-500 px-3">Cargando clientes...</p>
                    )}
                </Table>

                <ClientDrawer
                    open={drawerOpen}
                    client={drawerClient}
                    page={page}
                    pageSize={clientPageSize}
                    onClose={() => setDrawerOpen(false)}
                />

                <CreateClientModal
                    open={openModal}
                    onClose={() => setOpenModal(false)} />

            </div>
        </AppLayout>
    );
}
