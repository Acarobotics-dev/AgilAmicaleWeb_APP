import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface GallerySectionProps {
  images: string[];
  title: string;
  expandedImg: string | null;
  setExpandedImg: Dispatch<SetStateAction<string | null>>;
}

export default function GallerySection({
  images,
  title,
  expandedImg,
  setExpandedImg,
}: GallerySectionProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {Array.isArray(images) && images.length > 0 ? (
          <div className="w-full relative">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img: string, idx: number) => (
                  <CarouselItem key={idx}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/${img}`}
                          alt={`${title} - ${idx + 1}`}
                          className="w-full h-[220px] sm:h-[350px] md:h-[500px] object-cover rounded-lg transition-transform duration-500 hover:scale-105 cursor-pointer"
                          style={{ objectPosition: "center" }}
                          onClick={() =>
                            setExpandedImg(
                              `${import.meta.env.VITE_API_BASE_URL}/${img}`
                            )
                          }
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
}
