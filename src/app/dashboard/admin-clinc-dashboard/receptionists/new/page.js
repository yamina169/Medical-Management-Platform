"use client"; // nécessaire pour l'interaction côté client
import { useState } from "react";

// Server action
import { createAppointment } from "@/actions/appointments";
import { cookies } from "next/headers"; // pour récupérer éventuellement le token

export default function NewAppointmentPage() {
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    status: "SCHEDULED",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fonction appelée au submit
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Récupérer token depuis cookies si nécessaire
      const token = cookies().get("token")?.value;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Error creating appointment");

      setMessage("Appointment created successfully!");
      setForm({
        patientId: "",
        doctorId: "",
        date: "",
        status: "SCHEDULED",
      });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">New Appointment</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1">Patient ID</label>
          <input
            type="number"
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Doctor ID</label>
          <input
            type="number"
            name="doctorId"
            value={form.doctorId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Appointment"}
        </button>
      </form>
    </div>
  );
}
