import { createContext, useEffect, useState, useCallback, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Services
import { checkAuthService, loginService, registerService } from "@/services";

// TypeScript interfaces
interface User {
  _id: string;
  userEmail: string;
  role: string;
  status: string;
  firstName?: string;
  lastName?: string;
  matricule?: string;
  userPhone?: string;
}

interface AuthState {
  authenticate: boolean;
  user: User | null;
}

interface LoginParams {
  userEmail: string;
  password: string;
  hCaptchaToken: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
  user?: User;
  type?: string;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface InternalSignUpFormData {
  firstName: string;
  lastName: string;
  userEmail: string;
  matricule: string;
  userPhone: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextValue {
  auth: AuthState;
  resetCredentials: () => void;
  handleLoginUser: (params: LoginParams) => Promise<LoginResult>;
  handleRegisterUser: (formData: SignUpFormData) => Promise<any>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Custom hook with safety check
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    authenticate: false,
    user: null,
  });

  const [loading, setLoading] = useState(true);
  const [signUpFormData, setSignUpFormData] = useState<InternalSignUpFormData>({
    firstName: "",
    lastName: "",
    userEmail: "",
    matricule: "",
    userPhone: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  const checkAuthUser = useCallback(async () => {
    try {
      const data = await checkAuthService();
      setAuth({
        authenticate: data.success,
        user: data.success ? data.data.user : null,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      setAuth({ authenticate: false, user: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthUser();
  }, [checkAuthUser]);

const handleLoginUser = useCallback(
  async ({ userEmail, password, hCaptchaToken }: LoginParams): Promise<LoginResult> => {
    const formData = { userEmail, password, hCaptchaToken };  // Include token in formData

    try {
      const data = await loginService(formData);

      if (data.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({ authenticate: true, user: data.data.user });

        setTimeout(() => checkAuthUser(), 0);

        return {
          success: true,
          user: data.data.user,
          message: data.message
        };
      } else {
        const message = data.message || "Login failed. Please try again.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
        return {
          success: false,
          message,
          type: data.type // Pass through error type
        };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred during login. Please try again.";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return {
        success: false,
        message,
        type: error.response?.data?.type
      };
    }
  },
  [checkAuthUser, toast]
);

  const handleRegisterUser = useCallback(
    async (signUpFormData: SignUpFormData) => {
      try {
        const { email, phone, confirmPassword, ...rest } = signUpFormData;

        const finalData = {
          ...rest,
          userEmail: email,
          userPhone: phone,
          role: "adherent",
          status: "En Attente",
        };
        const data = await registerService(finalData);

        if (data.success === true) {
          setSignUpFormData({
            firstName: "",
            lastName: "",
            userEmail: "",
            matricule: "",
            userPhone: "",
            password: "",
            confirmPassword: "",
          });
        } else {
        console.warn("Registration failed.");

        }
        return data;

      } catch (error) {
        console.error("Registration error:", error.message);

      }

    },
    []
  );

  const resetCredentials = useCallback(() => {
    sessionStorage.removeItem("accessToken");
    setAuth({ authenticate: false, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        resetCredentials,
        handleLoginUser,
        handleRegisterUser,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
