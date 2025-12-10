"use client"; // nécessaire si on utilise un hook côté client
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Pages exactes où on ne veut pas afficher Navbar et Footer
  const noLayoutPagesExact = [
    "/login",
    "/register",
    "/reset-password",
    "/dashboard",
    "/dashboard/superadmin-dashboard/clinics",
    "/dashboard/superadmin-dashboard/subscriptions",
    "/dashboard/profil",
    "/dashboard/admin-clinc-dashboard/doctors",
    "/dashboard/admin-clinc-dashboard/doctors/new",
    "/dashboard/admin-clinc-dashboard/receptionists",
    "/dashboard/admin-clinc-dashboard/receptionists/new",
    "/dashboard/admin-clinc-dashboard/patients",
    "/dashboard/admin-clinc-dashboard/clinic",
    "/dashboard/doctor-dashboard/appointments",
    "/dashboard/doctor-dashboard/patients",
    // Receptionist
    "/dashboard/receptionist-dashboard/patients",
    "/dashboard/receptionist-dashboard/appointments",
    "/dashboard/receptionist-dashboard/patients/new",
  ];

  // Pages dynamiques où on ne veut pas afficher Navbar et Footer
  const noLayoutPagesDynamic = [
    "/dashboard/doctor-dashboard/medical-record/",
    "/dashboard/doctor-dashboard/appointments/",
    // Receptionist si pages dynamiques
    "/dashboard/receptionist-dashboard/patients/",
    "/dashboard/receptionist-dashboard/appointments/",
  ];

  const hideLayout =
    noLayoutPagesExact.includes(pathname) ||
    noLayoutPagesDynamic.some((p) => pathname.startsWith(p));

  return (
    <html lang="fr">
      <body className="font-main overflow-x-hidden">
        {!hideLayout && <Navbar />}
        <main>{children}</main>
        {!hideLayout && <Footer />}
      </body>
    </html>
  );
}
