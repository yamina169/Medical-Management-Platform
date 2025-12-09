"use client";

import { useEffect, useState } from "react";

export default function ClinicPage() {
  const [clinic, setClinic] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setMessage("Token invalide ou manquant");
      setLoading(false);
      return;
    }

    async function fetchClinic() {
      try {
        const res = await fetch(`/api/clinics?id=${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok || !data.clinic)
          throw new Error(
            data.error || "Aucune clinique trouvée pour cet utilisateur"
          );

        setClinic(data.clinic);
        setForm({
          name: data.clinic.name || "",
          phone: data.clinic.phone || "",
          address: data.clinic.address || "",
        });
      } catch (err) {
        console.error("fetchClinic error:", err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClinic();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.name.trim()) {
      setMessage("Le nom est requis.");
      return false;
    }
    if (!form.phone.trim()) {
      setMessage("Le numéro de téléphone est requis.");
      return false;
    }
    if (!/^\+?[0-9\s\-]{6,15}$/.test(form.phone)) {
      setMessage("Numéro de téléphone invalide.");
      return false;
    }
    if (!form.address.trim()) {
      setMessage("L'adresse est requise.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch("/api/clinics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form), // envoyer uniquement les champs modifiables
      });

      const data = await res.json();
      console.log("API PUT response:", data); // ⚡ utile pour debugger

      // ✅ Prendre la vraie donnée retournée par l'API
      const updatedClinic = data.data;

      if (!updatedClinic || !updatedClinic.id) {
        throw new Error("Erreur lors de la mise à jour de la clinique");
      }

      setClinic(updatedClinic);
      setForm({
        name: updatedClinic.name || "",
        phone: updatedClinic.phone || "",
        address: updatedClinic.address || "",
      });

      setEditing(false);
      setMessage("Clinique mise à jour avec succès !");
    } catch (err) {
      console.error("handleSave error:", err);
      setMessage(err.message);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!clinic) return <p>{message || "Clinique introuvable"}</p>;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "N/A";

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Informations de la clinique</h1>

      <div className="space-y-2 mb-4">
        <div>
          <strong>Nom:</strong>{" "}
          {editing ? (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border p-1"
            />
          ) : (
            clinic.name
          )}
        </div>

        <div>
          <strong>Téléphone:</strong>{" "}
          {editing ? (
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border p-1"
            />
          ) : (
            clinic.phone
          )}
        </div>

        <div>
          <strong>Adresse:</strong>{" "}
          {editing ? (
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="border p-1"
            />
          ) : (
            clinic.address
          )}
        </div>

        <div>
          <strong>Type d'abonnement:</strong> {clinic.subscriptionType}
        </div>
        <div>
          <strong>Statut:</strong> {clinic.subscriptionStatus}
        </div>
        <div>
          <strong>Début:</strong> {formatDate(clinic.subscriptionStart)}
        </div>
        <div>
          <strong>Fin:</strong> {formatDate(clinic.subscriptionEnd)}
        </div>
      </div>

      {editing ? (
        <div className="space-x-2">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Enregistrer
          </button>
          <button
            onClick={() => setEditing(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Modifier
        </button>
      )}

      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
}
