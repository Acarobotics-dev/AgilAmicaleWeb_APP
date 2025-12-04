/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoginPicture from "@/assests/AGILLoginPicture.webp";
import { toast } from "sonner";
import { AuthContext } from "@/context/auth-context";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Eye, EyeClosed, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

const ERROR_TYPES = {
  EMAIL_EXISTS: "EMAIL_ALREADY_EXISTS",
  MATRICULE_EXISTS: "MATRICULE_ALREADY_EXISTS",
  MISSING_PASSWORD: "MISSING_PASSWORD",
  MISSING_FIELDS: "MISSING_FIELDS",
  SERVER_ERROR: "SERVER_ERROR",
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    matricule: "",
    password: "",
    confirmPassword: "",
  });

  const { handleRegisterUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({}); // Add touched state

  const navigate = useNavigate();

  // Function to calculate password strength (0-5)
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return score;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value) return "Ce champ est requis.";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Doit contenir uniquement des lettres et des espaces.";
        break;
      case "email":
        if (!value) return "Ce champ est requis.";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email invalide.";
        break;
      case "phone":
        if (!value) return "Ce champ est requis.";
        // Allow + and numbers only, any length
        if (!/^\+?[0-9]+$/.test(value))
          return "Le numéro de téléphone doit contenir uniquement des chiffres et éventuellement un +.";
        break;
      case "matricule":
        if (!value) return "Ce champ est requis.";
        if (!/^[0-9]{4}$/.test(value))
          return "Le matricule doit être exactement 4 chiffres.";
        break;
      case "password":
        if (!value) return "Ce champ est requis.";
        break;
      case "confirmPassword":
        if (!value) return "Ce champ est requis.";
        if (value !== formData.password)
          return "Les mots de passe ne correspondent pas.";
        break;
      default:
        break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on change
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));

    if (name === "password") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
      // Also validate confirmPassword if it exists
      if (formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== formData.confirmPassword
              ? "Les mots de passe ne correspondent pas."
              : "",
        }));
      }
    }
    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password
            ? "Les mots de passe ne correspondent pas."
            : "",
      }));
    }
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      // Validate all fields, including phone, on submit
      const errorMsg = validateField(key, value);
      if (errorMsg) newErrors[key] = errorMsg;
    });
    setErrors(newErrors);
    // Mark all fields as touched on submit
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      matricule: true,
      password: true,
      confirmPassword: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const isFormInvalid = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      matricule,
      password,
      confirmPassword,
    } = formData;
    return (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !matricule ||
      !password ||
      !confirmPassword ||
      passwordStrength < 5 // Disable if password is not strong enough
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const response = await handleRegisterUser(formData);

    if (response?.success) {
      toast.success(response.message || "Inscription réussie !");
      navigate("/login");
    } else {
      // Handle different error types with specific messages
      const errorMessage = response?.message || "Échec de l'inscription";

      // You can also handle specific error types differently
      switch (response?.type) {
        case ERROR_TYPES.EMAIL_EXISTS:
          toast.error("Cet email est déjà utilisé.");
          break;
        case ERROR_TYPES.MATRICULE_EXISTS:
          toast.error("Ce matricule est déjà utilisé.");
          break;
        case ERROR_TYPES.MISSING_FIELDS:
          toast.error("Veuillez remplir tous les champs obligatoires.");
          break;
        default:
          toast.error(errorMessage);
      }
    }
  } catch (error: any) {
    // Fallback error handling
    toast.error("Une erreur inattendue est survenue");
    console.error("Registration error:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  const getPasswordRequirements = (password: string) => {
    const requirements = [
      { text: "au moins 8 caractères", met: password.length >= 8 },
      { text: "une majuscule", met: /[A-Z]/.test(password) },
      { text: "une minuscule", met: /[a-z]/.test(password) },
      { text: "un chiffre", met: /[0-9]/.test(password) },
      { text: "un caractère spécial", met: /[^A-Za-z0-9]/.test(password) },
    ];
    return requirements;
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Spinner Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl text-yellow-500">
            <TailChase size="40" speed="1.75" color="currentColor" />
            <p className="mt-4 text-sm text-gray-800">Création de votre compte...</p>
          </div>
        </div>
      )}

      {/* Left Section (Image) */}
      <div className="hidden lg:block">
        <div className="relative h-full w-full">
          <img
            src={LoginPicture}
            alt="Login Illustration"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-[520px] space-y-8">
          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            className="group flex items-center gap-2 text-gray-800 transition-colors"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour
          </Button>

          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Bienvenue !
            </h1>
            <p className="text-gray-500 text-lg">
              Créez votre compte pour rejoindre notre communauté
            </p>
          </div>

          {/* Form - No Card Container */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-800">
                  Prénom
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`transition-all duration-200 border-gray-300 ${
                      errors.firstName
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : formData.firstName && !errors.firstName
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : "focus:border-yellow-500 focus:ring-yellow-500/20"
                    }`}
                    aria-invalid={!!errors.firstName}
                    aria-describedby="firstName-error"
                  />
                  {formData.firstName && !errors.firstName && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.firstName && (
                  <div className="flex items-center gap-1 text-xs text-red-600" id="firstName-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-800">
                  Nom
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`transition-all duration-200 border-gray-300 ${
                      errors.lastName
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : formData.lastName && !errors.lastName
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : "focus:border-yellow-500 focus:ring-yellow-500/20"
                    }`}
                    aria-invalid={!!errors.lastName}
                    aria-describedby="lastName-error"
                  />
                  {formData.lastName && !errors.lastName && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.lastName && (
                  <div className="flex items-center gap-1 text-xs text-red-600" id="lastName-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-800">
                Adresse email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre.email@agil.com.tn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`transition-all duration-200 border-gray-300 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : formData.email && !errors.email
                      ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                      : "focus:border-yellow-500 focus:ring-yellow-500/20"
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                />
                {formData.email && !errors.email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 text-xs text-red-600" id="email-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Phone and Matricule Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-800">
                  Téléphone
                </Label>
                <div className="relative">
                  <PhoneInput
                    defaultCountry="tn"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required
                    className={`transition-all duration-200 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 ${
                      touched.phone && errors.phone
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : formData.phone && !errors.phone
                        ? "border-green-500 focus:border-green-500 focus:ring-green-200"
                        : ""
                    }`}
                    aria-invalid={!!errors.phone}
                    aria-describedby="phone-error"
                    inputProps={{
                      inputMode: "tel",
                      "aria-label": "Téléphone",
                    }}
                  />
                </div>
                {touched.phone && errors.phone && (
                  <div className="flex items-center gap-1 text-xs text-red-600" id="phone-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricule" className="text-sm font-medium text-gray-800">
                  Matricule
                </Label>
                <div className="relative">
                  <Input
                    id="matricule"
                    name="matricule"
                    maxLength={4}
                    placeholder="0000"
                    value={formData.matricule}
                    onChange={handleChange}
                    required
                    className={`transition-all duration-200 border-gray-300 ${
                      errors.matricule
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : formData.matricule && !errors.matricule
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : "focus:border-yellow-500 focus:ring-yellow-500/20"
                    }`}
                    aria-invalid={!!errors.matricule}
                    aria-describedby="matricule-error"
                  />
                  {formData.matricule && !errors.matricule && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.matricule && (
                  <div className="flex items-center gap-1 text-xs text-red-600" id="matricule-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.matricule}
                  </div>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-800">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`pr-10 transition-all duration-200 border-gray-300 ${
                      errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : passwordStrength === 5
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : "focus:border-yellow-500 focus:ring-yellow-500/20"
                    }`}
                    aria-describedby="password-strength password-error password-req"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                    tabIndex={0}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {errors.password && (
                  <div className="flex items-center gap-1 text-xs text-red-600" id="password-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </div>
                )}

                {/* Enhanced Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Force du mot de passe
                        </span>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 2 ? "text-red-500" :
                          passwordStrength <= 4 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {passwordStrength <= 2 && "Faible"}
                          {passwordStrength > 2 && passwordStrength <= 4 && "Moyen"}
                          {passwordStrength === 5 && "Fort"}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              level <= passwordStrength
                                ? passwordStrength <= 2
                                  ? "bg-red-500"
                                  : passwordStrength <= 4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {passwordStrength < 5 && (
                      <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-medium text-gray-800 mb-2">
                          Critères requis :
                        </p>
                        <div className="space-y-1">
                          {getPasswordRequirements(formData.password).map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                req.met ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                              }`}>
                                {req.met && <CheckCircle className="w-2 h-2" />}
                              </div>
                              <span className={req.met ? "text-green-600" : "text-gray-500"}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`pr-10 transition-all duration-200 border-gray-300 ${
                      errors.confirmPassword
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : formData.confirmPassword && !errors.confirmPassword
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : "focus:border-yellow-500 focus:ring-yellow-500/20"
                    }`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby="confirmPassword-error"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                    tabIndex={0}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {formData.confirmPassword && !errors.confirmPassword && (
                    <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 text-xs text-red-600" id="confirmPassword-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-yellow-500 hover:bg-yellow-600 text-white transform transition-all duration-200 hover:scale-[1.02] disabled:transform-none disabled:bg-gray-200 disabled:text-gray-500"
              disabled={isSubmitting || isFormInvalid()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <TailChase size="20" speed="1.75" color="currentColor" />
                  Création en cours...
                </div>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-500">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-medium text-gray-800 hover:text-gray-600 transition-colors underline underline-offset-4 decoration-2"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
