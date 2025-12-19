import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bath, BedDouble } from "lucide-react";
import { House } from "../types";
import { LucideIcon } from "lucide-react";

interface HouseCardProps {
  house: House;
  onDetailsClick: (houseId: string) => () => void;
  amenitiesIconMap: Record<string, LucideIcon>;
}

export const HouseCard = ({ house, onDetailsClick, amenitiesIconMap }: HouseCardProps) => {
  return (
    <Card
      className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl card-container house-card h-full"
    >
      <div className="relative overflow-hidden">
        <img
          src={`${
            import.meta.env.VITE_API_BASE_URL 
          }/${house.images?.[0] || "placeholder-house.jpg"}`}
          alt={house.title || "Image logement"}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors uppercase mb-4">
          {house.title}
        </h3>
        {/* Amenities with icons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {house.amenities.slice(0, 5).map((amenity) => {
            const Icon = amenitiesIconMap[amenity];
            return (
              <Badge
                key={amenity}
                variant="outline"
                className="amenity-badge px-3 py-1 text-sm capitalize flex items-center gap-1"
              >
                {Icon && (
                  <Icon className="w-4 h-4 text-yellow-600" />
                )}
                <span>{amenity}</span>
              </Badge>
            );
          })}
          {house.amenities.length === 0 && (
            <span className="text-gray-500/80 text-xs">
              Aucun équipement renseigné
            </span>
          )}
        </div>
        {/* Location, Rooms, Bathrooms */}
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">{house.location}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <BedDouble className="w-5 h-5" />
            <span>{house.numberOfRooms}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Bath className="w-5 h-5" />
            <span>{house.numberOfBathrooms}</span>
          </div>
        </div>
        {/* Price and Details Button */}
        <div className="flex justify-between items-center border-t pt-4">
          <Button
            className="rounded-full px-6 hover-button"
            onClick={onDetailsClick(house._id)}
          >
            Détails
          </Button>
          <div className="text-xl font-semibold bg-gradient-to-r from-yellow-600 to-yellow-400 text-transparent bg-clip-text ml-4">
            {house.price && house.price.length > 0
              ? `${house.price[0].price} TND`
              : "Prix N/A"}
            <span className="text-xs text-gray-500 ml-1">
              {" "}
              / par semaine
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
