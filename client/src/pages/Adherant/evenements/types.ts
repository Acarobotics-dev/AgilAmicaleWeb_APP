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
  startDate: Date; // Universal start date
  endDate: Date; // Universal end date
  pricing: {
    basePrice: number;
    cojoinPrice?: number;
    childPrice?: number;
  };
  includes?: string[];
  maxParticipants?: number;
  currentParticipants?: number;
  numberOfCompanions?: number; // Number of accompanying adults
  numberOfChildren?: number; // Number of children
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  durationHours: string;
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
  sportType: string;
  durationMinutes: string;
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

