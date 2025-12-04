import { Button } from "@/components/ui/button";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { Link, useNavigate } from "react-router-dom";
import navBarLogo from "@/assests/AGILLogo.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../context/auth-context";
import {
  UserPlus,
  LogIn,
  User,
  LogOut,
  Table2,
  ChevronDown,
  Book,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const NavbarSection = () => {
  const { auth, resetCredentials } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      await resetCredentials();
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès.",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vous déconnecter pour le moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950 shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/home"
          aria-label="Home"
          className="flex-shrink-0 transition-transform hover:scale-105"
        >
          <img src={navBarLogo} alt="Logo" className="h-14 md:h-16 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center px-6">
          <NavMenu className="flex items-center gap-6" />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!auth.authenticate ? (
            <>
              <Link to="/signup" className="hidden sm:block">
                <Button
                  variant="outline"
                  className="rounded-full px-3 sm:px-4 border-yellow-500 text-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 transition-colors font-semibold"
                  aria-label="Sign Up"
                >
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">S'inscrire</span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  className="rounded-full px-3 sm:px-4 bg-yellow-500 hover:bg-yellow-600 transition-colors font-semibold shadow"
                  aria-label="Login"
                >
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Connexion</span>
                  <span className="sm:hidden">Connexion</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-full px-3 sm:px-4 bg-yellow-500 hover:bg-yellow-600 transition-colors font-semibold flex items-center gap-1"
                    aria-label="Profile Menu"
                  >
                    <User className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Profil</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-gray-950 border-gray-700 shadow-xl"
                  align="end"
                >
                  <DropdownMenuItem asChild className="hover:bg-gray-800">
                    <Link
                      to="/profile"
                      className="flex items-center w-full text-gray-200"
                      aria-label="Profile"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild className="hover:bg-gray-800">
                    <Link
                      to="/myBooking"
                      className="flex items-center w-full text-gray-200"
                      aria-label="Mes Reservations"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Mes Reservations
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  {auth.user.role === "responsable" && (
                    <>
                      <DropdownMenuItem asChild className="hover:bg-gray-800">
                        <Link
                          to="/responsable/dashboard"
                          className="flex items-center w-full text-gray-200"
                          aria-label="Dashboard"
                        >
                          <Table2 className="h-4 w-4 mr-2" />
                          Tableau de bord
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                    </>
                  )}

                  {/* Logout with Confirmation Dialog */}
                  <DropdownMenuItem className="hover:bg-gray-800 p-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="flex items-center w-full px-2 py-1.5 text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-gray-900 text-gray-200 border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-red-500 flex items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            Confirmer la déconnexion
                          </DialogTitle>
                          <DialogDescription className="text-gray-400 pt-2">
                            Êtes-vous sûr de vouloir vous déconnecter ? Votre
                            session sera perdue.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 border-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              document.dispatchEvent(
                                new KeyboardEvent("keydown", { key: "Escape" })
                              );
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogout();
                            }}
                          >
                            Se déconnecter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Mobile Menu Button */}
          <div className="md:block lg:hidden ml-2">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarSection;
