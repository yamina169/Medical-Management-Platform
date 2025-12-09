"use client";

import React, { useEffect, useState } from "react";

export default function AdminCard({ user }) {
  const [admins, setAdmins] = useState([]);
  const [loadingMap, setLoadingMap] = useState({});
  const [notice, setNotice] = useState(null);

  const avatarColors = [
    "#4754FF",
    "#31326F",
    "#364259",
    "#020e27",
    "#6F42C1",
    "#FF6B6B",
  ];
  const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    const code = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[code % avatarColors.length];
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins?role=ADMIN_CLINIC");
      const data = await res.json();
      // filtrer seulement les non activés
      setAdmins(data.filter((a) => !a.isActive));
    } catch (err) {
      console.error("fetch admins error", err);
      setAdmins([]);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleActivate = async (adminId) => {
    if (!user?.id) {
      setNotice({ type: "error", text: "Utilisateur non authentifié." });
      return;
    }

    setLoadingMap((s) => ({ ...s, [adminId]: true }));
    setNotice(null);

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, superAdminId: user.id }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Erreur serveur");

      setNotice({ type: "success", text: "Admin activé avec succès." });
      // Re-fetch pour obtenir liste à jour
      fetchAdmins();
    } catch (err) {
      console.error("activate error", err);
      setNotice({ type: "error", text: err.message || "Échec activation." });
    } finally {
      setLoadingMap((s) => {
        const copy = { ...s };
        delete copy[adminId];
        return copy;
      });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  if (!admins.length) {
    return (
      <div className="font-main">
        <h3 className="text-xl font-semibold text-textPrimary mb-4">
          Nouveaux Admins
        </h3>
        <div className="rounded-lg border border-borderColor bg-white p-6 text-center text-textSecondary">
          Aucun AdminClinic en attente
        </div>
      </div>
    );
  }

  return (
    <div className="font-main space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-textPrimary">
          Nouveaux Admins
        </h3>
        <span className="text-sm text-textSecondary">
          {admins.length} en attente
        </span>
      </div>

      {notice && (
        <div
          className={`px-4 py-2 rounded-md text-sm ${
            notice.type === "success"
              ? "bg-primary/10 text-primary"
              : "bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="space-y-3">
        {admins.map((admin) => {
          const initials = (admin.user?.name || "U")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={admin.id}
              className="flex items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full text-white font-semibold"
                  style={{ backgroundColor: getAvatarColor(admin.user?.name) }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-textPrimary font-medium truncate">
                    {admin.user?.name || "—"}
                  </div>
                  <div className="text-sm text-textSecondary truncate">
                    {admin.user?.email || "—"}
                  </div>
                </div>
              </div>

              <div className="flex-1 px-4 min-w-0">
                <div className="text-textPrimary font-medium truncate">
                  {admin.clinic?.name || "—"}
                </div>
                <div className="text-sm text-textSecondary truncate">
                  Matricule: {admin.clinic?.taxId || "N/A"}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleActivate(admin.id)}
                  disabled={!!loadingMap[admin.id]}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition ${
                    loadingMap[admin.id]
                      ? "bg-primary/70 cursor-not-allowed"
                      : "bg-blue hover:bg-primary"
                  }`}
                >
                  {loadingMap[admin.id] ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                      ></path>
                    </svg>
                  ) : null}
                  <span>
                    {loadingMap[admin.id] ? "Activation..." : "Activer"}
                  </span>
                </button>
                <div className="text-xs text-textSecondary">
                  Créé:{" "}
                  {new Date(admin.createdAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
