// exportProjectsToXlsx.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Project } from "../types/project";
// ajusta al tipo que uses
import type { Employee } from "../types/Employee";
import type { Client } from "../types/Client";
import { useBoundStore } from "../store"; // donde tengas getExpensesByProject
import type { ProjectExpense } from "../types/ProjectExpense";




const buildId = (x: any) => String(x?._id ?? x?.id ?? "");

export async function exportProjectsToXlsx(
    projects: Project[],
    clients: Client[] = [],
    employees: Employee[] = []
) {
    const { getExpensesByProject } = useBoundStore.getState();
    const expenseTotals: Record<string, number> = {};
    for (const p of projects) {
        // si getExpensesByProject retorna el array, úsalo; si no, lee del estado tras llamar
        const fetched = await getExpensesByProject(p.id, 1, 1000); // sube el límite si hace falta
        const list: ProjectExpense[] = Array.isArray(fetched)
            ? fetched
            : useBoundStore.getState().expenses; // fallback si la acción solo actualiza el estado
        expenseTotals[p.id] = list.reduce((acc, g) => acc + (g.amount ?? 0), 0);
    }
    const clientMap = Object.fromEntries(
        clients.map((c) => [buildId(c), `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()])
    );
    const empMap = Object.fromEntries(
        employees.map((e) => [buildId(e), `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()])
    );

    const rows = projects.map((p) => {
        const clientKey = String((p as Project).client ?? "");
        const gastos = expenseTotals[p.id] ?? 0;
        return {
            Nombre: p.name,
            Cliente: clientMap[clientKey] ?? clientKey, // usa nombre si lo encuentra
            Dirección: p.address,
            Categoría: p.category,
            Presupuesto: p.budget,
            Gastos: gastos,
            "Fecha inicio": p.startDate,
            "Fecha límite": p.dueDate,
            "Fecha cierre": p.endDate ?? "",
            Estado: p.status,
            Equipo: (p.team || [])
                .map((id) => empMap[String(id)] ?? String(id))
                .join(", "),
            Descripción: p.description,
        };
    });

    // ... (resto de estilos/anchos/wrap que ya tienes)
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
    // aplica estilos, header verde, wrapText, etc.
    const blob = new Blob(
        [XLSX.write(wb, { type: "array", bookType: "xlsx", cellStyles: true })],
        { type: "application/octet-stream" }
    );
    saveAs(blob, "proyectos.xlsx");
}

