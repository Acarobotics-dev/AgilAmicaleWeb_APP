import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X, ArrowLeft } from "lucide-react";
import { Event } from "./types";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { AddBookingService, getAllEvents } from "@/services";
import { BadgeEuro, User, Gift, CheckCircle2 } from "lucide-react";
import { MapPin, Calendar, Clock, Users as UsersIcon, User as UserIcon, Bus, BedDouble, Building2, Dumbbell, Flag, Briefcase, Map as MapIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

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

const PricingCard = ({ pricing }: { pricing: Event["pricing"] }) => (
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
          <span className="ml-auto">{pricing?.basePrice || "N/A"} DT</span>
        </div>
        {pricing?.cojoinPrice && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">Prix accompagnant :</span>
            <span className="ml-auto">{pricing.cojoinPrice} DT</span>
          </div>
        )}
        {pricing?.childPrice && (
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">Prix enfant :</span>
            <span className="ml-auto">{pricing.childPrice} DT</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

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
      const result = await AddBookingService(auth.user._id, event._id, event.type, eventDate);

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

        toast.error(userMessage, { duration: 10000 });
        console.error("Booking error details:", error);
      }
    } catch (err) {
      console.error("Erreur lors de la réservation :", err);
      toast.error("Une erreur s'est produite lors de la réservation.");
    }
  }, [auth?.user?._id, event, eventDate, navigate]);

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
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
                <CardTitle className="text-lg sm:text-xl text-center">Participer au {event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-base sm:text-lg font-semibold"
                  onClick={handleEventBooking}
                >
                  Participer
                </Button>
              </CardContent>
            </Card>

            {event.pricing && <PricingCard pricing={event.pricing} />}

            {event.includes && event.includes.length > 0 && <IncludesCard includes={event.includes} />}
          </div>
        </div>
      </div>
    </div>
  );
}