import Image from "next/image";

const Story = () => {
  return (
    <section className="relative w-full py-[100px]">
      <div className="mx-auto max-w-7xl">
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[100px]">
            <div className="flex flex-col justify-center items-start relative">
              <span className="uppercase text-blue text-xl tracking-[0.08em] font-semibold mb-3">
                Notre Histoire
              </span>
              <h5 className="mb-4 text-2xl md:text-3xl font-bold text-textPrimary leading-tight">
                L’innovation au service de la santé
              </h5>
              <p className="text-lg text-textSecondary leading-[2]">
                MedCare est née de l’idée de jeunes étudiants passionnés par le
                développement et la santé.
                <br /> Ils ont imaginé une plateforme qui simplifie la gestion
                des cliniques et rend les soins plus humains, organisés et
                accessibles à tous.
              </p>
            </div>

            <div className="flex justify-center items-center p-8 relative">
              <div className="">
                <Image fill className="h-[300px] w-[500px]" src="/equipe.jpg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
