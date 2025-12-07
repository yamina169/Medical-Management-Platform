import React from "react";
import { featuresData, featuresHeader } from "@/constants/index";

const Features = () => {
  return (
    <section className="bg-gradient-to-b from-white via-blue/5 to-white p-[10%]">
      {/* Titre principal */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="heading-detail">{featuresHeader.title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          {featuresHeader.description}
        </p>
      </div>

      {/* Cartes des services */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex justify-center items-center w-20 h-20 mb-6 rounded-full bg-blue/10 group-hover:bg-blue/20 transition-colors duration-300">
              {feature.icon}
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
