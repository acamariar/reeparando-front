export type ProjectCategory = "impermeabilizacion" | "refaccion" | "puesto de Trabajo" | "pintura";
export type ProjectStatus = "EN_PROGRESO" | "FINALIZADA" | "ATRASADA" | "GARANTIA";

export type Project = {
    id: string;
    name: string;
    client: string;
    address: string;       // 0–100
    dueDate: string;          // ISO yyyy-mm-dd
    budget: number;
    category: ProjectCategory;
    description: string;
    team: string[];           // iniciales o ids
    status: ProjectStatus;
    progress: number;
    startDate: string;
    endDate?: string;
}