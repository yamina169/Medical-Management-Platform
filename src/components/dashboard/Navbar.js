"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Charger l'utilisateur depuis le localStorage au montage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Première lettre du nom de l'utilisateur
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Couleur dynamique basée sur la lettre
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  const letterCode = userInitial.charCodeAt(0); // code ASCII
  const bgColor = colors[letterCode % colors.length];

  return (
    <nav className="w-full flex justify-between items-center bg-white shadow px-6 py-2 relative">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-auto overflow-visible">
          <img
            src="/logo.svg"
            alt="MedFlow Logo"
            className="h-16 w-auto object-contain -translate-y-1" // augmente visuellement le logo sans toucher à la navbar
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-800"></h2>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4 relative">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <BellIcon className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            className={`flex items-center justify-center w-9 h-9 rounded-full text-white font-semibold ${bgColor} hover:brightness-110 transition`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {userInitial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-10">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
              >
                Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
