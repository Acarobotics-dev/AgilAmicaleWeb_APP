import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, CalendarDays, FileText, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface Convention {
  _id: string;
  title: string;
  imagePath: string;
  description: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export const ConventionCard = ({ convention }: { convention: Convention }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 rounded-t-lg overflow-hidden">
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}/${convention.imagePath}`} // Update with your backend URL
          alt={convention.title}
          className="w-full aspect-video object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
        />
      </CardHeader>
      <CardContent className="pt-4 pb-5 space-y-3">
        <Badge variant="outline">Convention</Badge>
        <h3 className="text-xl font-semibold tracking-tight uppercase">{convention.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3">{convention.description}</p>
        <div className="pt-2 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${convention.filePath}`, "_blank")}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger le PDF
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Détail Convention
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-yellow-600" />
                  <DialogTitle className="text-2xl uppercase">{convention.title}</DialogTitle>
                </div>
                <DialogDescription>
                  <div className="mt-2 mb-2">
                    <div className="flex justify-center mb-4">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/${convention.imagePath}`}
                        alt={convention.title}
                        className="max-h-[350px] w-auto rounded shadow"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-xs">
                        Créé le : {new Date(convention.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900/90 mb-4">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Description :</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {convention.description}
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};