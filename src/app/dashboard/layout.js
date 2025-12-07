"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({ children }) {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  if (!userRole) return null; // Loader si role non disponible

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar en haut, full width */}
      <header className="w-full">
        <Navbar />
      </header>

      <div className="flex flex-1">
        {/* Sidebar à gauche, prend la hauteur restante */}
        <aside className="w-64 min-w-[16rem]">
          <Sidebar userRole={userRole} />
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
