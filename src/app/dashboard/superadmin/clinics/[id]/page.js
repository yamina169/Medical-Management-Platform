"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function EditClinicPage() {
  const { id } = useParams();

  // Exemple de fetch initial
  const [clinic, setClinic] = useState(null);

  useEffect(() => {
    // Remplacer par fetch réel depuis API
    const mockClinic = {
      id,
      name: "Clinique A",
      phone: "12345678",
      address: "Rue A",
    };
    setClinic(mockClinic);
  }, [id]);

  if (!clinic) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-textPrimary mb-6">
        Edit Clinic: {clinic.name}
      </h1>
      <form className="max-w-lg bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-textSecondary mb-1">Name</label>
          <input
            type="text"
            value={clinic.name}
            onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
            className="w-full px-4 py-2 border border-borderColor rounded focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-textSecondary mb-1">Phone</label>
          <input
            type="text"
            value={clinic.phone}
            onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
            className="w-full px-4 py-2 border border-borderColor rounded focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-textSecondary mb-1">Address</label>
          <input
            type="text"
            value={clinic.address}
            onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
            className="w-full px-4 py-2 border border-borderColor rounded focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-700 transition"
          onClick={(e) => {
            e.preventDefault();
            alert("Save clinic: " + JSON.stringify(clinic));
            // Ajouter fetch PUT API ici
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
}
