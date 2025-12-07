"use client";
import React, { useState } from "react";
import GhostButton from "@/components/GhostButton";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Veuillez entrer votre email.");
      return;
    }

    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/request-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur serveur.");
        return;
      }

      setMessage("Un email de réinitialisation a été envoyé !");
    } catch {
      setError("Erreur serveur.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-blue text-center mb-2">
          Réinitialiser le mot de passe
        </h2>

        <form onSubmit={handleReset} className="space-y-5">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <div className="flex flex-col">
            <label className="text-textSecondary mb-1">Email</label>
            <input
              type="email"
              className="border border-border rounded-lg p-3"
              placeholder="exemple@medcare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="w-full py-3 rounded-lg bg-blue text-white font-semibold">
            Envoyer le lien
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-primary">
          <GhostButton href="/login" title="Retour à la connexion" />
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordForm;
