"use client";

import React from "react";
import { Send } from "lucide-react";

const Form = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Grid des inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Nom"
          className="w-full px-5 py-3 border border-borderColor rounded-lg focus:outline-none text-textPrimary placeholder-gray-400 transition"
        />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          className="w-full px-5 py-3 border border-borderColor rounded-lg focus:outline-none text-textPrimary placeholder-gray-400 transition"
        />
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Numéro de téléphone"
          className="w-full px-5 py-3 border border-borderColor rounded-lg focus:outline-none text-textPrimary placeholder-gray-400 transition"
        />
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Objet"
          className="w-full px-5 py-3 border border-borderColor rounded-lg focus:outline-none text-textPrimary placeholder-gray-400 transition"
        />
      </div>

      {/* Textarea */}
      <textarea
        id="message"
        name="message"
        placeholder="Votre message..."
        maxLength={5000}
        className="w-full px-5 py-4 border border-borderColor rounded-lg focus:outline-none text-textPrimary placeholder-gray-400 transition min-h-[150px]"
      ></textarea>

      {/* Bouton */}
      <button
        type="submit"
        className="mt-6 w-full lg:w-auto py-3 px-10 bg-primary text-white font-medium rounded-lg hover:bg-blue transition duration-300 shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center gap-2"
      >
        Envoyer
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
};

export default Form;
