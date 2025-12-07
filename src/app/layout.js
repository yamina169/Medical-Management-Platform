"use client"; // nécessaire si on utilise un hook côté client
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Pages où on ne veut pas afficher Navbar et Footer
  const noLayoutPages = [
    "/login",
    "/register",
    "/reset-password",
    "/dashboard",
    "/dashboard/superadmin/clinics",
    "/dashboard/superadmin/subscriptions",
    "/dashboard/profil",
  ];

  const hideLayout = noLayoutPages.includes(pathname);

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
