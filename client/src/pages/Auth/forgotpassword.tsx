/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import LoginPicture from "@/assests/AGILLoginPicture.webp";
import { ForgotpasswordService } from "@/services";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  // No local toast hook needed
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setError("L'email est requis");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      const response = await ForgotpasswordService({ userEmail: email });

      toast.success(response.message || "Vérifiez votre boîte mail pour le lien de réinitialisation");
      setEmail("");

    } catch (err: any) {
      // Handle network errors or unexpected exceptions
      const errorMessage = err.message || "Une erreur inattendue s'est produite";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section */}
      <div className="hidden lg:flex flex-1 bg-gray-100">
        <img
          src={LoginPicture}
          alt="Login Illustration"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          style={{ aspectRatio: "1920/1080", objectFit: "cover" }}
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8">
          <Button
            type="button"
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </Button>

          <div className="space-y-2 text-center mb-4">
            <h1 className="text-3xl font-bold">Mot de passe oublié?</h1>
            <p className="text-gray-500">
              Entrez votre email pour réinitialiser votre mot de passe
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@agil.com.tn"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                aria-invalid={!!error}
                aria-describedby="email-error"
                className={`w-full ${error ? "border-destructive" : ""}`}
              />
              {error && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : "Envoyer le lien de réinitialisation"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;