"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const subscriptionPlans = [
  {
    name: "FREE",
    price: "0 TND",
    duration: "1 mois",
    description: [
      "Gestion de clinique",
      "Accès limité aux fonctionnalités",
      "Stockage limité",
    ],
  },
  {
    name: "PRO",
    price: "150 TND",
    duration: "3 mois",
    description: [
      "Gestion complète de la clinique",
      "Accès à toutes les fonctionnalités",
      "Stockage illimité",
    ],
    popular: true,
  },
  {
    name: "ENTERPRISE",
    price: "280 TND",
    duration: "6 mois",
    description: [
      "Gestion complète + portrait patient",
      "Support premium",
      "Stockage illimité",
    ],
  },
];

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const router = useRouter();

  const handleSelectPlan = (plan) => setSelectedPlan(plan);

  const handleProceed = () => {
    if (!selectedPlan) return alert("Veuillez sélectionner un plan !");
    router.push(
      `/register?subscriptionType=${selectedPlan.name}&duration=${selectedPlan.duration}`
    );
  };

  return (
    <section className="py-16 px-5 bg-white font-main">
      <div className="max-w-5xl mx-auto text-center mb-7">
        <h2 className="text-2xl font-bold text-textPrimary pt-15 mb-5 ">
          Choisissez votre plan d'abonnement
        </h2>
        <p className="text-textSecondary text-lg">
          Sélectionnez le plan qui correspond le mieux à votre clinique.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan, index) => (
          <div
            key={index}
            onClick={() => handleSelectPlan(plan)}
            className={`relative flex flex-col items-start p-8 rounded-2xl bg-white border transition-all duration-300 shadow hover:shadow-lg cursor-pointer ${
              selectedPlan?.name === plan.name
                ? "border-blue text-white bg-blue"
                : "border-borderColor"
            }`}
          >
            {plan.popular && (
              <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Populaire
              </span>
            )}
            {selectedPlan?.name === plan.name && (
              <span className="absolute top-4 right-4 bg-blue text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                Sélectionné
              </span>
            )}

            <h3 className="text-xl font-semibold text-textPrimary mb-2">
              {plan.name}
            </h3>
            <p className="text-2xl font-bold text-blue mb-2">{plan.price}</p>
            <p className="text-textSecondary mb-4">{plan.duration}</p>

            <ul className="list-disc pl-5 text-textSecondary space-y-1">
              {plan.description.map((desc, idx) => (
                <li key={idx}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <button
          onClick={handleProceed}
          className="px-10 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue/90 transition-shadow shadow"
        >
          S'abonner
        </button>
      </div>
    </section>
  );
};

export default SubscriptionPage;
