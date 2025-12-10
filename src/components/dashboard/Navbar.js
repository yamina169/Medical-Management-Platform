"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [notifications, setNotifications] = useState({
    expired: [],
    expiring: [],
    pendingAdmins: [],
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Charger l'utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Formater les dates
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return iso;
    }
  };

  // Récupérer notifications depuis l'API
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn("Notifications fetch error:", res.status);
        return;
      }

      const data = await res.json();
      if (!data.success || !data.alerts) return;

      let expired = [];
      let expiring = [];
      let pendingAdmins = [];

      if (user?.role === "SUPERADMIN") {
        expired = Array.isArray(data.alerts.expired) ? data.alerts.expired : [];
        expiring = Array.isArray(data.alerts.expiring)
          ? data.alerts.expiring
          : [];
        pendingAdmins = Array.isArray(data.alerts.pendingAdmins)
          ? data.alerts.pendingAdmins
          : [];
      } else if (user?.role === "ADMIN_CLINIC") {
        if (data.alerts.type === "expired") expired = [data.alerts];
        else if (data.alerts.type === "expiring") expiring = [data.alerts];
      }

      setNotifications({ expired, expiring, pendingAdmins });
    } catch (err) {
      console.error("Erreur fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Polling toutes les 10 secondes
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Fermer dropdown en cliquant en dehors
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  // Ajouter 1 notification statique si role DOCTOR
  // Ajouter 1 notification statique si role DOCTOR ou RECEPTIONIST
  const staticUserNotifications =
    user?.role === "DOCTOR"
      ? [
          {
            title: "Bonjour Docteur !",
            message: "Vérifiez vos rendez-vous d'aujourd'hui.",
            type: "info",
          },
        ]
      : user?.role === "RECEPTIONIST"
      ? [
          {
            title: "Bonjour Réceptionniste !",
            message: "Vérifiez les rendez-vous du jour.",
            type: "info",
          },
        ]
      : [];

  const totalNotifications =
    notifications.expired.length +
    notifications.expiring.length +
    (notifications.pendingAdmins?.length || 0) +
    staticUserNotifications.length;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  const bgColor = colors[userInitial.charCodeAt(0) % colors.length];

  const toggleNotifications = async () => {
    const opening = !menuOpen;
    setMenuOpen(opening);
    if (opening) await fetchNotifications();
    if (opening) setBadgeVisible(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-white/80 backdrop-blur-md shadow px-6 py-2">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="h-15 w-auto" />
        </div>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {/* Notification button */}
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
            onClick={toggleNotifications}
          >
            <BellIcon className="h-5 w-5 text-gray-600" />
            {totalNotifications > 0 && badgeVisible && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 max-w-[85vw] bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden z-50 border border-gray-200">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <span className="font-semibold text-gray-700 text-sm">
                  Notifications
                </span>
                <button
                  className="text-gray-400 hover:text-gray-600 font-bold transition"
                  onClick={() => setMenuOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {/* Notification statique pour DOCTOR */}

                {/* Notification statique pour DOCTOR ou RECEPTIONIST */}
                {staticUserNotifications.length > 0 && (
                  <div className="px-4 py-3">
                    <h4 className="text-xs font-semibold text-green-700 uppercase mb-2">
                      Message du jour
                    </h4>
                    {staticUserNotifications.map((n, idx) => (
                      <div
                        key={idx}
                        className="mb-2 last:mb-0 p-2 rounded-xl hover:bg-green-50 transition flex justify-between items-start gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {n.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {n.message}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-green-700">
                          Info
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bientôt expirées */}
                {notifications.expiring.length > 0 && (
                  <div className="px-4 py-3">
                    <h4 className="text-xs font-semibold text-yellow-700 uppercase mb-2">
                      Bientôt expirées
                    </h4>
                    {notifications.expiring.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="mb-2 last:mb-0 p-2 rounded-xl hover:bg-yellow-50 transition flex justify-between items-start gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {c.name || "Votre clinique"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.subscriptionEnd
                              ? `Expire le ${formatDate(c.subscriptionEnd)}`
                              : c.message}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-yellow-700">
                          À venir
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expirées */}
                {notifications.expired.length > 0 && (
                  <div className="px-4 py-3">
                    <h4 className="text-xs font-semibold text-red-600 uppercase mb-2">
                      Expirées
                    </h4>
                    {notifications.expired.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="mb-2 last:mb-0 p-2 rounded-xl hover:bg-red-50 transition flex justify-between items-start gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {c.name || "Votre clinique"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.subscriptionEnd
                              ? `Expiré le ${formatDate(c.subscriptionEnd)}`
                              : c.message}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-red-600">
                          Expiré
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nouveaux comptes non activés pour SUPERADMIN */}
                {user?.role === "SUPERADMIN" &&
                  notifications.pendingAdmins.length > 0 && (
                    <div className="px-4 py-3">
                      <h4 className="text-xs font-semibold text-blue-700 uppercase mb-2">
                        Nouveaux comptes non activés
                      </h4>
                      {notifications.pendingAdmins.map((c) => (
                        <div
                          key={c.id}
                          className="mb-2 last:mb-0 p-2 rounded-xl hover:bg-blue-50 transition flex justify-between items-start gap-2 cursor-pointer"
                        >
                          <div>
                            <div className="font-medium text-gray-800">
                              {c.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.adminClinic?.createdAt
                                ? `Créé le ${formatDate(
                                    c.adminClinic.createdAt
                                  )}`
                                : `Email: ${c.email}`}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-blue-700">
                            En attente
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Profile */}
          <div className="relative flex items-center gap-2">
            <button
              className={`flex items-center justify-center w-9 h-9 rounded-full text-white font-semibold ${bgColor} hover:brightness-110 transition`}
              onClick={() => (window.location.href = "/dashboard/profil")}
            >
              {userInitial}
            </button>
            {user?.name && (
              <span className="text-gray-700 font-medium text-sm hidden md:inline">
                {user.name}
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-16"></div>
    </>
  );
}
