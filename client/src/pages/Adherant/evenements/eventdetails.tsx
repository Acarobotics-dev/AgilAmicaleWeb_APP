import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, ArrowLeft } from "lucide-react";
import { Event, ParticipantData } from "./types";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { AddBookingService, getAllEvents } from "@/services";
import { BadgeEuro, User, Gift, CheckCircle2 } from "lucide-react";
import { MapPin, Calendar, Clock, Users as UsersIcon, User as UserIcon, Bus, BedDouble, Building2, Dumbbell, Flag, Briefcase, Map as MapIcon, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-toastify";

// Reusable components
const ImageCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const [expandedImg, setExpandedImg] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-0">
        {images.length > 0 ? (
          <div className="w-full relative">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img, idx) => (
                  <CarouselItem key={idx}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/${img}`}
                          alt={`${title} - ${idx + 1}`}
                          className="w-full h-[220px] sm:h-[350px] md:h-[500px] object-cover rounded-lg transition-transform duration-500 hover:scale-105 cursor-pointer"
                          style={{ objectPosition: "center" }}
                          onClick={() => setExpandedImg(`${import.meta.env.VITE_API_BASE_URL}/${img}`)}
                        />
                      </DialogTrigger>
                      <DialogContent className="p-0 bg-transparent border-none flex items-center justify-center">
                        <DialogTitle className="sr-only">Vue agrandie de l'image</DialogTitle>
                        <DialogDescription className="sr-only">{title} - Photo {idx + 1}</DialogDescription>
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/${img}`}
                          alt={`${title} - ${idx + 1}`}
                          className="max-h-[90vh] max-w-[98vw] sm:max-w-[90vw] rounded-lg shadow-lg"
                          style={{ objectFit: "contain" }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
            <div className="absolute bottom-2 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              {images.length} photo{images.length > 1 ? "s" : ""}
            </div>
          </div>
        ) : (
          <div className="w-full h-[220px] sm:h-[350px] md:h-[500px] flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <X className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-gray-500/80">Aucune image disponible</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EventDescription = ({ description }: { description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">À propos de cet événement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
        {description || (
          <span className="italic text-gray-500/80">Aucune description fournie.</span>
        )}
      </p>
    </CardContent>
  </Card>
);

const DetailItem = ({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
    <div>
      <span className="font-semibold">{label}:</span> {value}
    </div>
  </div>
);

const EventTypeDetails = ({ event }: { event: Event }) => {
  const renderTravelDetails = () => (
    <>
      {"destination" in event && event.destination && (
        <DetailItem icon={MapPin} label="Destination" value={event.destination} />
      )}
      {"departureCity" in event && (
        <DetailItem icon={MapPin} label="Ville de départ" value={event.departureCity} />
      )}
      {"transportType" in event && (
        <DetailItem icon={Bus} label="Transport" value={event.transportType} />
      )}
      {"accommodation" in event && (
        <DetailItem icon={BedDouble} label="Hébergement" value={event.accommodation} />
      )}
    </>
  );

  const renderExcursionDetails = () => (
    <>
      {"destination" in event && event.destination && (
        <DetailItem icon={MapPin} label="Destination" value={event.destination} />
      )}
      {"durationHours" in event && (
        <DetailItem icon={Clock} label="Durée" value={`${event.durationHours} heures`} />
      )}
      {"meetingPoint" in event && (
        <DetailItem icon={MapPin} label="Point de rendez-vous" value={event.meetingPoint} />
      )}
      {"meetingTime" in event && (
        <DetailItem icon={Clock} label="Heure de rendez-vous" value={event.meetingTime} />
      )}
      {"equipmentRequired" in event && event.equipmentRequired?.length > 0 && (
        <DetailItem
          icon={Dumbbell}
          label="Équipement requis"
          value={
            <ul className="list-disc ml-4 mt-1">
              {event.equipmentRequired.map((eq, i) => (
                <li key={i}>{eq}</li>
              ))}
            </ul>
          }
        />
      )}
    </>
  );

  const renderClubDetails = () => (
    <>
      {"adresseclub" in event && (
        <DetailItem icon={MapPin} label="Adresse du club" value={event.adresseclub} />
      )}
      {"categoryclub" in event && (
        <DetailItem icon={Building2} label="Catégorie" value={event.categoryclub} />
      )}
      {"ageGroup" in event && (
        <DetailItem icon={UsersIcon} label="Tranche d'âge" value={event.ageGroup} />
      )}
      {"schedule" in event && event.schedule?.length > 0 && (
        <DetailItem
          icon={Clock}
          label="Horaires"
          value={
            <ul className="list-disc ml-4 mt-1">
              {event.schedule.map((sch, i) => (
                <li key={i}>
                  {sch.day ? new Date(sch.day).toLocaleDateString("fr-FR") : "Non spécifié"}:{" "}
                  {sch.time.startTime} - {sch.time.endTime}
                </li>
              ))}
            </ul>
          }
        />
      )}
    </>
  );

  const renderActivityDetails = () => (
    <>
      {"sportType" in event && (
        <DetailItem icon={Dumbbell} label="Type de sport" value={event.sportType} />
      )}
      {"durationMinutes" in event && (
        <DetailItem icon={Clock} label="Durée" value={`${event.durationMinutes} minutes`} />
      )}
      {"location" in event && (
        <DetailItem icon={MapIcon} label="Lieu" value={event.location} />
      )}
      {"equipmentProvided" in event && event.equipmentProvided?.length > 0 && (
        <DetailItem
          icon={Dumbbell}
          label="Équipement fourni"
          value={
            <ul className="list-disc ml-4 mt-1">
              {event.equipmentProvided.map((eq, i) => (
                <li key={i}>{eq}</li>
              ))}
            </ul>
          }
        />
      )}
    </>
  );

  const renderEventDetails = () => (
    <>
      {"eventTime" in event && (
        <DetailItem icon={Clock} label="Heure" value={event.eventTime} />
      )}
      {"organizer" in event && (
        <DetailItem icon={Briefcase} label="Organisateur" value={event.organizer} />
      )}
      {"location" in event && (
        <DetailItem icon={MapIcon} label="Lieu" value={event.location} />
      )}
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Informations complémentaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-gray-900/90">
          {event.type === "Voyage" && renderTravelDetails()}
          {event.type === "Excursion" && renderExcursionDetails()}
          {event.type === "Club" && renderClubDetails()}
          {event.type === "Activité" && renderActivityDetails()}
          {event.type === "Évènement" && renderEventDetails()}

          {/* Common fields */}
          <DetailItem
            icon={Calendar}
            label="Date de début"
            value={event.startDate ? new Date(event.startDate).toLocaleDateString("fr-FR") : "Non spécifié"}
          />
          <DetailItem
            icon={Calendar}
            label="Date de fin"
            value={event.endDate ? new Date(event.endDate).toLocaleDateString("fr-FR") : "Non spécifié"}
          />
          {typeof event.maxParticipants === "number" && (
            <DetailItem icon={UsersIcon} label="Nombre maximum de participants" value={event.maxParticipants} />
          )}
          {typeof event.currentParticipants === "number" && (
            <DetailItem icon={UserIcon} label="Participants inscrits" value={event.currentParticipants} />
          )}
          {typeof (event as any).numberOfCompanions === "number" && (
            <DetailItem icon={UsersIcon} label="Nombre d'accompagnants" value={(event as any).numberOfCompanions} />
          )}
          {typeof (event as any).numberOfChildren === "number" && (
            <DetailItem icon={UserIcon} label="Nombre d'enfants" value={(event as any).numberOfChildren} />
          )}
          {event.isActive !== undefined && (
            <DetailItem
              icon={CheckCircle2}
              label="Statut"
              value={
                event.isActive ? (
                  <span className="text-green-600 font-bold">Actif</span>
                ) : (
                  <span className="text-red-600 font-bold">Inactif</span>
                )
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PricingCard = ({ event }: { event: Event }) => {
  // Use basePrice directly or fallback to pricing (compatibility)
  const basePrice = event.basePrice;

  const companionPrice = event.cojoinPrice;
  const kidPrice = event.childPrice;

  return (
    <Card className="mb-6 lg:mb-0">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <BadgeEuro className="w-5 h-5 text-yellow-600" />
          Tarifs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BadgeEuro className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">Prix d'adherent :</span>
            <span className="ml-auto">{basePrice || "N/A"} DT</span>
          </div>
          {event.cojoinPresence && companionPrice !== undefined && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">Prix accompagnant :</span>
              <span className="ml-auto">{companionPrice} DT</span>
            </div>
          )}
          {event.childPresence && kidPrice !== undefined && (
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">Prix enfant :</span>
              <span className="ml-auto">{kidPrice} DT</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ParticipantInformationCard = ({
  event,
  childrenData,
  setChildrenData,
  companionsData,
  setCompanionsData
}: {
  event: Event;
  childrenData: ParticipantData[];
  setChildrenData: React.Dispatch<React.SetStateAction<ParticipantData[]>>;
  companionsData: ParticipantData[];
  setCompanionsData: React.Dispatch<React.SetStateAction<ParticipantData[]>>;
}) => {
  if (!event.childPresence && !event.cojoinPresence) return null;

  const addChild = () => {
    setChildrenData([...childrenData, { firstName: "", lastName: "", age: null }]);
  };

  const removeChild = (index: number) => {
    setChildrenData(childrenData.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof ParticipantData, value: string | number | null) => {
    const newChildren = [...childrenData];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildrenData(newChildren);
  };

  const addCompanion = () => {
    setCompanionsData([...companionsData, { firstName: "", lastName: "", age: null }]);
  };

  const removeCompanion = (index: number) => {
    setCompanionsData(companionsData.filter((_, i) => i !== index));
  };

  const updateCompanion = (index: number, field: keyof ParticipantData, value: string | number | null) => {
    const newCompanions = [...companionsData];
    newCompanions[index] = { ...newCompanions[index], [field]: value };
    setCompanionsData(newCompanions);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          Informations Participants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600 italic">
          Vous pouvez ajouter plusieurs participants pour chaque catégorie.
        </p>

        {event.childPresence && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-600" />
                Enfants ({childrenData.length})
              </h4>
              <Button onClick={addChild} size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </div>

            {childrenData.length === 0 && (
              <p className="text-xs text-gray-500 italic">Aucun enfant ajouté.</p>
            )}

            <div className="space-y-4">
              {childrenData.map((child, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg relative group">
                  <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeChild(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-xs font-medium text-gray-500 mb-1">Enfant {index + 1}</span>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Prénom"
                    value={child.firstName}
                    onChange={e => updateChild(index, "firstName", e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Nom"
                    value={child.lastName}
                    onChange={e => updateChild(index, "lastName", e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Âge"
                    value={child.age ?? ''}
                    onChange={e => updateChild(index, "age", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {event.cojoinPresence && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-600" />
                Accompagnants ({companionsData.length})
              </h4>
              <Button onClick={addCompanion} size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </div>

            {companionsData.length === 0 && (
              <p className="text-xs text-gray-500 italic">Aucun accompagnant ajouté.</p>
            )}

            <div className="space-y-4">
              {companionsData.map((companion, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg relative group">
                  <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeCompanion(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-xs font-medium text-gray-500 mb-1">Accompagnant {index + 1}</span>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Prénom"
                    value={companion.firstName}
                    onChange={e => updateCompanion(index, "firstName", e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Nom"
                    value={companion.lastName}
                    onChange={e => updateCompanion(index, "lastName", e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Âge"
                    value={companion.age ?? ''}
                    onChange={e => updateCompanion(index, "age", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const IncludesCard = ({ includes }: { includes: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        Inclus
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-1">
        {includes.map((inc, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">{inc}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// Main component
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  // Assign eventDate based on event type and event fields
  const eventDate = useMemo(() => {
    if (!event) return { start: null, end: null };
    return {
      start: event.startDate ? new Date(event.startDate) : null,
      end: event.endDate ? new Date(event.endDate) : null,
    };
  }, [event]);

  const handleEventBooking = useCallback(async () => {
    if (!event || !auth?.user?._id) {
      toast.error("Impossible de réserver cet événement.");
      return;
    }

    try {
      const result = await AddBookingService(auth.user._id, event._id, event.type, eventDate, undefined);

      if (result.success) {
        toast.success("Réservation effectuée avec succès !");
        setTimeout(() => navigate("/evenements"), 1200);
      } else {
        const error = result.error!;
        let userMessage = error.message;

        switch (error.errorType) {
          case "overlapping_booking":
            userMessage = "Vous avez déjà une réservation pour cette période.";
            break;
          case "invalid_period":
            userMessage = "La période sélectionnée n'est pas valide.";
            break;
          case "network_error":
            userMessage = "Problème de connexion. Veuillez vérifier votre internet.";
            break;
          case "duplicate_event_booking": // Handle duplicate booking error
            userMessage = "Vous avez déjà réservé cet évènement.";
            break;
          default:
            userMessage = "Une erreur inattendue s'est produite.";
        }

        toast.error(userMessage, { autoClose: 10000 });
        console.error("Booking error details:", error);
      }
    } catch (err) {
      console.error("Erreur lors de la réservation :", err);
      toast.error("Une erreur s'est produite lors de la réservation.");
    }
  }, [auth?.user?._id, event, eventDate, navigate]);

  // Participants form fields (Arrays)
  const [childrenData, setChildrenData] = useState<ParticipantData[]>([]);
  const [companionsData, setCompanionsData] = useState<ParticipantData[]>([]);

  const submitParticipantsAndBook = async () => {
    if (!auth?.user?._id || !event) return;

    const participants: any[] = [];

    // Validate children
    if (event.childPresence) {
      for (const child of childrenData) {
        if (!child.firstName || !child.lastName || child.age === null) {
          toast.error("Veuillez remplir tous les champs pour chaque enfant.");
          return;
        }
        participants.push({ ...child, type: 'child' });
      }
    }

    // Validate companions
    if (event.cojoinPresence) {
      for (const companion of companionsData) {
        if (!companion.firstName || !companion.lastName || companion.age === null) {
          toast.error("Veuillez remplir tous les champs pour chaque accompagnant.");
          return;
        }
        participants.push({ ...companion, type: 'cojoint' });
      }
    }

    // Ensure at least one participant is added if the user intended to add participants but left list empty?
    // Actually, maybe they just want to book for themselves even if childPresence is true but they have no kids.
    // So empty lists are valid if they don't click "Add". But if they added a row, they must fill it.
    // The UI handles adding rows, so if length > 0, we validate content.
    // The validation above covers it.

    try {
      const result = await AddBookingService(auth.user._id, event._id, event.type, eventDate, participants);
      if (result.success) {
        toast.success("Réservation effectuée avec succès !");
        setTimeout(() => navigate("/evenements"), 1200);
      } else {
        const error = result.error!;
        let userMessage = error.message;

        switch (error.errorType) {
          case "overlapping_booking":
            userMessage = "Vous avez déjà une réservation pour cette période.";
            break;
          case "invalid_period":
            userMessage = "La période sélectionnée n'est pas valide.";
            break;
          case "network_error":
            userMessage = "Problème de connexion. Veuillez vérifier votre internet.";
            break;
          case "duplicate_event_booking": // Handle duplicate booking error
            userMessage = "Vous êtes déjà inscrit à cet événement.";
            break;
          default:
            userMessage = error.message || "Une erreur inattendue s'est produite.";
        }

        // If it's a 409 conflict, also show standard message if type unknown but usually redundant
        toast.error(userMessage, { autoClose: 8000 });
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue.");
    }
  };

  useEffect(() => {
    const fetchEventDetails = async (eventId: string | undefined) => {
      try {
        const response = await getAllEvents();
        const found = response.data.find((e: Event) => e._id === eventId);
        setEvent(found || null);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'événement :", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails(id);
  }, [id]);

  const eventHeader = useMemo(() => {
    if (!event) return null;

    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/evenements")}
              className="mb-4 -ml-2 sm:-ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-500">
              {event.type && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                  {event.type}
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${event.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
              >
                {event.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [event, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <TailChase size={48} color="#fbbf24" />
        <span className="mt-4 text-lg text-gray-500">Chargement de l'événement...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h1>
          <Button onClick={() => navigate("/evenements")}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {eventHeader}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <ImageCarousel images={event.images || []} title={event.title} />
            <EventDescription description={event.description || ""} />
            <EventTypeDetails event={event} />
          </div>

          {/* Aside Bar */}
          <div className="space-y-6">
            <Card className="mb-4 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-center">Réserver cet événement</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-base sm:text-lg font-semibold h-12"
                  onClick={
                    event.childPresence || event.cojoinPresence
                      ? submitParticipantsAndBook
                      : handleEventBooking
                  }
                >
                  Participer
                </Button>
              </CardContent>
            </Card>

            {((event as any).pricing || event.basePrice) && <PricingCard event={event} />}

            <ParticipantInformationCard
              event={event}
              childrenData={childrenData}
              setChildrenData={setChildrenData}
              companionsData={companionsData}
              setCompanionsData={setCompanionsData}
            />

            {event.includes && event.includes.length > 0 && <IncludesCard includes={event.includes} />}
          </div>
        </div>
      </div>
    </div>
  );
}