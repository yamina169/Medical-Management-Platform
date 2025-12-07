"use client";

import { useState, useEffect } from "react";
import AdminCard from "@/components/dashboard/AdminCard";
import Statistics from "@/components/dashboard/Statistics";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur complet depuis localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // stocke tout l'objet user
      console.log("User ID:", parsedUser.id); // afficher l'ID dans la console
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-5">
      <Statistics />

      <AdminCard user={user} />
    </div>
  );
}
