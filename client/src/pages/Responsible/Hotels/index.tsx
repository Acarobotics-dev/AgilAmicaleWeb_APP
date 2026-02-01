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
  ExternalLink,
  MapPin
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
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/common/data-table"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"

import { getAllHotelsService, DeleteHotelService } from "@/services"
import { Hotel } from "./types"

export function HotelSection() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  // States
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Data
  const { data: { data: hotels = [] } = {}, isLoading, refetch } = useQuery({
    queryKey: ["hotels"],
    queryFn: getAllHotelsService,
  })

  // Handlers
  const handleEdit = (h: Hotel) => navigate(`/responsable/agences/edit/${h._id}`)

  const handleDeleteClick = (h: Hotel) => {
    setSelectedHotel(h)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedHotel?._id) return
    setIsDeleting(true)
    try {
      await DeleteHotelService(selectedHotel._id)
      toast.success("Agence supprimée")
      refetch()
      setIsDeleteOpen(false)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtering
  const filteredHotels = useMemo(() => {
    let filtered = hotels || []
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      filtered = filtered.filter((h: Hotel) => h.title.toLowerCase().includes(lower))
    }
    return filtered
  }, [hotels, searchQuery])

  // Columns
  const columns: ColumnDef<Hotel>[] = [
    {
      accessorKey: "title",
      header: "Agence",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border">
            {row.original.logo ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${row.original.logo}`} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-300">Img</div>}
          </div>
          <div>
            <span className="font-medium block">{row.original.title}</span>
            <span className="text-xs text-gray-400">{row.original._id}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "link",
      header: "Site Web",
      cell: ({ row }) => row.original.link ? (
        <a href={row.original.link} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline max-w-[200px] truncate">
          {row.original.link} <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      ) : <span className="text-gray-400">-</span>
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
            <DropdownMenuItem onClick={() => { setSelectedHotel(row.original); setIsDetailsOpen(true) }}>
              <Eye className="mr-2 h-4 w-4" /> Détails
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
              <h1 className="text-lg font-medium">Gestion des Hôtels</h1>
              <Badge variant="secondary" className="font-normal">{filteredHotels.length}</Badge>
            </div>
            <Button onClick={() => navigate("/responsable/agences/add")} size="sm">
              <Plus className="w-4 h-4 mr-2" /> Ajouter
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full mx-auto">
            {/* Search */}
            <div className="flex justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <DataTable
              columns={columns}
              data={filteredHotels}
              isLoading={isLoading}
              showSearch={false}
              showColumnVisibility={false}
            />
          </main>

        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'agence</DialogTitle>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden">
                  {selectedHotel.logo ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${selectedHotel.logo}`} className="max-w-full max-h-full" /> : <span className="text-xs text-gray-400">No Logo</span>}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedHotel.title}</h3>
                  {selectedHotel.link && (
                    <a href={selectedHotel.link} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center">
                      {selectedHotel.link} <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">ID</span>
                  <p className="font-mono text-xs">{selectedHotel._id}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'agence</DialogTitle>
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
