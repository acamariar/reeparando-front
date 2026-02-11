export type Client = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    dni: string;
    notes?: string;
    createdAt: string; // ISO yyyy-mm-dd
    referenceMedium: string;
    generatedSale: string;
};
