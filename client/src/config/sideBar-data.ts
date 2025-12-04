import { Users, House, Book ,AlignJustify ,FilePlus,Building ,CalendarDays, LayoutDashboard } from "lucide-react";

const menuItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    id: "dashboard",
    path: "/responsable/dashboard",
  },
  {
    title: "Utilisateurs",
    icon: Users,
    id: "users",
    path: "/responsable/users",
  },
  {
    title: "Maisons",
    icon: House,
    id: "houses",
    path: "/responsable/houses",
  },
  {
    title: "Hotels",
    icon: Building,
    id: "agences",
    path: "/responsable/agences",
  },
  {
    title: "Evénements",
    icon: CalendarDays  ,
    id: "events",
    path: "/responsable/events",
  },
  {
    title: "Réservations",
    icon: Book,
    id: "booking",
    path: "/responsable/booking",
  },
    {
    title: "Conventions",
    icon: FilePlus ,
    id: "documents",
    path: "/responsable/conventions",
  },
   {
    title: "Menu adherent",
    icon: AlignJustify ,
    id: "menu-client",
    path: "/home",
  }


];

export default menuItems;
