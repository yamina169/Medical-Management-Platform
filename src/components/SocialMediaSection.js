import React from "react";
import { socials } from "@/constants/index"; // ✅ import centralisé

const SocialMediaSection = () => {
  return (
    <section className="relative w-full px-[5%] py-[60px] md:py-[100px] bg-white">
      <div className="mx-auto max-w-6xl flex flex-col items-center text-center">
        <div className="heading-detail text-blue mb-2">Suivez-nous</div>
        <h4 className="text-2xl md:text-3xl font-semibold text-textPrimary mb-8">
          Restez connectés avec MedCare
        </h4>

        <div className="flex gap-6">
          {socials.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-14 h-14 rounded-full bg-blue/10 hover:bg-blue/20 transition-colors"
              aria-label={social.name}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
