import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserTableRow } from "./UserTableRow";
import { User } from "./types";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { getAllUsersService } from "@/services";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import {
  Search,
  Filter,
  UserPlus,
  Users,
  Mail,
  Phone,
  BadgeCheck,
  BadgeInfo,
  IdCard,
  AlertTriangle,
  X,
  Check,
  ChevronDown,
  Download,
  RotateCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 10;

export function UsersSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users
  const {
    data: { data: users = [] } = {},
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data: User[] }>({
    queryKey: ["users"],
    queryFn: getAllUsersService,
  });

  const handleActionComplete = () => refetch();

  // Export users (attempt to use SheetJS 'xlsx' if available, fallback to CSV)
  const handleExport = async () => {
    if (!filteredUsers || filteredUsers.length === 0) return;

    const exportData = filteredUsers.map((u: User) => ({
      Nom: `${u.firstName} ${u.lastName}`,
      Email: u.userEmail,
      Telephone: u.userPhone ?? "",
      Role: u.role ?? "",
      Status: u.status ?? "",
      Matricule: u.matricule ?? "",
    }));

    try {
      // dynamic import using a variable to avoid TypeScript static resolution when dependency is not installed
  const pkgName = "xlsx";
  // Tell Vite/Rollup to ignore static analysis for this dynamic optional import
  // so the dev build does not warn when the package is not installed.
  // See: https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  // @vite-ignore
  const XLSX = await import(/* @vite-ignore */ (pkgName as any));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
      XLSX.writeFile(
        wb,
        `utilisateurs_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (err) {
      // Fallback to CSV if xlsx is not installed
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(",")];
      for (const row of exportData) {
        csvRows.push(
          headers
            .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
            .join(",")
        );
      }
      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Apply filters and search
  const filteredUsers = users.filter((user: User) => {
    const matchesSearchQuery =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.userPhone?.includes(searchQuery) ?? false) ||
      user.matricule.includes(searchQuery);

    return (
      matchesSearchQuery &&
      (filters.role ? user.role === filters.role : true) &&
      (filters.status ? user.status === filters.status : true)
    );
  });

  // Pagination
  const totalPages = Math.ceil((filteredUsers.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="relative mb-6 mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <TailChase size="64" speed="1.75" color="#3b82f6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chargement des utilisateurs
              </h3>
              <p className="text-gray-500">
                Veuillez patienter pendant que nous récupérons les données...
              </p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Error state
  if (isError) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Erreur de chargement
              </h3>
              <p className="text-gray-500 mb-6">
                Une erreur s'est produite lors du chargement des utilisateurs.
                Veuillez réessayer.
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
          <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SidebarTrigger className="mt-1" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des Utilisateurs
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{filteredUsers.length} utilisateurs au total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>
                          {users.filter((u: User) => u.status === "Approuvé").length}{" "}
                          approuvés
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>
                          {users.filter((u: User) => u.status === "En Attente").length}{" "}
                          en attente
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate("/responsable/users/add")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un Utilisateur
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={filteredUsers.length === 0}
                    variant="outline"
                    className="px-4 py-2.5 border border-input rounded-full flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter (.xlsx)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl shadow border border-gray-200 mb-6">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, email, téléphone ou matricule..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500"
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

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Rôle
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full pl-3 pr-4 py-2.5 border border-input rounded-lg bg-white hover:bg-gray-100 justify-between font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span>{filters.role || "Tous les rôles"}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[180px] p-2">
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, role: "" }))
                          }
                        >
                          {filters.role === "" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Tous les rôles</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, role: "adherent" }))
                          }
                        >
                          {filters.role === "adherent" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Adhérent</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, role: "responsable" }))
                          }
                        >
                          {filters.role === "responsable" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Responsable</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Statut
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full pl-3 pr-4 py-2.5 border border-input rounded-lg bg-white hover:bg-gray-100 justify-between font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4 text-gray-500" />
                            <span>{filters.status || "Tous les statuts"}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[180px] p-2">
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: "" }))
                          }
                        >
                          {filters.status === "" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Tous les statuts</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: "En Attente" }))
                          }
                        >
                          {filters.status === "En Attente" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>En Attente</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: "Approuvé" }))
                          }
                        >
                          {filters.status === "Approuvé" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Approuvé</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: "Refusé" }))
                          }
                        >
                          {filters.status === "Refusé" && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Refusé</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full py-2.5 border-input rounded-lg hover:bg-gray-100"
                      onClick={() => {
                        setFilters({ role: "", status: "" });
                        setSearchQuery("");
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <RotateCw  className="w-4 h-4 text-gray-500" />
                        Réinitialiser
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Liste des utilisateurs
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {filteredUsers.length} résultats
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="hidden sm:inline">Nom Complet</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="hidden sm:inline">Email</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span className="hidden sm:inline">Téléphone</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                        <span>Rôle</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <BadgeInfo className="w-4 h-4 text-blue-500" />
                        <span>Status</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <IdCard className="w-4 h-4 text-blue-500" />
                        <span className="hidden sm:inline">Matricule</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <UserTableRow
                        key={user._id}
                        user={user}
                        onActionComplete={handleActionComplete}
                        onEdit={() =>
                          navigate(`/responsable/users/edit/${user._id}`)
                        }
                      />
                    ))
                  ) : (
                    <TableRow>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center sm:px-6"
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Aucun utilisateur trouvé
                            </h3>
                            <p className="text-gray-500 text-sm">
                              Aucun utilisateur ne correspond à vos critères
                            </p>
                          </div>

                        </div>
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

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
        </main>
      </div>
    </SidebarProvider>
  );
}