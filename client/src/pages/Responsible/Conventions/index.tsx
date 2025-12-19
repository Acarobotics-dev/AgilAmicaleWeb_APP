import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConventionTableRow } from "./ConventionTableRow";
import { AddEditConventionForm } from "./AddEditConventionForm";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { getAllConventions, AddConventionService, UpdateConventionService } from "@/services";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { toast } from "sonner";
import { Convention } from "./types";
import { Search, File, FilePlus, X, ChevronDown, FileText, CheckCircle, Clock, Download } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Loading skeleton component
function ConventionsListSkeleton() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">
          {/* Header Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}

export function ConventionsSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState<Convention | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConventions, setFilteredConventions] = useState<Convention[]>([]);

  // Query to fetch conventions
  const {
    data: { data: conventions = [] } = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conventions"],
    queryFn: getAllConventions,
  });

  useEffect(() => {
    if (!searchQuery) {
      setFilteredConventions(conventions);
    } else {
      const filtered = conventions.filter((convention: Convention) =>
        convention.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConventions(filtered);
    }
    setCurrentPage(1);
  }, [conventions, searchQuery]);

  const handleActionComplete = () => refetch();
  const handleOpenDialog = () => {
    setInitialData(null);
    setOpen(true);
  };

  const totalPages = Math.ceil((filteredConventions.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentConventions = filteredConventions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (initialData?._id) {
        await UpdateConventionService(initialData?._id, formData);
        toast.success("Convention mise à jour avec succès!");
      } else {
        await AddConventionService(formData);
        toast.success("Convention ajoutée avec succès!");
      }
      setOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to save convention:", err);
      toast.error("Échec de l'enregistrement de la convention");
    }
  };

  // Calculate stats
  const stats = {
    total: conventions.length,
    visible: filteredConventions.length,
  };

  if (isLoading) {
    return <ConventionsListSkeleton />;
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
                <File className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Erreur de chargement
              </h3>
              <p className="text-gray-500 mb-6">
                Une erreur s'est produite lors du chargement des conventions. Veuillez réessayer.
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-full"
              >
                Réessayer
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">

          {/* Header Section */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SidebarTrigger className="mt-1" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <File className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des Conventions
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{conventions.length} conventions totales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{filteredConventions.length} conventions visibles</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full"
                  onClick={handleOpenDialog}
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Ajouter une Convention
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Total Conventions */}
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Total Conventions
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visible Conventions */}
            <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Conventions Actives
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.visible}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Archived (example) */}
            <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">
                      Archivées
                    </p>
                    <p className="text-3xl font-bold text-amber-900">
                      {stats.total - stats.visible}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Downloads (placeholder) */}
            <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">
                      Téléchargements
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {stats.total * 12}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Section */}
          <Card className="mb-6 bg-blue-500/5">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Recherche de conventions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher par titre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <File className="w-4 h-4 text-blue-600" />
                Liste des conventions
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {filteredConventions.length} résultats
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fichier
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentConventions.length > 0 ? (
                    currentConventions.map((convention) => (
                      <ConventionTableRow
                        key={convention._id}
                        convention={convention}
                        onActionComplete={handleActionComplete}
                        onEdit={() => {
                          setInitialData(convention);
                          setOpen(true);
                        }}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <File className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Aucune convention trouvée
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {filteredConventions.length === 0 && conventions.length > 0
                                ? "Aucune convention ne correspond à vos critères"
                                : "Aucune convention n'a été ajoutée pour le moment"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden p-4 space-y-4">
              {currentConventions.length > 0 ? (
                currentConventions.map((convention : Convention) => (
                  <div
                    key={convention._id}
                    className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="line-clamp-1">{convention.title}</span>
                    </h3>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {convention.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <File className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {convention.filePath ? convention.filePath.split('/').pop() : "Aucun fichier"}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInitialData(convention);
                          setOpen(true);
                        }}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <File className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Aucune convention trouvée
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {filteredConventions.length === 0 && conventions.length > 0
                      ? "Aucune convention ne correspond à vos critères"
                      : "Aucune convention n'a été ajoutée pour le moment"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}

          {/* Add/Edit Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md w-full p-6 rounded-lg shadow-lg bg-white text-gray-900 border-gray-200">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-semibold">
                  {initialData ? "Modifier la Convention" : "Ajouter Une Nouvelle Convention"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {initialData
                    ? "Modifiez les détails ci-dessous."
                    : "Remplissez les détails ci-dessous pour ajouter une nouvelle convention."}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <AddEditConventionForm
                  onSubmit={handleFormSubmit}
                  initialData={initialData}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}