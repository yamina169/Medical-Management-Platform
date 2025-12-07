import Header from "@/components/Header";
import Features from "@/components/Features";
import Mission from "./Mission";
import Story from "./Story";
import OurValues from "./OurValues";
import ContactUs from "@/components/ContactUs";

const page = () => {
  return (
    <div className="relative w-full mt-24">
      <Header
        Detail={"Bienvenue sur MedCare"}
        Title={"Soins organisation et suivi simplifiés"}
      />

      <div className=" h-[370px] bg-[url('/About-Header.png')] bg-no-repeat bg-cover bg-center" />
      <Story />
      <Mission />
      <OurValues />
    </div>
  );
};

export default page;
