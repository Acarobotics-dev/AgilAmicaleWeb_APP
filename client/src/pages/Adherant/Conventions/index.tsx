/* eslint-disable @typescript-eslint/no-explicit-any */
import NavbarSection from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { getAllConventions } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { ConventionCard } from "./conventionCard";
import { useState, useMemo, useCallback } from "react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { PaginationComponent } from "@/components/common/paginationComponent";

const ITEMS_PER_PAGE = 6;

const ConventionsPage = () => {
  const {
    data: { data: conventions = [] } = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conventions"],
    queryFn: getAllConventions,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter conventions by title
  const filteredConventions = useMemo(() => {
    return conventions.filter((conv: any) =>
      conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conventions, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredConventions.length / ITEMS_PER_PAGE);
  const paginatedConventions = useMemo(
    () =>
      filteredConventions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredConventions, currentPage]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  // Reset to page 1 when search changes
  // eslint-disable-next-line
  useMemo(() => { setCurrentPage(1); }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse" />
            <TailChase size={64} color="#eab308" />
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chargement des conventions
            </h3>
            <p className="text-gray-500">
              Veuillez patienter pendant que nous récupérons les données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Erreur de chargement
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              Une erreur s'est produite lors du chargement des conventions. Veuillez réessayer.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavbarSection />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-white to-gray-50/20 pt-32 pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,0,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse" />
            Nos Partenariats
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              Conventions Partenaires
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12">
            Découvrez nos conventions partenaires et profitez d'avantages exclusifs
            réservés aux membres de l'Amicale AGIL.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{conventions.length}+</div>
              <div className="text-gray-500 font-medium">Partenaires</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">20%</div>
              <div className="text-gray-500 font-medium">Réduction moyenne</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-500 font-medium">Avantages exclusifs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="w-full lg:w-96">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500/80 group-focus-within:text-yellow-500 transition-colors" />
                  <Input
                    placeholder="Rechercher une convention..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 h-14 border-gray-200 rounded-2xl bg-gray-100 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200 text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center px-4 py-3 bg-gray-100 rounded-xl border border-gray-200">
                  <Filter className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-900/90 font-medium">
                    {filteredConventions.length} convention{filteredConventions.length > 1 ? "s" : ""} trouvée{filteredConventions.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {filteredConventions.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 mb-6">
                  <Search className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Aucune convention trouvée
                </h3>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  Nous n'avons pas trouvé de convention correspondant à vos critères de recherche.
                </p>

              </div>
            </div>
          ) : (
            <>
              {/* Grid of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedConventions.map((convention: any, index: number) => (
                  <div
                    key={convention._id}
                    className="transform hover:-translate-y-2 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ConventionCard convention={convention} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center">
                  <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ConventionsPage;