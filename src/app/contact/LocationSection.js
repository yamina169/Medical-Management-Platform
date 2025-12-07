import { locationsData } from "@/constants/index";
const LocationSection = () => {
  return (
    <section className="relative w-full px-[5%] py-[60px] md:py-[100px] bg-gradient-to-b from-white via-blue/5 to-white">
      <div className="mx-auto max-w-[1080px]">
        {/* Titre général */}
        <div className="flex flex-col justify-center items-center text-center max-w-xl mx-auto">
          <div className="heading-detail text-blue mb-2">Nos Bureaux</div>
          <h4 className="text-2xl md:text-3xl font-semibold text-textPrimary">
            Venez nous découvrir
          </h4>
        </div>

        {/* Cartes des emplacements */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {locationsData.map((loc, index) => (
            <div
              key={index}
              className="w-full max-w-sm p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 text-center bg-white"
            >
              <h6 className="text-xl font-semibold text-blue mb-2">
                {loc.city}
              </h6>
              <hr className="my-4 border-gray-300" />
              <p className="text-textSecondary">{loc.address}</p>
              <p className="text-textSecondary mb-6">{loc.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
