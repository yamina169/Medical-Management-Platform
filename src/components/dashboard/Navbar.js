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

  // Charger l'utilisateur depuis le localStorage
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
      if (res.ok) {
        const data = await res.json();
        setNotifications({
          expired: Array.isArray(data.expired) ? data.expired : [],
          expiring: Array.isArray(data.expiring) ? data.expiring : [],
          pendingAdmins: Array.isArray(data.pendingAdmins)
            ? data.pendingAdmins
            : [],
        });
      } else {
        console.error("Notifications fetch error:", res.status);
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }
      }
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
  }, []);

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

  const totalNotifications =
    notifications.expired.length +
    notifications.expiring.length +
    (notifications.pendingAdmins?.length || 0);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  const bgColor = colors[userInitial.charCodeAt(0) % colors.length];

  // Toggle et fetch immédiat quand on ouvre le dropdown
  const toggleNotifications = async () => {
    const opening = !menuOpen;
    setMenuOpen(opening);
    if (opening) await fetchNotifications();
  };

  return (
    <nav className="w-full flex justify-between items-center bg-white shadow px-6 py-2 relative">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Notification button */}
        {/* Notification button */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
          onClick={async () => {
            setMenuOpen(!menuOpen);
            await fetchNotifications();
            // Supprimer le badge rouge dès que l'utilisateur clique
            setNotifications((prev) => ({
              ...prev,
              expired: prev.expired,
              expiring: prev.expiring,
              pendingAdmins: prev.pendingAdmins,
            }));
            // On peut utiliser un état séparé pour le badge
            setBadgeVisible(false);
          }}
        >
          <BellIcon className="h-5 w-5 text-gray-600" />
          {totalNotifications > 0 && badgeVisible && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </button>

        {/* Notifications dropdown */}
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 max-w-[85vw] bg-white shadow-lg rounded-md overflow-hidden z-50">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <span className="font-semibold text-gray-700">Notifications</span>
              <div className="flex items-center gap-2">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={fetchNotifications}
                >
                  Refresh
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-auto">
              {/* Expiring */}
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-yellow-700 mb-2">
                  Bientôt expirées
                </h4>
                {notifications.expiring.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucune clinique bientôt expirée.
                  </p>
                ) : (
                  notifications.expiring.map((c) => (
                    <div
                      key={`e-${c.id}`}
                      className="mb-1 last:mb-0 p-2 rounded hover:bg-yellow-50 transition flex justify-between items-start gap-2"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expire le {formatDate(c.subscriptionEnd)}
                        </div>
                      </div>
                      <span className="text-xs text-yellow-700 font-semibold">
                        À venir
                      </span>
                    </div>
                  ))
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Expired */}
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-red-700 mb-2">
                  Expirées
                </h4>
                {notifications.expired.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucune clinique expirée.
                  </p>
                ) : (
                  notifications.expired.map((c) => (
                    <div
                      key={`x-${c.id}`}
                      className="mb-1 last:mb-0 p-2 rounded hover:bg-red-50 transition flex justify-between items-start gap-2"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expiré le {formatDate(c.subscriptionEnd)}
                        </div>
                      </div>
                      <span className="text-xs text-red-700 font-semibold">
                        Expiré
                      </span>
                    </div>
                  ))
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Pending admins */}
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-blue-700 mb-2">
                  Nouveaux comptes non activés
                </h4>
                {notifications.pendingAdmins.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun nouveau compte.</p>
                ) : (
                  notifications.pendingAdmins.map((c) => (
                    <div
                      key={`p-${c.id}`}
                      className="mb-1 last:mb-0 p-2 rounded hover:bg-blue-50 transition flex justify-between items-start gap-2"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.adminClinic?.createdAt
                            ? `Créé le ${formatDate(c.adminClinic.createdAt)}`
                            : `Email: ${c.email}`}
                        </div>
                      </div>
                      <span className="text-xs text-blue-700 font-semibold">
                        En attente
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile button */}
        <div className="relative">
          <button
            className={`flex items-center justify-center w-9 h-9 rounded-full text-white font-semibold ${bgColor} hover:brightness-110 transition`}
            onClick={() => {
              window.location.href = "/dashboard/profil";
            }}
          >
            {userInitial}
          </button>
        </div>
      </div>
    </nav>
  );
}
