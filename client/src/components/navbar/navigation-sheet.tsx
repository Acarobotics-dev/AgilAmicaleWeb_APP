import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import navBarLogo from "@/assests/AGILLogo.webp";
import { NavMenu } from "./nav-menu";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        {/* Accessibility: Add DialogTitle and DialogDescription */}
        <DialogTitle className="sr-only">Menu de navigation</DialogTitle>
        <DialogDescription className="sr-only">
          Ouvrez le menu de navigation pour accéder aux différentes sections du site.
        </DialogDescription>
        <Link to="/home">
          <img src={navBarLogo} alt="Logo" className="h-14 md:h-16 w-auto" />
        </Link>
        <NavMenu orientation="vertical" className="mt-12" />
      </SheetContent>
    </Sheet>
  );
};
