"use client";

import { useState, useEffect } from "react";

export default function RegisterDoctor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSpecializations() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Vous devez être connecté");
          return;
        }

        const res = await fetch("/api/specializations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setSpecializations(data);
          if (data.length > 0) setSpecializationId(data[0].id);
        } else {
          setMessage(
            data.error || "Erreur lors de la récupération des spécialités"
          );
        }
      } catch (err) {
        console.error(err);
        setMessage("Erreur serveur.");
      }
    }

    fetchSpecializations();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !specializationId) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Vous devez être connecté");
        return;
      }

      // Décodage du token pour récupérer userId
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const adminUserId = decodedPayload.id;

      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          specializationId,
          adminUserId, // on envoie l'userId au backend
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Médecin créé avec succès !");
        setName("");
        setEmail("");
        setSpecializationId(specializations[0]?.id || "");
      } else {
        setMessage(data.error || "Erreur lors de la création du médecin.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4">Créer un médecin</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />

        <label>
          Spécialisation
          <select
            value={specializationId}
            onChange={(e) => setSpecializationId(e.target.value)}
            className="border p-2 rounded w-full mt-1"
          >
            {Array.isArray(specializations) && specializations.length > 0 ? (
              specializations.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))
            ) : (
              <option value="">Aucune spécialisation disponible</option>
            )}
          </select>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
