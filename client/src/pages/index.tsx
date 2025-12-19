import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone } from "lucide-react";
import "ldrs/react/TailChase.css";
import HeroImg from "@/assests/heroimg.webp";
import agilImg from "@/assests/agil-1-1.webp";
import imageamicale from "@/assests/amicale-3.webp";
import f1 from "@/assests/f1.webp";
import f2 from "@/assests/f2.webp";
import f3 from "@/assests/f3.webp";

// Add CSS animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
    opacity: 0;
  }

  .animation-delay-400 {
    animation-delay: 0.4s;
    opacity: 0;
  }

  .animation-delay-600 {
    animation-delay: 0.6s;
    opacity: 0;
  }

  .animation-delay-1000 {
    animation-delay: 1s;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-3000 {
    animation-delay: 3s;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}



const features = [
  {
    title: "Séjour Maison",
    description: "Profitez d'un séjour confortable dans nos maisons équipées pour un repos absolu.",
    image: f1,

  },
  {
    title: "Séjour Hôtels",
    description: "Découvrez nos hôtels partenaires pour un service haut de gamme et un accueil chaleureux.",
    image: f2,

  },
  {
    title: "Événements",
    description: "Participez à nos événements exclusifs pour des moments mémorables et enrichissants.",
    image: f3,

  },
];

const LandingPage = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 sm:px-6 py-20 text-white overflow-hidden">
        {/* Background with parallax effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-110"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%), url(${HeroImg})`,
          }}
        />

        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-500/5" />

        {/* Floating particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400/30 rounded-full animate-ping animation-delay-1000" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-300/20 rounded-full animate-bounce animation-delay-3000" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse" />
            Bienvenue chez AGIL Amicale
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8 animate-fade-in-up animation-delay-200">
            L'énergie qui vous fait avancer
            <br />
            <span className="relative inline-block">
              <span className="text-yellow-400 relative z-10">AGIL</span>
              <span className="absolute inset-0 bg-yellow-400/20 blur-xl transform scale-110" />
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Que vous soyez passionné par les Vacances, avide de découvertes
            culturelles, engagé dans le social ou simplement en quête de loisirs
            enrichissants, nous vous offrons un large éventail d'activités pour
            nourrir vos passions et créer des liens durables.
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up animation-delay-600">
            <Link to="/signup" aria-label="S'inscrire">
              <Button
                size="lg"
                className="group relative rounded-full text-base bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-primary-foreground font-semibold px-8 py-4 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 transform hover:-translate-y-1 hover:scale-105"
              >
                S'inscrire
                <ArrowUpRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </Link>
            <Link to="/contact" aria-label="Contactez-nous">
              <Button
                size="lg"
                className="group relative rounded-full border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 transition-all duration-300 shadow-xl hover:shadow-white/20 transform hover:-translate-y-1"
              >
                <Phone className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
                Contactez-nous
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent_50%)]" />

        <div className="relative max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 px-4 sm:px-6 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            {/* Section badge */}
            <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-600 text-sm font-medium">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
              À propos de nous
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
              Qui sommes-nous
              <br />
              <span className="relative inline-block">
                <span className="text-yellow-500">AGIL</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 L100,12 L0,12 Z" fill="rgba(234, 179, 8, 0.3)" />
                </svg>
              </span>
              ?
            </h2>

            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                La Société Nationale de Distribution des Pétroles est un acteur majeur
                de l'énergie en Tunisie, dédié à fournir des produits pétroliers de haute
                qualité à travers un vaste réseau de stations-service, de stations portuaires
                et de dépôts aéroportuaires.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Forte de plus de six décennies d'expérience,
                AGIL s'engage à innover continuellement pour répondre aux besoins évolutifs
                de sa clientèle et contribuer au développement économique du pays.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">60+</div>
                <div className="text-sm text-gray-600 font-medium">Années d'expérience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">500+</div>
                <div className="text-sm text-gray-600 font-medium">Stations-service</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">1M+</div>
                <div className="text-sm text-gray-600 font-medium">Clients satisfaits</div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative group">
            {/* Image container with decorative elements */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
              <img
                src={agilImg}
                alt="AGIL entreprise"
                loading="lazy"
                className="relative w-full h-auto max-h-[600px] object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-900">Leader en Tunisie</div>
                <div className="text-xs text-gray-600">Distribution pétrolière</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-screen-xl w-full px-4 sm:px-6 mx-auto">
          <div className="text-center mb-16">
            {/* Section badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Nos Services
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900">
              Découvrez Nos
              <br />
              <span className="relative inline-block">
                <span className="text-yellow-500">Services</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 L100,12 L0,12 Z" fill="rgba(234, 179, 8, 0.3)" />
                </svg>
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nous offrons une variété de services premium pour répondre à tous vos besoins
              de voyage et de loisirs avec excellence et professionnalisme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    Premium
                  </div>
                </div>

                <div className="relative p-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>


                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-yellow-400/20 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* CTA Section */}

        </div>
      </section>

      {/* Amicale Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.08),transparent_50%)]" />

        <div className="relative max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 px-4 sm:px-6 items-center">
          <div className="relative group order-2 lg:order-1">
            {/* Image container with decorative elements */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
              <img
                src={imageamicale}
                alt="Amicale AGIL"
                loading="lazy"
                className="relative w-full h-auto max-h-[600px] object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay elements */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-900">Communauté AGIL</div>
                <div className="text-xs text-gray-600">Plus de 1000 membres</div>
              </div>

              {/* Floating stats */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                <div className="text-lg font-bold text-green-500">100+</div>
                <div className="text-xs text-gray-600">Événements annuels</div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            {/* Section badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-600 text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Notre Amicale
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
              Qu'est-ce que
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  AGIL AMICALE
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 L100,12 L0,12 Z" fill="url(#gradient)" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(234, 179, 8, 0.3)" />
                      <stop offset="100%" stopColor="rgba(234, 197, 94, 0.3)" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              ?
            </h2>

            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                L'Amicale des employés et retraités d'AGIL est une structure sociale et humaine créée
                pour renforcer la solidarité, le bien-être et la convivialité au sein
                de la grande famille AGIL.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Elle propose une palette variée d'activités
                culturelles, sportives, sociales et récréatives ainsi que des services
                exclusifs via des partenariats avantageux.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Activités Culturelles</h4>
                  <p className="text-sm text-gray-600">Expositions, conférences, voyages</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Sport & Loisirs</h4>
                  <p className="text-sm text-gray-600">Tournois, clubs sportifs</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Solidarité</h4>
                  <p className="text-sm text-gray-600">Entraide, soutien communautaire</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Partenariats</h4>
                  <p className="text-sm text-gray-600">Avantages exclusifs</p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;