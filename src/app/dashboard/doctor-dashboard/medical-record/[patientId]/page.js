"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MedicalRecordPage() {
  const params = useParams();
  const patientId = Number(params.patientId);

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [prescriptions, setPrescriptions] = useState("");

  // Fonction pour récupérer le dossier médical
  const fetchRecord = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/medicalRecord?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecord(data.data);
        setDescription(data.data.description);
        setPrescriptions(
          data.data.prescriptions?.medicaments
            ? data.data.prescriptions.medicaments.join("\n")
            : ""
        );
      }
    } catch (err) {
      console.error("Fetch medical record error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder les modifications
  const handleSave = async () => {
    const medsArray = prescriptions
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/medicalRecord", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: record.id,
          description,
          prescriptions: { medicaments: medsArray },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecord(data.data);
        setEditing(false);
        alert("Medical record updated successfully.");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    }
  };

  useEffect(() => {
    if (!isNaN(patientId)) {
      fetchRecord();
    }
  }, [patientId]);

  if (loading) return <p>Loading...</p>;
  if (!record) return <p>No medical record found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Medical Record</h1>
      <div className="mb-4">
        <span className="font-semibold">Patient:</span> {record.patientName}
      </div>
      {record.doctorName && (
        <div className="mb-4">
          <span className="font-semibold">Doctor:</span> {record.doctorName}
        </div>
      )}
      <div className="mb-4">
        <span className="font-semibold">Description:</span>
        {editing ? (
          <textarea
            className="border rounded w-full p-3 mt-1 text-gray-700"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        ) : (
          <p className="border rounded p-3 mt-1 bg-gray-50">
            {record.description}
          </p>
        )}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Prescriptions:</span>
        {editing ? (
          <textarea
            className="border rounded w-full p-3 mt-1 text-gray-700"
            value={prescriptions}
            onChange={(e) => setPrescriptions(e.target.value)}
            rows={4}
            placeholder="One medication per line"
          />
        ) : (
          <ul className="border rounded p-3 mt-1 bg-gray-50 list-disc list-inside">
            {record.prescriptions?.medicaments?.map((m, idx) => (
              <li key={idx}>{m}</li>
            )) || <li>No prescriptions</li>}
          </ul>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-4">
        updatedAt: {new Date(record.updatedAt).toLocaleString()}
      </div>
      <div className="flex gap-3">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
