export type ProjectCategory = "impermeabilizacion" | "refaccion" | "puesto de Trabajo" | "pintura";
export type ProjectStatus = "En Progreso" | "Completado" | "Pendiente" | "Atrasado";
export type Project = {
    id: string;
    name: string;
    client: string;
    address: string;
    status: ProjectStatus;
    progress: number;         // 0–100
    dueDate: string;          // ISO yyyy-mm-dd
    budget: number;
    category: ProjectCategory;
    description: string;
    team: string[];           // iniciales o ids
}