import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import ContactUs from "@/components/ContactUs";

export default function Home() {
  return (
    <div className="relative w-full">
      <Hero />
      <About />
      <Features />
      <ContactUs />
    </div>
  );
}
