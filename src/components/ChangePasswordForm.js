"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GhostButton from "@/components/GhostButton";

const ChangePasswordForm = ({ token }) => {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleChange = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur serveur");
        return;
      }

      setSuccess("Mot de passe changé avec succès !");

      // 🔹 Redirection après 3 secondes
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Erreur serveur");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-blue mb-2 text-center">
          Changer le mot de passe
        </h2>

        <form onSubmit={handleChange} className="space-y-5">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="border p-3 w-full rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmer mot de passe"
            className="border p-3 w-full rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="w-full py-3 bg-blue text-white rounded-lg">
            Changer le mot de passe
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <GhostButton href="/login" title="Retour à la connexion" />
        </div>
      </div>
    </section>
  );
};

export default ChangePasswordForm;
