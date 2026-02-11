// src/types/employee.ts
export type EmployeeStatus = "activo" | "inactivo";

export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;           // ISO yyyy-mm-dd
    address: string;             // domicilio actual
    addressProof: string;        // “dni”, “servicio”, “otro” (lo que uses para registrar)
    criminalRecord: string;      // “presentado”, “pendiente”, etc.

    email: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;

    alias?: string;              // ALIAS
    cbu?: string;                // CBU

    specialty: string;           // área de mantenimiento/reparaciones
    coverageAreas: string[];     // zonas a cubrir
    availability: string;        // disponibilidad horaria (texto)

    shirtSize?: "XS" | "S" | "M" | "L" | "XL" | "XXL";
    shoeSize?: string;

    status: EmployeeStatus;
    startDate?: string;          // ISO yyyy-mm-dd
    hourlyRate?: number;
    saldoActual: number;
};
