"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BuildingOfficeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClinicAdminStatistics() {
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    let mounted = true;
    async function fetchClinic() {
      try {
        setLoading(true);
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          if (!mounted) return;
          setError("Aucun token trouvé.");
          return;
        }

        // décodage token
        let userId;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload?.id;
        } catch (e) {
          if (!mounted) return;
          setError("Token invalide.");
          return;
        }

        if (!userId) {
          if (!mounted) return;
          setError("User ID introuvable dans le token.");
          return;
        }

        const res = await fetch(`/api/clinics?id=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`API ${res.status} ${txt}`);
        }

        const data = await res.json();
        if (!mounted) return;

        if (!data?.clinic) {
          setError("Aucune clinique trouvée pour cet utilisateur");
          return;
        }

        // On combine la clinique et les totals/counts
        setClinic({
          ...data.clinic,
          counts: data.counts ?? {},
          totals: data.totals ?? {},
        });
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || "Une erreur est survenue.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchClinic();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Construire une map month -> amount à partir de clinic.totals.revenueByMonth ou totals.revenueByMonth/invoiceByMonth ---
  const revenueMap = useMemo(() => {
    const map = {};
    const arr = clinic?.totals?.revenueByMonth ?? clinic?.totals?.amounts ?? [];
    if (!Array.isArray(arr)) return map;
    for (const it of arr) {
      if (!it?.month) continue;
      const num = Number(it.amount ?? it.revenue ?? it.value ?? 0);
      map[it.month] = Number.isFinite(num) ? num : 0;
    }
    return map;
  }, [clinic]);

  // années disponibles (ex: "2025")
  const yearOptions = useMemo(() => {
    const arr = Object.keys(revenueMap);
    if (!arr.length) {
      return Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));
    }
    const years = new Set(arr.map((m) => String(m).slice(0, 4)));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [revenueMap, now]);

  // s'assurer que selectedYear est valide
  useEffect(() => {
    if (!yearOptions || !yearOptions.length) return;
    if (!yearOptions.includes(String(selectedYear))) {
      setSelectedYear(Number(yearOptions[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearOptions]);

  // tableau des 12 mois de l'année sélectionnée
  const yearMonthlyArray = useMemo(() => {
    const arr = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      const key = `${selectedYear}-${month}`;
      return revenueMap[key] ?? 0;
    });
    return arr;
  }, [revenueMap, selectedYear]);

  const annualTotal = useMemo(
    () => yearMonthlyArray.reduce((s, v) => s + (Number(v) || 0), 0),
    [yearMonthlyArray]
  );

  const fmt = (n) =>
    n === "..." || n === null
      ? n
      : Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const monthNamesShort = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  // Top cards pour la clinique
  const topCards = [
    {
      title: "Médecins",
      value: clinic ? clinic.counts?.doctors ?? 0 : "...",
      icon: <CreditCardIcon className="h-6 w-6" />,
      description: "Nombre de médecins actifs rattachés",
      color: "bg-purple-500",
    },
    {
      title: "Patients",
      value: clinic ? clinic.counts?.patients ?? 0 : "...",
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      description: "Nombre de patients actifs",
      color: "bg-blue-500",
    },
    {
      title: "Réceptionnistes",
      value: clinic ? clinic.counts?.receptionists ?? 0 : "...",
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      description: "Nombre de réceptionnistes actifs",
      color: "bg-green-500",
    },
  ];

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">Erreur : {error}</p>;
  if (!clinic) return <p>Aucune donnée trouvée.</p>;

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Statistiques — {clinic.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topCards.map((card) => (
          <div
            key={card.title}
            className={`flex items-center justify-between gap-4 p-6 bg-gradient-to-r from-white/70 to-white/40 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-xl ${card.color} text-white shadow-xl flex items-center justify-center`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {fmt(card.value)}
                </p>
                <p className="mt-2 text-xs text-gray-400">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-green-500 text-white shadow-md">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Revenu Annuel
              </p>
              <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-gray-900">
                {`${fmt(annualTotal)} TND`}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Montant total pour l'année{" "}
                <span className="font-medium text-gray-700">
                  {selectedYear}
                </span>
                . Données extraites des montants d'invoices de la clinique.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border px-2 py-1 rounded-lg text-xs bg-gray-50 shadow focus:ring-1 focus:ring-green-500 focus:outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={Number(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearMonthlyArray.map((val, idx) => ({
                month: monthNamesShort[idx],
                revenue: val,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis tickLine={false} axisLine={{ stroke: "#d1d5db" }} />
              <Tooltip
                formatter={(value) => `${value} TND`}
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
