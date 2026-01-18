import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "@/components/common/protectedRoute";
import SignUp from "@/pages/Auth/inscription";
import Login from "@/pages/Auth/login";
import LandingPage from "@/pages";
import ActivityList from "@/pages/Adherant/Activities";
import ContactPage from "@/pages/Adherant/Contact";
import ConventionsPage from "@/pages/Adherant/Conventions/index";
import { useContext } from "react";
import { useAuth } from "./context/auth-context";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Adherant/Profile";
import WaitingConfirmation from "./pages/Confirmation/waitConfirmation";
import ConfirmationDenied from "./pages/Confirmation/confirmationDenied";
import { ConventionsSection } from "./pages/Responsible/Conventions";
import AddEditConventionPage from "./pages/Responsible/Conventions/AddEditConventionPage";
import { HouseSection } from "./pages/Responsible/Houses";
import { AddEditHousePage } from "./pages/Responsible/Houses/AddEditHousePage";
import { UsersSection } from "./pages/Responsible/Users";
import { AddEditUserPage } from "./pages/Responsible/Users/AddEditUserPage";
import { ResponsibleDashboard } from "./pages/Responsible/Dashboard";
import { HotelSection } from "./pages/Responsible/Hotels";
import { AddEditHotelPage } from "./pages/Responsible/Hotels/AddEditHotelPage";
import { EventSection } from "./pages/Responsible/Activities";
import { AddEditEventPage } from "./pages/Responsible/Activities/AddEditEventPage";
import { BookingsSection } from "./pages/Responsible/Bookings";
import HouseDetails from "./pages/Adherant/Activities/Housedetails";
import EvenementsList from "./pages/Adherant/evenements";
import EventDetails from "./pages/Adherant/evenements/eventdetails";
import HotelList from "./pages/Adherant/agences";
import ForgotPasswordPage from "./pages/Auth/forgotpassword";
import ResetPasswordPage from "./pages/Auth/resetPassWordPage";
import { HouseDetailsPage } from "./pages/Responsible/Houses/HouseDetailsPage";
import { MyBookings } from "./pages/Adherant/BookingHistory";
const App = () => {
  const { auth } = useAuth();

  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute
          element={<LandingPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
      errorElement: <NotFound />,
    },

    {
      path: "/forgot-password",
      element: (
        <ProtectedRoute
          element={<ForgotPasswordPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/waitingforconfirmation",
      element: (
        <ProtectedRoute
          element={<WaitingConfirmation />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/deniedforconfirmation",
      element: (
        <ProtectedRoute
          element={<ConfirmationDenied />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
     {
      path: "/reset-password/:token",
      element:<ResetPasswordPage/>
    },

    {
      path: "/profile",
      element: (
        <ProtectedRoute
          element={<Profile />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/home",
      element: (
        <ProtectedRoute
          element={<LandingPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
     {
      path: "/myBooking",
      element: (
        <ProtectedRoute
          element={<MyBookings />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },

    {
      path: "/responsable/users",
      element: (
        <ProtectedRoute
          element={<UsersSection />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/users/add",
      element: (
        <ProtectedRoute
          element={<AddEditUserPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/users/edit/:userId",
      element: (
        <ProtectedRoute
          element={<AddEditUserPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/events",
      element: (
        <ProtectedRoute
          element={<EventSection />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/events/add",
      element: (
        <ProtectedRoute
          element={<AddEditEventPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/events/edit/:id",
      element: (
        <ProtectedRoute
          element={<AddEditEventPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/agences",
      element: (
        <ProtectedRoute
          element={<HotelSection />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/agences/add",
      element: (
        <ProtectedRoute
          element={<AddEditHotelPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/agences/edit/:id",
      element: (
        <ProtectedRoute
          element={<AddEditHotelPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/dashboard",
      element: (
        <ProtectedRoute
          element={<ResponsibleDashboard />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },

    {
      path: "/responsable/booking",
      element: (
        <ProtectedRoute
          element={<BookingsSection />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/conventions",
      element: (
        <ProtectedRoute
          element={<ConventionsSection />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/conventions/add",
      element: (
        <ProtectedRoute
          element={<AddEditConventionPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/conventions/edit/:id",
      element: (
        <ProtectedRoute
          element={<AddEditConventionPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/houses",
      element: (
        <ProtectedRoute
          element={<HouseSection />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/houses/add",
      element: (
        <ProtectedRoute
          element={<AddEditHousePage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/houses/edit/:houseId",
      element: (
        <ProtectedRoute
          element={<AddEditHousePage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/responsable/houses/view/:houseId",
      element: (
        <ProtectedRoute
          element={<HouseDetailsPage  />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/login",
      element: (
        <ProtectedRoute
          element={<Login />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/signup",
      element: (
        <ProtectedRoute
          element={<SignUp />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/evenements",
      element: (
        <ProtectedRoute
          element={<EvenementsList />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/evenements/:id",
      element: (
        <ProtectedRoute
          element={<EventDetails />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/activities",
      element: (
        <ProtectedRoute
          element={<ActivityList />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/agences",
      element: (
        <ProtectedRoute
          element={<HotelList />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/activities/:id",
      element: (
        <ProtectedRoute
          element={<HouseDetails />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/contact",
      element: (
        <ProtectedRoute
          element={<ContactPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
    {
      path: "/conventions",
      element: (
        <ProtectedRoute
          element={<ConventionsPage />}
          authenticated={auth?.authenticate}
          user={auth?.user}
        />
      ),
    },
  ]);

  return (
    <>
      <Toaster />
      <Sonner />
      <RouterProvider router={routes} />
    </>
  );
};

export default App;
