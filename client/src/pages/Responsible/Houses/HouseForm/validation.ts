import * as z from "zod";

export const houseFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  description: z.string().min(1, "La description est requise"),
  location: z.string().min(1, "La localisation est requise"),
  numberOfRooms: z.number().positive("Le nombre de chambres doit être positif"),
  numberOfBathrooms: z.number().positive("Le nombre de salles de bain doit être positif"),

});



export const priceValidation = z.object({

  price: z.number().positive("Le prix doit être positif"),
});

export type HouseFormValues = z.infer<typeof houseFormSchema>;
