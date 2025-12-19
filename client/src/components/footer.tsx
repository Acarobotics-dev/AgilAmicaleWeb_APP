import { Separator } from "@/components/ui/separator";
import Logo from "@/assests/AGILLogo.webp";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Menu Principale",
    links: [
      {
        title: "Accueil",
        href: "/",
      },
      {
        title: "Conventions",
        href: "/conventions",
      },
      {
        title: "Contacter Nous",
        href: "/contact",
      },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t border-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,0,0.03),transparent_50%)]"></div>
      <div className="relative z-10">
        <div className="max-w-screen-xl mx-auto py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src={Logo}
                alt="AGIL Logo"
                className="w-32 h-32 object-contain"
              />
              <div>
                <h3 className="text-2xl font-bold text-white">AGIL</h3>
                <p className="text-yellow-500 font-medium">Amicale</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              L'énergie qui vous fait avancer -
              <span className="text-yellow-500 font-semibold"> AGIL</span>
            </p>
            <div className="flex space-x-4 pt-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer">
                <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer">
                <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer">
                <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {footerSections.map(({ title, links }) => (
            <div key={title} className="space-y-6">
              <h6 className="font-bold text-white text-lg border-b border-yellow-500/30 pb-3">
                {title}
              </h6>
              <ul className="space-y-3">
                {links.map(({ title, href }) => (
                  <li key={title}>
                    <Link
                      to={href}
                      className="text-gray-300 hover:text-yellow-500 transition-all duration-300 hover:translate-x-1 inline-block group"
                    >
                      <span className="relative">
                        {title}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className="space-y-6">
            <h6 className="font-bold text-white text-lg border-b border-yellow-500/30 pb-3">
              Contact
            </h6>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span>gestion@amicaleagil.org</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span>71707222</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span>BP 762 Ave Mohamed Ali Akid Tunis 1003</span>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8 border-gray-800/50" />

        <div className="max-w-screen-xl mx-auto py-6 flex flex-col md:flex-row items-center justify-between gap-4 px-6">
          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-gray-300 text-center md:text-start flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Signature :
              <span className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors">
                L'amicale AGIL
              </span>
            </span>
            <span className="text-gray-300 text-center md:text-start flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Développé par :
              <a
                href="https://acaroboticsplatform.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400 transition-colors font-semibold hover:underline"
              >
                AcaROBOTICS
              </a>{" "}
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          {/* Back to top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center justify-center w-10 h-10 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg
              className="w-5 h-5 text-yellow-500 transform group-hover:-translate-y-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
