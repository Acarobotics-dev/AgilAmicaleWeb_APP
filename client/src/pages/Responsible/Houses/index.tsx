"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  MoreHorizontal,
  Search,
  Eye,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  MapPin,
  CheckCircle,
  XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/common/data-table"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"

import { getAllHousesService, DeleteHouseService } from "@/services"
import { House } from "./types"

export function HouseSection() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // States
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Data
  const { data: { data: houses = [] } = {}, isLoading, refetch } = useQuery({
    queryKey: ["houses"],
    queryFn: getAllHousesService,
  })

  // Handlers
  const handleEdit = (h: House) => navigate(`/responsable/houses/edit/${h._id}`)
  const handleView = (h: House) => navigate(`/responsable/houses/view/${h._id}`)

  const handleDeleteClick = (h: House) => {
    setSelectedHouse(h)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedHouse?._id) return
    setIsDeleting(true)
    try {
      await DeleteHouseService(selectedHouse._id)
      toast.success("Maison supprimée")
      refetch()
      setIsDeleteOpen(false)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Unique Locs
  const uniqueLocations = useMemo(() => {
    const locs = houses.map((h: House) => h.location).filter(Boolean)
    return Array.from(new Set(locs))
  }, [houses])

  // Filtering
  const filteredHouses = useMemo(() => {
    let filtered = houses || []
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      filtered = filtered.filter((h: House) =>
        h.title?.toLowerCase().includes(lower) ||
        h.address?.toLowerCase().includes(lower) ||
        h.location?.toLowerCase().includes(lower)
      )
    }
    if (availabilityFilter !== "all") {
      const isAvail = availabilityFilter === "available"
      filtered = filtered.filter((h: House) => h.isAvailable === isAvail)
    }
    if (locationFilter !== "all") {
      filtered = filtered.filter((h: House) => h.location === locationFilter)
    }
    return filtered
  }, [houses, searchQuery, availabilityFilter, locationFilter])

  // Columns
  const columns: ColumnDef<House>[] = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
    },
    {
      accessorKey: "location",
      header: "Emplacement",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>{row.original.location}</span>
        </div>
      )
    },
    {
      accessorKey: "availability",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.original.isAvailable ? "outline" : "secondary"} className={`font-normal ${row.original.isAvailable ? "text-green-600 border-green-200 bg-green-50" : "text-gray-500"}`}>
          {row.original.isAvailable ? "Disponible" : "Indisponible"}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleView(row.original)}>
              <Eye className="mr-2 h-4 w-4" /> Détails (Page)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(row.original)}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-white">

          {/* Header */}
          <header className="flex items-center justify-between h-16 px-6 border-b shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-medium">Maisons</h1>
              <Badge variant="secondary" className="font-normal">{filteredHouses.length}</Badge>
            </div>
            <Button onClick={() => navigate("/responsable/houses/add")} size="sm">
              <Plus className="w-4 h-4 mr-2" /> Ajouter
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full mx-auto">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Dispo." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="unavailable">Indisponible</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Lieu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous lieux</SelectItem>
                    {uniqueLocations.map((l: any) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <DataTable
              columns={columns}
              data={filteredHouses}
              isLoading={isLoading}
              showSearch={false}
              showColumnVisibility={false}
            />
          </main>

        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la maison</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

export default HouseSection