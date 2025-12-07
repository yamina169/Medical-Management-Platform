"use client";

import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function ClinicsPage() {
  // Exemple de données (à remplacer par fetch API)
  const [clinics, setClinics] = useState([
    { id: 1, name: "Clinique A", phone: "12345678", address: "Rue A" },
    { id: 2, name: "Clinique B", phone: "87654321", address: "Rue B" },
  ]);

  // Fonction de suppression
  const handleDelete = (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this clinic?"
    );
    if (confirmDelete) {
      setClinics(clinics.filter((clinic) => clinic.id !== id));
      // Ici plus tard : fetch DELETE vers ton API
      // fetch(`/api/clinics/${id}`, { method: "DELETE" })
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-textPrimary mb-6">Clinics</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clinics.map((clinic) => (
              <tr key={clinic.id}>
                <td className="px-6 py-4 whitespace-nowrap text-textPrimary">
                  {clinic.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-textPrimary">
                  {clinic.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-textPrimary">
                  {clinic.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                  <Link
                    href={`/dashboard/superadmin/clinics/${clinic.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(clinic.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
