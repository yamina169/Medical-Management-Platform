import Image from "next/image";
import { aboutContent } from "@/constants/index";

const About = () => {
  return (
    <section className="relative w-full py-[120px] bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          {/* Image */}
          <div className="relative w-[80%] md:w-[85%] aspect-[3/2] flex justify-center items-center">
            <Image
              src="/about.jpeg"
              alt="MedCare platform overview"
              fill
              className="rounded-2xl shadow-lg object-cover"
            />
          </div>

          {/* Texte */}
          <div className="flex flex-col justify-center items-start">
            <span className="uppercase text-xl text-blue tracking-[0.08em] font-semibold mb-4">
              {aboutContent.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
              {aboutContent.title}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-xl text-center md:text-left mb-4">
              {aboutContent.description1}
            </p>
            <p className="text-base md:text-lg text-gray-600 max-w-xl text-center md:text-left">
              {aboutContent.description2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
