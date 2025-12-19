import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import LoginPicture from "@/assests/AGILLoginPicture.webp";
import { ResetPasswordService } from "@/services";
import { Eye, EyeClosed } from "lucide-react";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength (0-5)
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return score;

    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    return score;
  };

  const getPasswordRequirements = (pwd: string) => {
    const requirements: string[] = [];
    if (pwd.length < 8) requirements.push("au moins 8 caractères");
    if (!/[A-Z]/.test(pwd)) requirements.push("une majuscule");
    if (!/[a-z]/.test(pwd)) requirements.push("une minuscule");
    if (!/[0-9]/.test(pwd)) requirements.push("un chiffre");
    if (!/[^A-Za-z0-9]/.test(pwd)) requirements.push("un caractère spécial");
    return requirements;
  };

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }
    if (passwordStrength < 5) {
      setError(
        "Le mot de passe ne remplit pas toutes les exigences de sécurité."
      );
      return false;
    }
    setError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      toast({
        title: "Erreur",
        description: "Token invalide ou manquant.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await ResetPasswordService({ token, password });

      if (response.success) {
        toast({
          title: "Mot de passe réinitialisé",
          description:
            response.message ||
            "Connectez-vous avec votre nouveau mot de passe.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Échec de la réinitialisation.",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue.",
        variant: "destructive",
      });
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
          alt="Reset Password Illustration"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          style={{ aspectRatio: "1920/1080", objectFit: "cover" }}
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8">
          <div className="space-y-2 text-center mb-4">
            <h1 className="text-3xl font-bold">Réinitialiser le mot de passe</h1>
            <p className="text-gray-500">
              Entrez et confirmez votre nouveau mot de passe
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  aria-describedby="password-strength password-error password-req"
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={0}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </button>
              </div>
              <div
                className="h-2 mt-1 rounded bg-gray-100"
                aria-hidden="true"
              >
                <div
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  className={`h-2 rounded ${
                    passwordStrength <= 2
                      ? "bg-red-500"
                      : passwordStrength <= 4
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  role="progressbar"
                  aria-valuenow={passwordStrength}
                  aria-valuemin={0}
                  aria-valuemax={5}
                />
              </div>
              <p className="text-sm mt-1" id="password-strength" aria-live="polite">
                {passwordStrength <= 2 && "Faible"}
                {passwordStrength > 2 && passwordStrength <= 4 && "Moyen"}
                {passwordStrength === 5 && "Fort"}
              </p>
              {/* Password requirements feedback */}
              {password && passwordStrength < 5 && (
                <ul className="text-xs text-gray-500 mt-1 pl-4 list-disc" id="password-req">
                  {getPasswordRequirements(password).map((req) => (
                    <li key={req}>{`Ajoutez ${req}`}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-invalid={!!error}
              />
            </div>

            {/* Error message */}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Réinitialisation...
                </span>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
