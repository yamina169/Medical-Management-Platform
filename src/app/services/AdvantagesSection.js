import { advantagesData } from "@/constants/index";

const AdvantagesSection = () => {
  return (
    <section className="py-[60px] px-[5%] bg-white">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="heading-detail">Pourquoi choisir MedCare</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Découvrez les avantages qui rendent la gestion de votre clinique
          simple et efficace.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {advantagesData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-blue/5 hover:bg-blue/10 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex justify-center items-center w-16 h-16 mb-4 rounded-full bg-blue/80">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-textPrimary">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdvantagesSection;
