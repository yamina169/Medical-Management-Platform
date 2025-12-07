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

export default function Statics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/clinics?stats=true", { headers });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`API ${res.status} ${text}`);
        }
        const data = await res.json();
        if (!mounted) return;
        setStats(data);
      } catch (err) {
        console.error("Erreur stats:", err);
        if (mounted) setStats(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const revenueMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(stats?.monthlyRevenue)) return map;
    for (const item of stats.monthlyRevenue) {
      if (!item?.month) continue;
      const rev = Number(item.revenue);
      map[item.month] = Number.isFinite(rev) ? rev : 0;
    }
    return map;
  }, [stats]);

  const yearOptions = useMemo(() => {
    if (Array.isArray(stats?.monthlyRevenue) && stats.monthlyRevenue.length) {
      const years = new Set(
        stats.monthlyRevenue.map((r) => String(r.month).slice(0, 4))
      );
      return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }
    return Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));
  }, [stats, now]);

  useEffect(() => {
    if (!yearOptions || !yearOptions.length) return;
    if (!yearOptions.includes(String(selectedYear))) {
      setSelectedYear(Number(yearOptions[0]));
    }
  }, [yearOptions, selectedYear]);

  const yearMonthlyArray = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      const key = `${selectedYear}-${month}`;
      return revenueMap[key] ?? 0;
    });
  }, [revenueMap, selectedYear]);

  const annualTotal = useMemo(
    () => yearMonthlyArray.reduce((sum, val) => sum + (Number(val) || 0), 0),
    [yearMonthlyArray]
  );

  const topCards = [
    {
      title: "Clinics Actives",
      value: loading ? "..." : stats?.activeClinics ?? 0,
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      description: "Nombre total des cliniques actives",
      color: "bg-blue-500",
    },
    {
      title: "Subscriptions Actives",
      value: loading ? "..." : stats?.activeSubscriptions ?? 0,
      icon: <CreditCardIcon className="h-6 w-6" />,
      description: "Abonnements PRO / ENTERPRISE actuellement actifs",
      color: "bg-purple-500",
    },
  ];

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
  const fmt = (n) =>
    n === "..." || n === null
      ? n
      : Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topCards.map((card) => (
          <div
            key={card.title}
            className={`flex items-center justify-between gap-4 p-6 bg-gradient-to-r from-white/70 to-white/40 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg hover:scale-105 transition-transform`}
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
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {fmt(card.value)}
                </p>
                <p className="mt-2 text-xs text-gray-400">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow w-full">
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
                {loading ? "..." : `${fmt(annualTotal)} TND`}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Montant total pour l'année{" "}
                <span className="font-medium text-gray-700">
                  {selectedYear}
                </span>
                . Calcul basé sur prix statiques par abonnement (PRO = 150,
                ENTREPRISE = 280) au mois de démarrage.
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
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
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
