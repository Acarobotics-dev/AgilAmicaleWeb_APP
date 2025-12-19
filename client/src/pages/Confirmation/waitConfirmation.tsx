import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useAuth } from "@/context/auth-context";

const WaitingConfirmation = () => {
  const { resetCredentials } = useAuth();

  const handleRedirect = async () => {
    try {
      sessionStorage.clear();
      await resetCredentials();
    } catch (error) {
      console.error("Error during login or navigation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">En attente de confirmation</CardTitle>
          <CardDescription className="text-gray-500">
            Votre demande a été envoyée avec succès. Un administrateur va
            examiner votre compte et vous confirmera l'activation prochainement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            <p>
              Vous recevrez une notification par email une fois votre compte
              approuvé.
            </p>
          </div>
          <Button
            onClick={handleRedirect}
            className="w-full flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <Link to="/home">Retour à l'accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingConfirmation;
