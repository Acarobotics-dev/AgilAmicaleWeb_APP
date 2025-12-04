import z from "zod";

export const houseFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  description: z.string().min(1, "La description est requise"),
  location: z.string().min(1, "La localisation est requise"),
  numberOfRooms: z.number({
    required_error: "Le nombre de chambres est requis",
    invalid_type_error: "Doit être un nombre",
  }).positive("Le nombre de chambres doit être positif"),
  numberOfBathrooms: z.number({
    required_error: "Le nombre de salles de bain est requis",
    invalid_type_error: "Doit être un nombre",
  }).positive("Le nombre de salles de bain doit être positif"),
 
  unavailableDates: z.array(z.date()).optional(),
 images: z.array(z.string()).optional(),
  amenities: z.string().refine(
    (val) => val.split(",").length > 0,
    "Au moins un équipement doit être sélectionné"
  ),
})
