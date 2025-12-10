"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const { id } = params;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [dateModified, setDateModified] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch appointment
  useEffect(() => {
    if (!id) return;

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointments?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to fetch appointment");

        setAppointment(data.data);
        setStatus(data.data?.status || "");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, token]);

  // Handle update
  const handleUpdate = async () => {
    if (!id) return console.error("No appointment ID found");

    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          date: appointment.date,
        }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to update appointment");

      setAppointment(data.data);
      setDateModified(false); // reset flag
      alert("Appointment updated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!appointment) return <p>Appointment not found</p>;

  const patientName = appointment.patient?.user?.name || "N/A";
  const patientEmail = appointment.patient?.user?.email || "N/A";
  const doctorName = appointment.doctor?.user?.name || "N/A";
  const doctorEmail = appointment.doctor?.user?.email || "N/A";

  // Déterminer si on peut modifier la date
  const canEditDate = status === "SCHEDULED";

  // Déterminer si le bouton doit être désactivé
  const isUpdateDisabled = status === "SCHEDULED" && !dateModified;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Appointment Details</h1>

      <div className="mb-4">
        <p>
          <strong>Patient:</strong> {patientName} ({patientEmail})
        </p>
        <p>
          <strong>Doctor:</strong> {doctorName} ({doctorEmail})
        </p>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Date</label>
        <input
          type="datetime-local"
          value={
            appointment.date
              ? new Date(appointment.date).toISOString().slice(0, 16)
              : ""
          }
          onChange={(e) => {
            setAppointment((prev) => ({
              ...prev,
              date: new Date(e.target.value).toISOString(),
            }));
            setDateModified(true); // on marque que la date a été modifiée
          }}
          className="border p-2 w-full"
          disabled={!canEditDate} // désactive si status != SCHEDULED
        />
        {!canEditDate && (
          <p className="text-gray-500 text-sm mt-1">
            Date can only be modified when status is SCHEDULED
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
        </select>
      </div>

      {/* Bouton Update toujours visible, mais désactivé si status=SCHEDULED et date non modifiée */}
      <button
        onClick={handleUpdate}
        disabled={isUpdateDisabled}
        className={`px-4 py-2 rounded text-white ${
          isUpdateDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Update Appointment
      </button>
    </div>
  );
}
