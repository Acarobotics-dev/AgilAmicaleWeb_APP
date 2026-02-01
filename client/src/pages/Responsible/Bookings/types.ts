export type BookingStatus = "en attente" | "confirmé" | "annulé" | "terminé";

export type ActivityCategory =
  | "Sejour Maison"
  | "Voyage"
  | "Excursion"
  | "Club"
  | "Évènement"
  | "Activité";

export type ActivityModel = "House" | "Event";

export interface BookingPeriod {
  start: string; // ISO date string
  end: string;   // ISO date string
}

export interface Booking {
  _id?: string;
  userId: string;
  activity: string; // ObjectId as string
  activityCategory: ActivityCategory;
  activityModel: ActivityModel;
  bookingPeriod?: BookingPeriod;
  status?: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}
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
export type House = {
  _id?: string;
  title: string;
  address: string;
  description: string;
  location: string;
  // Change price to match the backend: array of { week: string, price: number }
  price: { week: string; price: number }[];
  numberOfRooms: number;
  numberOfBathrooms: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  postedAt: string;
  availablePeriod: string[];
  unavailableDates: string[];
  activityType?: "House";
};
// types.ts
export type EventType =
  | "Voyage"
  | "Excursion"
  | "Club"
  | "Évènement"
  | "Activité";

export interface BaseEvent {
  _id?: string;
  title: string;
  type: EventType;
  description: string;
  images: string[];
  featuredPhoto?: string;
  pricing: number;
  cojoinPresence?: boolean;
  cojoinPrice?: number;
  childPresence?: boolean;
  childPrice?: number;
  includes?: string[];
  maxParticipants?: number;
  currentParticipants?: number;
  isActive?: boolean;
  startDate: Date;
  endDate: Date;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  activityType: "Event",
}

// Voyage
export interface VoyageEvent extends BaseEvent {
  type: "Voyage";
  destination?: string;
  departureCity: string;
  transportType: "Avion" | "Bus" | "Train" | "Bateau";
  accommodation: string;
}

// Excursion
export interface ExcursionEvent extends BaseEvent {
  type: "Excursion";
  destination?: string;
  durationHours: number;
  meetingPoint: string;
  meetingTime: string;
  equipmentRequired?: string[];
}

// Club
export interface ClubEvent extends BaseEvent {
  type: "Club";
  adresseclub: string;

  schedule: {
    day: Date;
    time: {
      startTime: string;
      endTime: string;
    };
  }[];
  categoryclub?: string;
  ageGroup?: "Enfants" | "Adolescents" | "Adultes" | "Tous";
}

// Activité
export interface ActiviteEvent extends BaseEvent {
  type: "Activité";
  activityTime: string;
  sportType: string;
  durationMinutes: number;
  location: string;
  equipmentProvided?: string[];
}

// Évènement
export interface EvenementEvent extends BaseEvent {
  type: "Évènement";
  eventTime: string;
  organizer: string;
  location: string;
}

// Union type for all events
export type Event =
  | VoyageEvent
  | ExcursionEvent
  | ClubEvent
  | ActiviteEvent
  | EvenementEvent;
