import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import menuItems from "@/config/sideBar-data";
import { Button } from "./ui/button";
import AGILLogo from "@/assests/AGILLogo.webp";
import { Link, useLocation } from "react-router-dom";
import { SquareArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";


const AppSidebar = () => {
  const location = useLocation();
  const { resetCredentials } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      await resetCredentials();
      toast.success("Vous avez été déconnecté");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Sidebar className="border-r-2 rounded-r-lg shadow-lg bg-sidebar w-full max-w-[260px]">
      {/* Header with larger logo */}
      <SidebarHeader className="border-b p-6 flex flex-col gap-4">
        <div className="w-full h-18 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={AGILLogo}
            alt="Logo AGIL"
            className="w-full h-full object-cover"
          />
        </div>
      </SidebarHeader>

      {/* Main content */}
      <SidebarContent className="p-4 flex flex-col justify-between h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground mb-3 px-2 uppercase tracking-wide">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      className=
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md "

                    >
                      <Link
                        to={item.path}
                        className="w-full flex items-center"
                        aria-label={item.title}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span
                          className=
                            "ml-3 font-medium"

                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <SidebarGroupContent className="mt-auto pt-6 border-t border-sidebar-border">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive px-3 py-4 rounded-lg"
              >
                <SquareArrowRight className="h-5 w-5" />
                <span>Se déconnecter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Se déconnecter
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full sm:w-auto"
                >
                  Se déconnecter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
