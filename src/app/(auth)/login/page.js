"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GhostButton from "@/components/GhostButton";
import Image from "next/image";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la connexion.");
        return;
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user)); // stocke l'objet user
      }
      if (data.token) {
        localStorage.setItem("token", data.token); // stocke le token si nécessaire
      }
      // 🔥 Login OK → redirection vers dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Erreur serveur.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-blue/5 px-5">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center ">
          <Image
            src="/logo.svg"
            alt="Logo MedCare"
            width={40}
            height={40}
            className="w-20 h-auto"
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue mb-2">Connexion</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue"
              placeholder="exemple@medcare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-primary">
          <GhostButton href="/reset-password" title="Mot de passe oublié ?" />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
