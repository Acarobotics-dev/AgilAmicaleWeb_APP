import * as z from "zod"

export const eventFormSchema = z.object({
  // Common fields - required
  title: z.string().min(1, "Le titre est requis").max(100, "Le titre ne peut pas dépasser 100 caractères"),
  type: z.enum(["Voyage", "Excursion", "Club", "Activité", "Évènement"], {
    required_error: "Le type d'activité est requis",
  }),
  description: z.string().min(1, "La description est requise").max(2000, "La description ne peut pas dépasser 2000 caractères"),

  // Dates - required by backend logic
  startDate: z.date({
    required_error: "La date de début est requise",
    invalid_type_error: "Format de date invalide"
  }),
  endDate: z.date({
    required_error: "La date de fin est requise",
    invalid_type_error: "Format de date invalide"
  }),

  // Pricing - required by backend model
  basePrice: z.string()
    .min(1, "Le prix est obligatoire")
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Le prix doit être un nombre positif"),
  cojoinPresence: z.boolean().default(false),
  cojoinPrice: z.string().optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Le prix doit être un nombre positif"),
  childPresence: z.boolean().default(false),
  childPrice: z.string().optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Le prix doit être un nombre positif"),

  // Participants
  maxParticipants: z.string().optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 1), "La capacité doit être au moins 1"),
  currentParticipants: z.string().optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Le nombre de participants ne peut pas être négatif"),
  companionsCount: z.string().optional(),
  childrenCount: z.string().optional(),

  // Status flags
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Arrays/Lists
  includes: z.string().optional(),
  images: z.array(z.any()).optional(),
  featuredPhoto: z.string().optional(),

  // Type-specific fields - Voyage
  destination: z.string().optional(),
  departureCity: z.string().optional(),
  transportType: z.string().optional(),
  accommodation: z.string().optional(),

  // Type-specific fields - Excursion
  duration: z.string().optional(),
  meetingPoint: z.string().optional(),
  meetingTime: z.string().optional(),
  equipmentRequired: z.string().optional(),

  // Type-specific fields - Club
  clubAddress: z.string().optional(),
  clubCategory: z.string().optional(),
  ageGroup: z.string().optional(),

  // Type-specific fields - Activité
  sportType: z.string().optional(),
  location: z.string().optional(),
  equipmentProvided: z.string().optional(),

  // Type-specific fields - Évènement
  eventTime: z.string().optional(),
  organizer: z.string().optional(),
  program: z.string().optional(),
}).superRefine((data, ctx) => {
  // 1. Date range validation
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "La date de fin doit être après la date de début",
    })
  }

  // 2. Conditional Pricing Validation
  if (data.cojoinPresence && (!data.cojoinPrice || data.cojoinPrice.trim() === "")) {
    ctx.addIssue({
      code: "custom",
      path: ["cojoinPrice"],
      message: "Le prix conjoint est obligatoire si la présence est activée",
    })
  }
  if (data.childPresence && (!data.childPrice || data.childPrice.trim() === "")) {
    ctx.addIssue({
      code: "custom",
      path: ["childPrice"],
      message: "Le prix enfant est obligatoire si la présence est activée",
    })
  }

  // 3. Type-specific required field validation based on backend schema
  if (data.type === "Voyage") {
    if (!data.departureCity || data.departureCity.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["departureCity"],
        message: "La ville de départ est requise pour un voyage",
      })
    }
    if (!data.transportType || data.transportType.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["transportType"],
        message: "Le type de transport est requis pour un voyage",
      })
    }
    if (!data.accommodation || data.accommodation.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["accommodation"],
        message: "L'hébergement est requis pour un voyage",
      })
    }
  }

  if (data.type === "Excursion") {
    if (!data.duration || data.duration.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["duration"],
        message: "La durée est requise pour une excursion",
      })
    }
    if (!data.meetingPoint || data.meetingPoint.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["meetingPoint"],
        message: "Le point de rencontre est requis pour une excursion",
      })
    }
    if (!data.meetingTime || data.meetingTime.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["meetingTime"],
        message: "L'heure de rencontre est requise pour une excursion",
      })
    }
  }

  if (data.type === "Club") {
    if (!data.clubAddress || data.clubAddress.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["clubAddress"],
        message: "L'adresse du club est requise",
      })
    }
  }

  if (data.type === "Activité") {
    if (!data.sportType || data.sportType.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["sportType"],
        message: "Le type de sport est requis pour une activité",
      })
    }
    if (!data.duration || data.duration.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["duration"],
        message: "La durée est requise pour une activité",
      })
    }
    if (!data.location || data.location.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "Le lieu est requis pour une activité",
      })
    }
  }

  if (data.type === "Évènement") {
    if (!data.eventTime || data.eventTime.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["eventTime"],
        message: "L'heure de l'événement est requise",
      })
    }
    if (!data.organizer || data.organizer.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["organizer"],
        message: "L'organisateur est requis pour un événement",
      })
    }
    if (!data.location || data.location.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "Le lieu est requis pour un événement",
      })
    }
  }
})

export type EventFormValues = z.infer<typeof eventFormSchema>
