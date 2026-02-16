"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import ExcelJS from "exceljs"
import { toast } from "sonner"
import {
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  Eye,
  CheckCircle,
  Calendar as CalendarIcon,
  Filter
} from "lucide-react"

import {
  getAllBookings,
  getAllUsersService,
  getAllHousesService,
  getAllEvents,
  DeleteBookingService,
  UpdateBookingStatusService,
} from "@/services"

import { User, House, Event, Booking } from "./types"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as DateCalendar } from "@/components/ui/calendar"

// --- Constants & Helpers ---

const STATUS_Styles: Record<string, string> = {
  "confirmé": "bg-green-100 text-green-700 hover:bg-green-100",
  "en attente": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  "annulé": "bg-red-100 text-red-700 hover:bg-red-100",
  "terminé": "bg-gray-100 text-gray-700 hover:bg-gray-100",
}

const getStatusBadge = (status: string = "") => {
  return STATUS_Styles[status.toLowerCase()] || "bg-gray-100 text-gray-700"
}

// --- Main Component ---

export function BookingsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date | undefined; to?: Date | undefined } | undefined>(undefined)

  // State for Dialogs
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  // Queries
  const { data: bookingsData = { data: [] }, isLoading: loadingBookings, refetch } = useQuery({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
  })

  // We fetch related entities to map IDs to names
  // In a real optimized app, this should probably be handled by the backend (populate)
  // or via dataloader pattern, but keeping existing logic for now.
  const { data: usersData = { data: [] } } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsersService,
    enabled: !!bookingsData.data.length
  })

  const { data: housesData = { data: [] } } = useQuery({
    queryKey: ["houses"],
    queryFn: getAllHousesService,
    enabled: !!bookingsData.data.length
  })

  const { data: eventsData = { data: [] } } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
    enabled: !!bookingsData.data.length
  })

  // Mappers
  const usersMap = useMemo(() => {
    return usersData.data.reduce((acc: any, user: User) => ({ ...acc, [user._id]: user }), {})
  }, [usersData.data])

  const activitiesMap = useMemo(() => {
    const map: any = {}
    housesData.data.forEach((h: House) => map[h._id] = { ...h, type: "Maison" })
    eventsData.data.forEach((e: Event) => map[e._id] = { ...e, type: "Événement" })
    return map
  }, [housesData.data, eventsData.data])

  // Filtering
  const filteredBookings = useMemo(() => {
    return bookingsData.data.filter((booking: Booking) => {
      const user = usersMap[booking.userId]
      const activity = activitiesMap[booking.activity]

      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const userMatch = user && (
          user.firstName?.toLowerCase().includes(term) ||
          user.lastName?.toLowerCase().includes(term) ||
          user.matricule?.includes(term)
        )
        const activityMatch = activity && activity.title?.toLowerCase().includes(term)
        if (!userMatch && !activityMatch) return false
      }

      // Status
      if (statusFilter !== "all" && booking.status !== statusFilter) return false

      // Date range filter (based on bookingPeriod.start/end or fallback fields)
      const bStart = booking.bookingPeriod?.start ? new Date(booking.bookingPeriod.start) : (booking as any).startDate ? new Date((booking as any).startDate) : null
      const bEnd = booking.bookingPeriod?.end ? new Date(booking.bookingPeriod.end) : (booking as any).endDate ? new Date((booking as any).endDate) : null

      if (dateRange && (dateRange.from || dateRange.to)) {
        const rangeFrom = dateRange.from ? new Date(dateRange.from) : null
        const rangeTo = dateRange.to ? new Date(dateRange.to) : null

        // If booking has no dates, exclude
        if (!bStart && !bEnd) return false

        // Normalize booking start/end
        const bookingStart = bStart || bEnd
        const bookingEnd = bEnd || bStart

        // Overlap check: bookingStart <= rangeTo && bookingEnd >= rangeFrom
        if (rangeFrom && bookingEnd && bookingEnd < rangeFrom) return false
        if (rangeTo && bookingStart && bookingStart > rangeTo) return false
      }

      return true
    })
  }, [bookingsData.data, searchTerm, statusFilter, usersMap, activitiesMap, dateRange])

  // Export filtered bookings to Excel
  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("Réservations")

      sheet.columns = [
        { header: "Utilisateur", key: "user", width: 30 },
        { header: "Matricule", key: "matricule", width: 20 },
        { header: "Activité", key: "activity", width: 30 },
        { header: "Catégorie", key: "category", width: 20 },
        { header: "Début", key: "start", width: 15 },
        { header: "Fin", key: "end", width: 15 },
        { header: "Statut", key: "status", width: 15 },
        { header: "Participants", key: "participants", width: 30 },
      ]

      filteredBookings.forEach((b: Booking) => {
        const user = usersMap[b.userId]
        const act = activitiesMap[b.activity]
        const start = b.bookingPeriod?.start || (b as any).startDate || ""
        const end = b.bookingPeriod?.end || (b as any).endDate || ""
        const participantsText = [
          `${user?.firstName || ""} ${user?.lastName || ""}`,
          ...(b.participants || []).map((p: any) => `${p.firstName} ${p.lastName} (${p.type === 'cojoint' ? 'Accompagnant' : p.type})`)
        ].join("; ")

        sheet.addRow({
          user: `${user?.firstName || ""} ${user?.lastName || ""}`,
          matricule: user?.matricule || "",
          activity: act?.title || "",
          category: b.activityCategory || "",
          start: start ? format(new Date(start), "dd/MM/yyyy") : "",
          end: end ? format(new Date(end), "dd/MM/yyyy") : "",
          status: b.status || "",
          participants: participantsText,
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reservations_${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error("Erreur lors de l'export")
    }
  }

  // Actions
  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return
    setIsUpdating(true)
    try {
      await UpdateBookingStatusService(selectedBooking._id, newStatus)
      toast.success("Statut mis à jour")
      refetch()
      setIsStatusOpen(false)
    } catch (e) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBooking) return
    setIsUpdating(true)
    try {
      await DeleteBookingService(selectedBooking._id)
      toast.success("Réservation supprimée")
      refetch()
      setIsDeleteOpen(false)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsUpdating(false)
    }
  }

  // Column Definitions
  const columns: ColumnDef<Booking>[] = [
    {
      id: "user",
      header: "Utilisateur",
      cell: ({ row }) => {
        const user = usersMap[row.original.userId]
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user ? `${user.firstName} ${user.lastName}` : "Inconnu"}</span>
            <span className="text-xs text-gray-500">{user?.matricule || "-"}</span>
          </div>
        )
      }
    },
    {
      id: "activity",
      header: "Activité",
      cell: ({ row }) => {
        const act = activitiesMap[row.original.activity]
        return (
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[200px]">{act?.title || "Inconnu"}</span>
            <span className="text-xs text-gray-500">{row.original.activityCategory}</span>
          </div>
        )
      }
    },
    {
      id: "dates",
      header: "Dates",
      cell: ({ row }) => {
        const b = row.original
        // Using "any" cast because the backend mapping isn't 100% consistent based on previous code
        const start = b.bookingPeriod?.start || (b as any).startDate
        const end = b.bookingPeriod?.end || (b as any).endDate

        if (!start || !end) return <span className="text-gray-400">-</span>

        return (
          <div className="text-sm">
            {format(new Date(start), "d MMM yyyy", { locale: fr })} - {format(new Date(end), "d MMM yyyy", { locale: fr })}
          </div>
        )
      }
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge className={`shadow-none border-0 font-normal ${getStatusBadge(row.original.status)}`}>
          {row.original.status || "N/A"}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setIsDetailsOpen(true) }}>
                <Eye className="mr-2 h-4 w-4" /> Détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setNewStatus(booking.status || ""); setIsStatusOpen(true) }}>
                <CheckCircle className="mr-2 h-4 w-4" /> Changer statut
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setIsDeleteOpen(true) }} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  // Stats Calculation
  const stats = useMemo(() => {
    const total = bookingsData.data.length
    const pending = bookingsData.data.filter((b: any) => b.status === "en attente").length
    const confirmed = bookingsData.data.filter((b: any) => b.status === "confirmé").length
    // "Houses" vs "Events" bookings based on category
    const houses = bookingsData.data.filter((b: any) => b.activityCategory === "sejour Maison").length

    return [
      { label: "Total Réservations", value: total },
      { label: "En Attente", value: pending },
      { label: "Confirmées", value: confirmed },
      { label: "Séjours Maison", value: houses },
    ]
  }, [bookingsData.data])


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-white">

          {/* Header */}
          <header className="flex items-center h-16 px-6 border-b shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-medium">Réservations</h1>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8 overflow-y-auto">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Card key={i} className="shadow-none border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters & Table Container */}
            <Card className="shadow-sm border">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher utilisateur ou activité..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="en attente">En attente</SelectItem>
                        <SelectItem value="confirmé">Confirmé</SelectItem>
                        <SelectItem value="annulé">Annulé</SelectItem>
                        <SelectItem value="terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {dateRange && (dateRange.from || dateRange.to) ? (
                            <span className="text-sm">
                              {dateRange.from ? format(new Date(dateRange.from), "dd/MM/yyyy") : ""}
                              {dateRange.from && dateRange.to ? ` - ${format(new Date(dateRange.to), "dd/MM/yyyy")}` : dateRange.to ? ` - ${format(new Date(dateRange.to), "dd/MM/yyyy")}` : ""}
                            </span>
                          ) : (
                            <span className="text-sm">Période</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto">
                        <DateCalendar mode="range" selected={dateRange as any} onSelect={(r) => setDateRange(r as any)} />
                        <div className="flex gap-2 mt-2 justify-end">
                          <Button variant="outline" onClick={() => setDateRange(undefined)}>Réinitialiser</Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button onClick={handleExport} className="ml-2" variant={"default"}>
                      Exporter
                    </Button>

                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <DataTable
                columns={columns}
                data={filteredBookings}
                isLoading={loadingBookings}
                showSearch={false}
                showColumnVisibility={false}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 text-sm mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500 mb-1">Utilisateur</h4>
                  <div className="font-medium text-base">
                    {usersMap[selectedBooking.userId]?.firstName} {usersMap[selectedBooking.userId]?.lastName}
                  </div>
                  <div className="text-gray-500">{usersMap[selectedBooking.userId]?.matricule}</div>
                  <div className="text-gray-500">{usersMap[selectedBooking.userId]?.userEmail}</div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 mb-1">Activité</h4>
                  <div className="font-medium text-base">
                    {activitiesMap[selectedBooking.activity]?.title}
                  </div>
                  <div className="text-gray-500">{selectedBooking.activityCategory}</div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-500 mb-2">Participants ({1 + (selectedBooking.participants?.length || 0)})</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="font-medium">
                      {usersMap[selectedBooking.userId]?.firstName} {usersMap[selectedBooking.userId]?.lastName}
                    </span>
                    <Badge variant="outline" className="text-xs">Adhérent</Badge>
                  </div>
                  {selectedBooking.participants && selectedBooking.participants.length > 0 && selectedBooking.participants.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">{p.firstName} {p.lastName} <span className="text-gray-400 text-xs">({p.age} ans)</span></span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {p.type === 'cojoint' ? 'Accompagnant' : p.type === 'child' ? 'Enfant' : p.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Dates & Statut</h4>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusBadge(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                  {selectedBooking.bookingPeriod && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 ml-2" />
                      {format(new Date(selectedBooking.bookingPeriod.start), "dd/MM/yyyy")} - {format(new Date(selectedBooking.bookingPeriod.end), "dd/MM/yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut</DialogTitle>
            <DialogDescription>Changez le statut de cette réservation.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en attente">En attente</SelectItem>
                <SelectItem value="confirmé">Confirmé</SelectItem>
                <SelectItem value="annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusOpen(false)}>Annuler</Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la réservation ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  )
}