import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  Waves,
  Bath,
  Sofa,
  ThermometerSun,
  Tv,
  Boxes,
  Laptop,
  TreeDeciduous,
  PanelsTopLeft,
  Columns4,
  Table,
  DoorOpen,
  ParkingCircle,
  Camera,
  Fence,
} from "lucide-react";

const AMENITIES_OPTIONS = [
  { label: "Entièrement meublé", icon: Sofa },
  { label: "Climatisation / Chauffage", icon: ThermometerSun },
  { label: "Télévision intelligente", icon: Tv },
  { label: "Internet / Wi-Fi", icon: Wifi },
  { label: "Placards intégrés / Rangements", icon: Boxes },
  { label: "Bureau / Espace de télétravail", icon: Laptop },
  { label: "Baignoire / Douche à l'italienne", icon: Bath },
  { label: "Jardin privé", icon: TreeDeciduous },
  { label: "Balcon / Terrasse", icon: PanelsTopLeft },
  { label: "Espace barbecue", icon: Columns4 },
  { label: "Piscine", icon: Waves },
  { label: "Coin repas / salon extérieur", icon: Table },
  { label: "Entrée privée", icon: DoorOpen },
  { label: "Garage / Parking couvert", icon: ParkingCircle },
  { label: "Propriété clôturée", icon: Fence },
  { label: "Système de sécurité / Caméras", icon: Camera },
];

interface AmenitiesSectionProps {
  amenities: string[];
}

export default function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Équipements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(amenities) && amenities.length > 0 ? (
            AMENITIES_OPTIONS.filter((opt) =>
              amenities.includes(opt.label)
            ).map(({ label, icon: Icon }) => (
              <Badge
                key={label}
                className="flex items-center text-gray-500 hover:text-white gap-2 px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 border border-gray-200"
              >
                {Icon && <Icon className="w-4 h-4 text-amber-600" />}
                <span className="capitalize">{label}</span>
              </Badge>
            ))
          ) : (
            <span className="text-gray-500">Aucun équipement renseigné.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
