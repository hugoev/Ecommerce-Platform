import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import Navbar from './Navbar';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow bg-background">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
