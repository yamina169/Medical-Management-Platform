import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="w-full overflow-x-hidden relative px-[5%] pt-36">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Texte de gauche */}
          <div className="flex pb-[100px] flex-col justify-center items-start">
            <p className="uppercase tracking-[0.05em] text-xl font-semibold mb-4 text-blue animate-fadeInDown">
              Bienvenue sur Medcare
            </p>
            <h1 className="text-5xl font-bold mb-6 leading-tight animate-fadeInDown animate-delay-200">
              Facilitez les soins <br />
              Améliorez la vie
            </h1>
            <p className="text-xl lg:text-xl leading-8 mb-8 text-gray-500 animate-fadeInDown animate-delay-400">
              Une plateforme complète pour la gestion des établissements de
              santé
            </p>
            <div className="mt-6">
              <Link
                href="/subscribe"
                className="primary-button text-lg flex items-center gap-2 group transform transition-transform duration-300 hover:scale-105"
              >
                Commencer
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2 "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image de droite */}
          <div className="relative flex items-center z-10 animate-fadeInUp">
            <Image
              src="/Doctor.png"
              alt="Doctor Illustration"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Background color */}
      <div className="absolute md:left-auto left-0 top-auto lg:top-0 right-0 bottom-0 h-[20%] md:h-[30%] lg:w-[33%] w-full lg:h-full bg-secondary"></div>
    </section>
  );
};

export default Hero;
