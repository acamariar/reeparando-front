// exportProjectsToXlsx.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Project } from "../types/project";
// ajusta al tipo que uses
import type { Employee } from "../types/Employee";
import type { Client } from "../types/Client";

const buildId = (x: any) => String(x?._id ?? x?.id ?? "");

export function exportProjectsToXlsx(
    projects: Project[],
    clients: Client[] = [],
    employees: Employee[] = []
) {
    const clientMap = Object.fromEntries(
        clients.map((c) => [buildId(c), `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()])
    );
    const empMap = Object.fromEntries(
        employees.map((e) => [buildId(e), `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()])
    );

    const rows = projects.map((p) => {
        const clientKey = String((p as any).clientId ?? (p as any).client ?? "");
        return {
            Nombre: p.name,
            Cliente: clientMap[clientKey] ?? clientKey, // usa nombre si lo encuentra
            Dirección: p.address,
            Categoría: p.category,
            Presupuesto: p.budget,
            "Fecha inicio": p.startDate,
            "Fecha límite": p.dueDate,
            "Fecha cierre": p.endDate ?? "",
            Estado: p.status,
            Progreso: p.progress,
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
