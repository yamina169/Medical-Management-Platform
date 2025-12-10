"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Le backend doit extraire doctorId depuis le token
      const res = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) setAppointments(data.data);
    } catch (err) {
      console.error("Fetch appointments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <p>Loading appointments...</p>;
  if (!appointments.length) return <p>No appointments found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Patient</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((app) => (
            <tr key={app.id}>
              <td className="border p-2">
                {app?.patient?.user?.name || "Unknown"}
              </td>
              <td className="border p-2">
                {new Date(app.date).toLocaleString()}
              </td>
              <td className="border p-2">{app.status}</td>
              <td className="border p-2">
                <Link
                  href={`/dashboard/doctor-dashboard/appointments/${app.id}`}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
