"use client";

import { useState, useEffect } from "react";
import AdminCard from "@/components/dashboard/AdminCard";
import StatisticsSuperAdmin from "@/components/dashboard/StatisticsSuperAdmin";
import ClinicAdminStatics from "@/components/dashboard/ClinicAdminStatics";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
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
      {user.role === "ADMIN_CLINIC" && (
        <>
          <ClinicAdminStatics user={user} />
        </>
      )}
      {/* Vous pouvez ajouter d'autres rôles ici si nécessaire */}
    </div>
  );
}
