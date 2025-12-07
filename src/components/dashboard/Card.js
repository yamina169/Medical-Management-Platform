"use client";

import {
  BuildingOfficeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";

const cardsData = [
  {
    title: "Clinics",
    value: 128,
    icon: <BuildingOfficeIcon className="h-6 w-6" />,
  },
  {
    title: "Subscriptions",
    value: 256,
    icon: <CreditCardIcon className="h-6 w-6" />,
  },
  {
    title: "Revenue",
    value: "$12,480",
    icon: <CurrencyDollarIcon className="h-6 w-6" />,
  },
];

export default function CardsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardsData.map((card) => (
        <div
          key={card.title}
          className="flex flex-col justify-between p-6 rounded-3xl
          bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1
          transition-all duration-300 cursor-pointer font-main"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">{card.title}</h3>

            {/* Icon Badge */}
            <div className="p-3 rounded-xl bg-blue text-white shadow-md flex items-center justify-center">
              {card.icon}
            </div>
          </div>

          {/* Value */}
          <p className="mt-5 text-2xl font-bold text-primary">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
