import { processData } from "@/constants/index";

const ProcessSection = () => {
  return (
    <section className="py-20 px-[5%]">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="heading-detail">Comment ça fonctionne</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Suivez ces étapes simples pour profiter pleinement de MedCare.
        </p>
      </div>

      {/* Liste verticale */}
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        {processData.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">{item.icon}</div>
            <div>
              <span className="text-blue font-bold">Étape {item.step}</span>
              <h3 className="text-lg font-semibold mt-1">{item.title}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProcessSection;
