import React from "react";
import Form from "./Form";

const ContactUs = () => {
  return (
    <section className=" px-5% py-[80px] md:py-[120px]">
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="text-blue text-xl uppercase tracking-[0.08em] font-semibold">
            Contactez-nous
          </span>
          <h2 className="text-3xl font-bold text-textPrimary mt-4 leading-snug">
            Nous sommes là pour vous aider
          </h2>
          <p className="text-textSecondary mt-4 text-base md:text-lg leading-7">
            N'hésitez pas à nous envoyer vos questions ou demandes. Notre équipe
            vous répondra dans les plus brefs délais.
          </p>
        </div>

        {/* Form */}
        <div className="w-full  p-8 md:p-12 rounded-2xl shadow-lg">
          <Form />
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
