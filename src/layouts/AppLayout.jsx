import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../features/navbar/components/Navbar";

const HIDDEN_NAV_ROUTES = ["/dashboard"];

const AppLayout = () => {
  const { pathname } = useLocation();
  const hideNavbar = HIDDEN_NAV_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
