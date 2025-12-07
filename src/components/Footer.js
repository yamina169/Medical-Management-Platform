import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="overflow-x-hidden px-5 sm:px-10 py-5 bg-primary">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          {/* Logo + description */}
          <div className="flex flex-col md:max-w-md">
            <Image
              src="/logo-white.svg" // chemin depuis public/
              className="mb-4 w-36"
              alt="Logo"
              width={144} // largeur correspondant à w-36 (36*4)
              height={36} // ajuste selon ton SVG
            />
            <p className="text-whiteText ">
              Une plateforme centralisée pour optimiser la gestion des
              établissements de santé.
            </p>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex gap-5 md:justify-end md:items-center">
            {["/facebook.png", "/instagram.png", "/twitter.png"].map(
              (icon, idx) => (
                <Link
                  key={idx}
                  href="#"
                  target="_blank"
                  className="w-10 h-10 rounded-md flex justify-center items-center border border-whiteText/20 hover:border-whiteText hover:bg-whiteText/10 transition-all duration-200"
                >
                  <Image
                    src={icon}
                    width={20}
                    height={20}
                    alt="Icône de réseau social"
                  />
                </Link>
              )
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-whiteText/10 pt-6 text-whiteText text-sm text-center">
          &copy; {new Date().getFullYear()} Medcare. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
