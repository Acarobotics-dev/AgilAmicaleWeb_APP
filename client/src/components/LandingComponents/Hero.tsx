import { Button } from "@/components/ui/button";
import { ArrowUpRight, Phone } from "lucide-react";
import HeroImg from "@/assests/heroimg.webp";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center px-6 py-16 text-white "
      style={{
        backgroundImage: `url(${HeroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
          L'énergie qui vous fait avancer - AGIL
        </h1>

        <p className="mt-6 text-[17px] md:text-lg">
          Que vous soyez passionné par les Vacances, avide de découvertes
          culturelles, engagé dans le social ou simplement en quête de loisirs
          enrichissants, nous vous offrons un large éventail d’activités pour
          nourrir vos passions et créer des liens durables.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="rounded-full text-base">
              S'inscrire <ArrowUpRight className="!h-5 !w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full  border-white text-white hover:bg-card/20 hover:text-white"
            >
              <Phone className="!h-5 !w-5 mr-2" /> Contacter Nous
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;