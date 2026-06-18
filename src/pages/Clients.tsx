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
        clientTotalPages,
    } = useBoundStore();

    const [page, setPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const [drawerClient, setDrawerClient] = useState<Client | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const t = setTimeout(() => {
            void getClients(page, clientPageSize, search || undefined);
        }, 300);

        return () => clearTimeout(t);
    }, [page, clientPageSize, search, getClients]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const tableItems = useMemo(
        () =>
            clients.map((c) => ({
                ...c,
                name: `${c.firstName} ${c.lastName}`,
            })),
        [clients]
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
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar cliente..."
                            className="rounded-lg border w-96  border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary/20 mr-1.5"
                        />
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
                    totalPages={clientTotalPages}
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
