import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBookingService, getHouseByIdService } from "@/services";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { House } from "./types";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-toastify";
import AmenitiesSection from "./AmenitiesSection";
import GallerySection from "./GallerySection";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Calendar,
  Map,
} from "lucide-react";

export default function HouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedImg, setExpandedImg] = useState<string | null>(null);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number | null>(null);
  const { auth } = useAuth();
  const [activityCategory] = useState("Sejour Maison");

  useEffect(() => {
    const fetchHouseDetails = async (houseId: string | undefined) => {
      try {
        if (houseId) {
          const response = await getHouseByIdService(houseId);
          setHouse(response.data);
        }
      } catch (error) {
        console.error("Error fetching house details:", error);
        setHouse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHouseDetails(id);
  }, [id]);

  const handleBooking = useCallback(async () => {
    if (selectedPeriodIndex === null || !house) {
      toast.error("Veuillez sélectionner une période valide");
      return;
    }

    const selectedPeriod = house.price[selectedPeriodIndex];
    const result = await AddBookingService(
      auth.user._id,
      house._id,
      activityCategory,
      {
        start: new Date(selectedPeriod.week.startdate),
        end: new Date(selectedPeriod.week.endDate)
      }
    );

    if (result.success) {
      toast.success("Réservation effectuée avec succès !");
      setTimeout(() => navigate("/activities"), 1200);
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
        case "house_unavailable":
          userMessage = "Cette maison n'est pas disponible pour les dates sélectionnées.";
          break;
        default:
          userMessage = "Une erreur inattendue s'est produite.";
      }

      toast.error(userMessage, { autoClose: 10000 });
      console.error("Booking error details:", error);
    }
  }, [auth, house, activityCategory, selectedPeriodIndex, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <TailChase size={48} color="#fbbf24" />
        <span className="mt-4 text-lg text-gray-500">
          Chargement du logement...
        </span>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Maison non trouvée
          </h1>
          <Button onClick={() => navigate("/activities")}>Retour</Button>
        </div>
      </div>
    );
  }

  // Format available period for top display
  const availablePeriodText = (house.availablePeriod && house.availablePeriod.length === 2)
    ? `Période disponible : ${new Date(house.availablePeriod[0]).toLocaleDateString('fr-FR')} - ${new Date(house.availablePeriod[1]).toLocaleDateString('fr-FR')}`
    : 'Période non spécifiée';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/activities")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {house.title}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 text-gray-500">
              <div className="flex items-center">
                <Map className="w-4 h-4 mr-1" />
                <span className="truncate">{house.location}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{house.address}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>{availablePeriodText}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <GallerySection
              images={house.images}
              title={house.title}
              expandedImg={expandedImg}
              setExpandedImg={setExpandedImg}
            />

            {/* Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  À propos de cette maison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 leading-relaxed">
                  {house.description || (
                    <span className="italic text-gray-500/80">
                      Aucune description fournie.
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <AmenitiesSection amenities={house.amenities} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room and Bathroom Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Détails du logement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-gray-900/90">
                    <BedDouble className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">
                      {house.numberOfRooms ?? 0} chambre
                      {house.numberOfRooms > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900/90">
                    <Bath className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">
                      {house.numberOfBathrooms ?? 0} salle de bain
                      {house.numberOfBathrooms > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Section */}
            <Card className="sticky top-20 shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-t-lg pb-4">
                <CardTitle className="text-center text-lg font-semibold text-amber-800">
                  <Calendar className="w-5 h-5 inline-block mr-2" />
                  Réserver
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900/90">
                    Sélectionnez une période :
                  </p>

                  {house.price && house.price.length > 0 ? (
                    <div className="space-y-2">
                      {house.price.map((period, index) => (
                        <label
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedPeriodIndex === index
                            ? "bg-amber-500 text-white border-amber-500 shadow-md"
                            : "bg-white text-gray-900/90 border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                            }`}
                        >
                          <input
                            type="radio"
                            name="bookingPeriod"
                            className="form-radio h-5 w-5 text-amber-500 mt-0.5"
                            checked={selectedPeriodIndex === index}
                            onChange={() => setSelectedPeriodIndex(index)}
                          />
                          <span className="text-sm">
                            {`Du ${new Date(period.week.startdate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )} au ${new Date(period.week.endDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )} - ${period.price} TND`}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2 text-center">
                      Aucune période disponible pour le moment.
                    </p>
                  )}
                </div>

                {selectedPeriodIndex !== null && house.price && (
                  <div className="text-center text-sm text-amber-700 font-medium p-2 bg-amber-100 rounded">
                    {`Période sélectionnée : Du ${new Date(
                      house.price[selectedPeriodIndex].week.startdate
                    ).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                    })} au ${new Date(
                      house.price[selectedPeriodIndex].week.endDate
                    ).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}`}
                  </div>
                )}

                <Button
                  aria-label="Réserver maintenant"
                  variant="default"
                  className="w-full font-semibold bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBooking}
                  disabled={selectedPeriodIndex === null || !house.price || house.price.length === 0}
                >
                  Réserver maintenant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}