"use client"

import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import {
  Calendar,
  MapPin,
  MoreHorizontal,
  Search,
  Eye,
  Trash2,
  Pencil,
  Plus,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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

import { getAllEvents, DeleteEventService } from "@/services"
import { Event } from "./ActivityForm/types"

const ALLOWED_CATEGORIES = ["Voyage", "Excursion", "Club", "Évènement", "Activité"]

export function EventSection() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // States
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Data
  const { data = { data: [] }, isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
  })

  // Handlers
  const handleEdit = (event: Event) => navigate(`/responsable/events/edit/${event._id}`)

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEvent?._id) return
    setIsDeleting(true)
    try {
      await DeleteEventService(selectedEvent._id)
      toast.success("Événement supprimé")
      refetch()
      setIsDeleteOpen(false)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtering
  const filteredEvents = useMemo(() => {
    let filtered = data.data || []
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      filtered = filtered.filter((e: Event) => e.title.toLowerCase().includes(lower))
    }
    if (categoryFilter !== "all" && categoryFilter) {
      filtered = filtered.filter((e: Event) => e.type === categoryFilter)
    }
    return filtered
  }, [data.data, searchQuery, categoryFilter])

  // Columns
  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
    },
    {
      accessorKey: "type",
      header: "Catégorie",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.original.type}
        </Badge>
      )
    },
    {
      id: "details",
      header: "Détails",
      cell: ({ row }) => {
        const e = row.original
        // Helper to extract a destination/location string safely
        const loc = (e as any).destination || (e as any).location || (e as any).adresseclub || "-"
        const date = e.startDate ? format(new Date(e.startDate), "d MMM yyyy", { locale: fr }) : "-"
        return (
          <div className="flex flex-col text-sm text-gray-500">
            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {loc}</div>
            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</div>
          </div>
        )
      }
    },
    {
      accessorKey: "basePrice",
      header: "Prix Base",
      cell: ({ row }) => <span>{row.original.basePrice || 0} DT</span>
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
            <DropdownMenuItem onClick={() => { setSelectedEvent(row.original); setIsDetailsOpen(true) }}>
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
              <h1 className="text-lg font-medium">Activités</h1>
              <Badge variant="secondary" className="font-normal">{filteredEvents.length}</Badge>
            </div>
            <Button onClick={() => navigate("/responsable/events/add")} size="sm">
              <Plus className="w-4 h-4 mr-2" /> Nouveau
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full mx-auto">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {ALLOWED_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <DataTable
              columns={columns}
              data={filteredEvents}
              isLoading={isLoading}
              showSearch={false}
              showColumnVisibility={false}
            />
          </main>

        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>{selectedEvent?.type}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Destination/Lieu</span>
                    <p>{(selectedEvent as any).destination || (selectedEvent as any).location || (selectedEvent as any).adresseclub || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Dates</span>
                    <p>
                      {selectedEvent.startDate ? format(new Date(selectedEvent.startDate), "PPP", { locale: fr }) : "N/A"}
                      {selectedEvent.endDate ? ` - ${format(new Date(selectedEvent.endDate), "PPP", { locale: fr })}` : ""}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Participants</span>
                    <p>{selectedEvent.currentParticipants || 0} / {selectedEvent.maxParticipants || "∞"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Prix</span>
                    <p>
                      Base: {selectedEvent.basePrice || 0} DT<br />
                      Conjoint: {selectedEvent.cojoinPrice || "-"} DT<br />
                      Enfant: {selectedEvent.childPrice || "-"} DT
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="font-medium text-gray-500 block mb-2">Description</span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEvent.description || "Aucune description."}</p>
                </div>

                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-500 block mb-2">Images</span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedEvent.images.map((img, i) => (
                        <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/${img}`}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
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
            <DialogTitle>Supprimer l'activité</DialogTitle>
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