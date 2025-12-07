"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formInfo, setFormInfo] = useState({ name: "", email: "" });
  const [formPassword, setFormPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/profil", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Impossible de récupérer le profil");

        const data = await res.json();
        setUser(data);
        setFormInfo({ name: data.name || "", email: data.email || "" });
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
      }
    };

    loadUserProfile();
  }, []);

  const handleChangeInfo = (e) => {
    setFormInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangePassword = (e) => {
    setFormPassword((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, ...formInfo }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Erreur lors de la mise à jour");

      setMessage("Nom / Email mis à jour avec succès !");
      setUser(data);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (formPassword.newPassword !== formPassword.confirmPassword) {
      setMessage("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          password: formPassword.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Erreur lors de la mise à jour");

      setMessage("Mot de passe mis à jour avec succès !");
      setFormPassword({ newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Chargement du profil...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {/* Formulaire Mot de passe */}
      {showPasswordForm ? (
        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              name="newPassword"
              value={formPassword.newPassword}
              onChange={handleChangePassword}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formPassword.confirmPassword}
              onChange={handleChangePassword}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
      ) : (
        // Formulaire Nom / Email
        <form onSubmit={handleSubmitInfo} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nom</label>
            <input
              type="text"
              name="name"
              value={formInfo.name}
              onChange={handleChangeInfo}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formInfo.email}
              onChange={handleChangeInfo}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            type="button"
            className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            onClick={() => setShowPasswordForm(true)}
          >
            Changer le mot de passe
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Mise à jour..." : "Mettre à jour Nom / Email"}
          </button>
        </form>
      )}
    </div>
  );
}
