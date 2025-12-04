import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Star, Mail, Calendar, Building2, Landmark, PartyPopper, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const NavMenu = (props: NavigationMenuProps) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const isActive = (path: string) => {
    return activeLink === path;
  };

  const getLinkClasses = (path: string) => {
    return cn(
      "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 relative group",
      isActive(path)
        ? "text-yellow-400 bg-yellow-500/10 font-medium"
        : "text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10"
    );
  };

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-1 md:gap-2 space-x-1 md:space-x-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-center text-sm md:text-base font-medium">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/home" className={getLinkClasses('/home')}>
              <Home className="w-4 h-4" />
              <span>Accueil</span>
              {isActive('/home') && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></span>
              )}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/conventions" className={getLinkClasses('/conventions')}>
              <Star className="w-4 h-4" />
              <span>Conventions</span>
              {isActive('/conventions') && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></span>
              )}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
              (isActive('/activities') || isActive('/agences') || isActive('/evenements'))
                ? "text-yellow-400 bg-yellow-500/10 font-medium"
                : "text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10",
              "data-[state=open]:text-yellow-400 data-[state=open]:bg-yellow-500/10"
            )}>
              <Calendar className="w-4 h-4" />
              <span>Nos Activités</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="min-w-[220px] bg-gray-900 text-gray-200 rounded-xl shadow-xl border border-gray-800 p-2 animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2"
            >
              <div className="px-3 py-2 mb-1 border-b border-gray-800">
                <span className="text-xs font-medium text-gray-400">Découvrez nos activités</span>
              </div>

              <DropdownMenuItem asChild>
                <Link
                  to="/activities"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer my-1",
                    isActive('/activities') && "bg-gray-800 text-yellow-400"
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800">
                    <Building2 className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Maisons</span>
                    <span className="text-xs text-gray-400">Résidences et logements</span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/agences"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer my-1",
                    isActive('/agences') && "bg-gray-800 text-yellow-400"
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800">
                    <Landmark className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Hotels</span>
                    <span className="text-xs text-gray-400">Bureaux et services</span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/evenements"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer my-1",
                    isActive('/evenements') && "bg-gray-800 text-yellow-400"
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800">
                    <PartyPopper className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Événements</span>
                    <span className="text-xs text-gray-400">Fêtes et célébrations</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/contact" className={getLinkClasses('/contact')}>
              <Mail className="w-4 h-4" />
              <span>Nous contacter</span>
              {isActive('/contact') && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></span>
              )}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};