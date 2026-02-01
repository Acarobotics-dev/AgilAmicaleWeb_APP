/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoginPicture from "@/assests/AGILLoginPicture.webp";
import { useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-toastify";
import { Eye, EyeClosed } from "lucide-react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// Environment variable validation
const HCAPTCHA_SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;
if (!HCAPTCHA_SITEKEY) {
  console.error("hCaptcha sitekey is missing in environment variables");
}

const ERROR_TYPES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ACCOUNT_NOT_ACTIVE: "ACCOUNT_NOT_ACTIVE",
  CAPTCHA_FAILED: "CAPTCHA_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
};

const Login = () => {
  const navigate = useNavigate();
  const { handleLoginUser } = useAuth();
  // No local toast hook needed
  const [userEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  // State management
  const [formState, setFormState] = useState({
    captchaToken: null as string | null,
    captchaError: "",
    touched: {
      email: false,
      password: false,
    },
    fieldErrors: {
      email: "",
      password: "",
    },
  });

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return "L'adresse e-mail est requise.";
    if (!/\S+@\S+\.\S+/.test(email))
      return "L'adresse e-mail n'est pas valide.";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis.";
    if (password.length < 6)
      return "Le mot de passe doit contenir au moins 6 caractères.";
    return "";
  };

  // CAPTCHA handlers
  const handleCaptchaVerification = (token: string) => {
    console.log(token);
    setFormState((prev) => ({
      ...prev,
      captchaToken: token,
      captchaError: "",
    }));
  };

  const handleCaptchaError = (error: any) => {
    let errorMessage = "Erreur de vérification CAPTCHA. Veuillez réessayer.";
    if (error instanceof Error && error.message.includes("network")) {
      errorMessage = "Problème de connexion au service CAPTCHA";
    }

    setFormState((prev) => ({
      ...prev,
      captchaError: errorMessage,
    }));
    console.error("hCaptcha Error:", error);
  };

  const handleCaptchaExpire = () => {
    setFormState((prev) => ({
      ...prev,
      captchaToken: null,
      captchaError: "La vérification CAPTCHA a expiré. Veuillez réessayer.",
    }));
  };

  // Form handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, email: true },
      fieldErrors: {
        ...prev.fieldErrors,
        email: validateEmail(value),
      },
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, password: true },
      fieldErrors: {
        ...prev.fieldErrors,
        password: validatePassword(value),
      },
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  };

  const validateForm = () => {
    const emailErr = validateEmail(userEmail);
    const passErr = validatePassword(password);
    const captchaValid = !!formState.captchaToken;

    setFormState((prev) => ({
      ...prev,
      fieldErrors: {
        email: emailErr,
        password: passErr,
      },
      captchaError: captchaValid
        ? ""
        : "Veuillez vérifier que vous n'êtes pas un robot",
    }));

    return !emailErr && !passErr && captchaValid;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);

    try {
      const result = await handleLoginUser({
        userEmail,
        password,
        hCaptchaToken: formState.captchaToken, // Must be included
      });

      if (result?.success) {
        const user = result.user;
        toast.success(`Bienvenue ${user.firstName || ""}!`);

        // Role-based redirection
        navigate(user.role === "adherent" ? "/home" : "/responsable/dashboard");
      } else {
        handleLoginError(result);
      }
    } catch (error: any) {
      handleLoginError({
        type: ERROR_TYPES.SERVER_ERROR,
        message: error.message || "Une erreur inattendue est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error?: { type?: string; message?: string }) => {
    const errorType = error?.type || ERROR_TYPES.SERVER_ERROR;
    const errorMessage = error?.message || "Erreur lors de la connexion";

    // Always reset captcha on login failure
    captchaRef.current?.resetCaptcha();
    setFormState((prev) => ({
      ...prev,
      captchaToken: null,
      captchaError: "",
    }));

    switch (errorType) {
      case ERROR_TYPES.INVALID_CREDENTIALS:
        toast.error("Veuillez vérifier votre email et mot de passe");
        break;
      case ERROR_TYPES.USER_NOT_FOUND:
        toast.error("Aucun utilisateur avec cet email n'a été trouvé");
        break;
      case ERROR_TYPES.CAPTCHA_FAILED:
        toast.error("La vérification CAPTCHA a échoué");
        setFormState((prev) => ({
          ...prev,
          captchaError: "Veuillez refaire la vérification CAPTCHA",
        }));
        break;
      default:
        toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <TailChase size="40" speed="1.75" color="black" />
        </div>
      )}

      {/* Left section with image */}
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

      {/* Right section with form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8">
          <Button
            type="button"
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/home")}
          >
            ← Retour
          </Button>

          <div className="space-y-2 text-center mb-4">
            <h1 className="text-3xl font-bold">Bienvenue!</h1>
            <p className="text-gray-500">
              Entrez votre email et votre mot de passe pour vous connecter.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@agil.com.tn"
                required
                autoComplete="email"
                value={userEmail}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                aria-invalid={!!formState.fieldErrors.email}
                aria-describedby="login-email-error"
                className="w-full"
              />
              {formState.touched.email && formState.fieldErrors.email && (
                <p className="text-xs text-red-500" id="login-email-error">
                  {formState.fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de Passe</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur}
                  aria-invalid={!!formState.fieldErrors.password}
                  aria-describedby="login-password-error"
                  className="w-full"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={0}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </button>
              </div>
              {formState.touched.password && formState.fieldErrors.password && (
                <p className="text-xs text-red-500" id="login-password-error">
                  {formState.fieldErrors.password}
                </p>
              )}
            </div>

            {/* hCaptcha */}
            {HCAPTCHA_SITEKEY && (
              <div className="my-4">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITEKEY}
                  onVerify={handleCaptchaVerification}
                  onError={handleCaptchaError}
                  onExpire={handleCaptchaExpire}
                  theme="light"
                  size="normal" // or "compact"
                />
                {formState.captchaError && (
                  <p className="text-xs text-red-500 mt-1">
                    {formState.captchaError}
                  </p>
                )}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                !userEmail ||
                !password ||
                !!formState.fieldErrors.email ||
                !!formState.fieldErrors.password ||
                !formState.captchaToken ||
                loading
              }
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            {/* Signup link */}
            <div className="text-sm text-center mt-2">
              Vous n'avez pas un compte?{" "}
              <Link to="/signup" className="font-medium underline">
                S'inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
