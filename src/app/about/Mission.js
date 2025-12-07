import Image from "next/image";

const Mission = () => {
  return (
    <section className="relative w-full px-5%  bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[100px]">
            {/* Image */}
            <div className="flex justify-center items-center order-2 lg:order-1 p-8 relative">
              <div>
                <Image
                  src="/mission.jpg"
                  alt="Mission MedCare"
                  className="rounded-xl shadow-lg"
                  fill
                />
              </div>
            </div>

            {/* Texte de mission */}
            <div className="flex flex-col justify-center items-start order-1 lg:order-2 relative">
              <div className="uppercase text-blue text-xl tracking-[0.08em] font-semibold mb-3">
                Notre Mission
              </div>
              <h5 className="mb-4 text-2xl font-semibold text-textPrimary">
                Simplifier la santé pour tous
              </h5>
              <p className="text-lg text-textSecondary leading-[2]">
                MedCare a pour mission de connecter les professionnels de santé
                et les patients,
                <br />
                en rendant la gestion des cliniques plus simple et les soins
                plus humains, accessibles et organisés pour tous.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
