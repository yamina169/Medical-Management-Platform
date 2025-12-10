"use client";

import { useState, useEffect } from "react";
import AdminCard from "@/components/dashboard/AdminCard";
import StatisticsSuperAdmin from "@/components/dashboard/StatisticsSuperAdmin";
import ClinicAdminStatics from "@/components/dashboard/ClinicAdminStatics";
import AppointmentsPage from "@/app/dashboard/doctor-dashboard/appointments/page";
import PatientsPage from "@/app/dashboard/receptionist-dashboard/patients/page"; // <-- page pour réceptionniste
import AppointmentsReceptionistPage from "@/app/dashboard/receptionist-dashboard/appointments/page"; // liste RDV réceptionniste

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log("User ID:", parsedUser.id);
      console.log("User Role:", parsedUser.role);
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-5">
      {user.role === "SUPERADMIN" && (
        <>
          <StatisticsSuperAdmin />
          <AdminCard user={user} />
        </>
      )}

      {user.role === "ADMIN_CLINIC" && <ClinicAdminStatics user={user} />}

      {user.role === "DOCTOR" && <AppointmentsPage />}

      {user.role === "RECEPTIONIST" && (
        <>
          {/* Liste des patients */}
          <PatientsPage />

          {/* Liste des rendez-vous que la réceptionniste peut gérer */}
        </>
      )}
    </div>
  );
}
