import React from "react";
import { valuesData } from "@/constants"; // ✅ Import centralisé

const Values = () => {
  return (
    <section className="relative w-full px-[5%] py-[60px] md:py-[80px] bg-white">
      <div className="mx-auto max-w-6xl">
        {/* Titre général */}
        <div className="relative mx-auto flex flex-col justify-center items-center max-w-xl text-center">
          <div className="heading-detail">Nos Valeurs</div>
          <h4 className="text-2xl font-semibold text-textPrimary">
            Respect, collaboration et confiance au service de la santé
          </h4>
        </div>

        {/* Cartes des valeurs */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {valuesData.map((value, index) => (
            <div
              key={index}
              className="w-full p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 text-center"
            >
              <div className="flex justify-center items-center h-14 w-14 bg-blue rounded-full mb-6 mx-auto">
                {value.icon}
              </div>
              <h6 className="text-lg font-semibold mb-2 text-textPrimary">
                {value.title}
              </h6>
              <p className="text-base text-textSecondary">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
