"use client";

import { useState, useEffect } from "react";
import AdminCard from "@/components/dashboard/AdminCard";
import Statistics from "@/components/dashboard/Statistics";

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
          <Statistics />
          <AdminCard user={user} />
        </>
      )}

      {user.role === "ADMIN_CLINIC" && (
        <div className="p-6 bg-white rounded-2xl shadow-md text-center text-xl font-medium">
          Hello, {user.name || "Clinic Admin"}!
        </div>
      )}
    </div>
  );
}
