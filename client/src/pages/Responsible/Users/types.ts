export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone?: string; // Made optional to align with schema
  matricule: string;
  status: "En Attente" | "Approuvé" | "Refusé";
  role: "adherent" | "responsable";
  password?: string; // Made optional to align with schema
}