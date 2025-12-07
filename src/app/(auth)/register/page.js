"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionType = searchParams.get("subscriptionType") || "FREE";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clinicName: "",
    taxId: "",
    address: "",
    phone: "",
    adminName: "",
    email: "",
    password: "",
    subscriptionType,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.clinicName || !formData.taxId) {
      setError("Veuillez remplir le nom et le numéro fiscal de la clinique.");
      return;
    }
    setError("");
    setStep(2);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.adminName || !formData.email || !formData.password) {
      setError("Veuillez remplir toutes les informations de l'administrateur.");
      setLoading(false);
      return;
    }

    // Création du payload conforme au backend
    const payload = {
      name: formData.adminName,
      email: formData.email,
      password: formData.password,
      role: "ADMIN_CLINIC",
      clinic: {
        name: formData.clinicName,
        taxId: formData.taxId,
        address: formData.address || null,
        phone: formData.phone || null,
        subscriptionType: formData.subscriptionType,
      },
    };

    // 🔹 Debug : vérifier le payload
    console.log("📤 PAYLOAD FRONT:", payload);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 🔹 Debug : vérifier la réponse brute
      const text = await res.text();
      console.log("📥 RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("❌ ERREUR FRONT:", err);
      setError("Erreur serveur, réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 font-main relative">
      {/* Lien retour top-left */}
      <button
        type="button"
        onClick={() => router.push("/subscription")}
        className="absolute top-12 left-60 text-blue font-semibold hover:underline"
      >
        &larr; Retourner
      </button>

      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-borderColor">
        {/* Barre de progression */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`flex-1 h-1 rounded-full ${
              step >= 1 ? "bg-blue" : "bg-lightBg"
            }`}
          />
          <div
            className={`flex-1 h-1 mx-2 rounded-full ${
              step >= 2 ? "bg-blue" : "bg-lightBg"
            }`}
          />
        </div>

        <h2 className="text-2xl font-semibold text-textPrimary mb-2 text-center">
          {step === 1
            ? "Informations de la clinique"
            : "Informations de l'administrateur"}
        </h2>
        <p className="text-textSecondary text-center mb-6">
          Plan choisi : <strong>{subscriptionType}</strong>
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form
          onSubmit={step === 1 ? handleNext : handleSubmit}
          className="space-y-4"
        >
          {step === 1 && (
            <>
              <input
                type="text"
                name="clinicName"
                placeholder="Nom de la clinique"
                value={formData.clinicName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
              <input
                type="text"
                name="taxId"
                placeholder="Numéro fiscal"
                value={formData.taxId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Adresse"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
              />
              <input
                type="text"
                name="phone"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                name="adminName"
                placeholder="Nom complet de l'administrateur"
                value={formData.adminName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue text-white rounded-xl font-semibold hover:bg-blue/90 transition-all duration-300"
          >
            {loading
              ? "Chargement..."
              : step === 1
              ? "Suivant"
              : "Créer la clinique et l'administrateur"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
