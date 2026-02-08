import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
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

const NavbarSection = () => {
  const { auth, resetCredentials } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      await resetCredentials();
      toast.success("Vous avez été déconnecté avec succès.");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Impossible de vous déconnecter pour le moment.");
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950 shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Mobile Menu Button - Left side on mobile */}
        <div className="flex md:hidden items-center">
          <NavigationSheet />
        </div>

        {/* Logo - Centered on mobile, left on desktop */}
        <Link
          to="/home"
          aria-label="Home"
          className="flex-shrink-0 transition-transform hover:scale-105 mx-auto md:mx-0"
        >
          <img
            src={navBarLogo}
            alt="Logo"
            className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[120px] sm:max-w-none"
          />
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-center px-6">
          <NavMenu className="flex items-center gap-6" />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {!auth.authenticate ? (
            <>
              {/* Sign Up Button - Always visible, icon-only on small screens */}
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="rounded-full px-2 sm:px-3 md:px-4 border-yellow-500 text-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 transition-colors font-semibold text-xs sm:text-sm"
                  aria-label="Sign Up"
                  size="sm"
                >
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline sm:inline">S'inscrire</span>
                  <span className="xs:hidden sm:hidden">S'incrire</span>
                </Button>
              </Link>

              {/* Login Button */}
              <Link to="/login">
                <Button
                  className="rounded-full px-2 sm:px-3 md:px-4 bg-yellow-500 hover:bg-yellow-600 transition-colors font-semibold shadow text-xs sm:text-sm"
                  aria-label="Login"
                  size="sm"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline sm:inline">Connexion</span>
                  <span className="xs:hidden sm:hidden">Conn.</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-full px-2 sm:px-3 md:px-4 bg-yellow-500 hover:bg-yellow-600 transition-colors font-semibold flex items-center gap-1 text-xs sm:text-sm"
                    aria-label="Profile Menu"
                    size="sm"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 md:mr-2" />
                    <span className="hidden md:inline">Profil</span>
                    <span className="md:hidden">Profil</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 sm:w-56 bg-gray-950 border-gray-700 shadow-xl max-h-[80vh] overflow-y-auto"
                  align="end"
                  sideOffset={5}
                >
                  <DropdownMenuItem asChild className="hover:bg-gray-800 text-xs sm:text-sm">
                    <Link
                      to="/profile"
                      className="flex items-center w-full text-gray-200"
                      aria-label="Profile"
                    >
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Profil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  <DropdownMenuItem asChild className="hover:bg-gray-800 text-xs sm:text-sm">
                    <Link
                      to="/myBooking"
                      className="flex items-center w-full text-gray-200"
                      aria-label="Mes Reservations"
                    >
                      <Book className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Mes Reservations
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  {auth.user.role === "responsable" && (
                    <>
                      <DropdownMenuItem asChild className="hover:bg-gray-800 text-xs sm:text-sm">
                        <Link
                          to="/responsable/users"
                          className="flex items-center w-full text-gray-200"
                          aria-label="Users"
                        >
                          <Table2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Espace Responsable
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                    </>
                  )}

                  {/* Logout with Confirmation Dialog */}
                  <DropdownMenuItem className="hover:bg-gray-800 p-0 text-xs sm:text-sm">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="flex items-center w-full px-2 py-1.5 text-gray-400 cursor-pointer hover:text-red-500 transition-colors text-xs sm:text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Déconnexion
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-gray-900 text-gray-200 border-gray-800 mx-4">
                        <DialogHeader>
                          <DialogTitle className="text-red-500 flex items-center gap-2 text-sm sm:text-base">
                            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                            Confirmer la déconnexion
                          </DialogTitle>
                          <DialogDescription className="text-gray-400 pt-2 text-xs sm:text-sm">
                            Êtes-vous sûr de vouloir vous déconnecter ? Votre
                            session sera perdue.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 border-gray-600 text-xs sm:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              document.dispatchEvent(
                                new KeyboardEvent("keydown", { key: "Escape" })
                              );
                            }}
                            size="sm"
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogout();
                            }}
                            size="sm"
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

          {/* Mobile Navigation Sheet Button - Alternative position */}
          <div className="hidden md:block lg:hidden ml-2">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarSection;