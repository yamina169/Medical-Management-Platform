"use client";

import React, { useState } from "react";
import { navLinks } from "@/constants/index";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute z-50 top-0 right-0 left-0">
      <div className="bg-white lg:bg-transparent relative h-[100px] px-5% w-full">
        <div className="flex w-full h-full mx-auto max-w-7xl justify-between items-center">
          {/* Logo */}
          <Link href="/" aria-label="home" className="relative w-66 h-22">
            <Image
              src="/logo.svg"
              alt="Main Logo"
              fill
              className="object-contain"
            />
          </Link>
          {/* NavLinks */}
          <nav
            className={`lg:relative ${
              isOpen ? "translate-y-0" : "-translate-y-full"
            } bg-white lg:bg-transparent absolute lg:h-auto right-0 left-0 lg:translate-y-0 duration-[400ms] lg:duration-0 ease-out top-0 lg:z-10 -z-10 w-full lg:w-auto pt-20 lg:pt-0 pb-5 lg:pb-0`}
          >
            <ul className="flex flex-col gap-4 lg:gap-10 lg:flex-row pt-10 lg:pt-0 lg:items-center lg:justify-center">
              {navLinks.map((navlink, index) => (
                <li key={index}>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href={navlink.href}
                    className="text-lg text-textPrimary hover:text-blue transition-colors duration-300"
                  >
                    {navlink.Title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign In / Sign Up + menu mobile */}
          <div className="flex gap-3 z-40 items-center">
            <Link
              href="/login"
              className="hidden lg:flex p-3 border border-gray-800 rounded hover:bg-gray-100 transition text-lg hover:text-blue"
            >
              Connexion
            </Link>
            <Link
              href="/subscription"
              className="hidden lg:flex p-3 bg-primary text-white rounded hover:bg-blue transition text-lg"
            >
              S’abonner
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
              className={`relative w-10 h-10 flex justify-center items-center z-40 ${
                isOpen ? "bg-secondary" : "bg-primary"
              } lg:hidden rounded`}
            >
              <Menu size={18} color={`${isOpen ? "black" : "white"}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
