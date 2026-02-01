"use client"

import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  Search,
  Filter,
  UserPlus,
  Users,
  AlertTriangle,
  X,
  Check,
  ChevronDown,
  Download,
  RotateCw,
  Trash2,
  Info,
  Loader2,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  IdCard,
  BadgeInfo,
  MoreHorizontal,
  BadgeCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import ExcelJS from "exceljs"

import { DataTable } from "@/components/common/data-table"
import {
  createActionsColumn,
  createAvatarColumn,
  createBadgeColumn,
  createTextColumn,
  ActionPresets,
} from "@/components/common/table-columns"
import { getAllUsersService, DeleteUserService, UpdateUserStatusService } from "@/services"
import { User } from "./types"
import { ColumnDef } from "@tanstack/react-table"

// Helpers
const statusVariants = {
  "En Attente": { className: "bg-yellow-100 text-yellow-800", label: "En Attente" },
  "Approuvé": { className: "bg-green-100 text-green-800", label: "Approuvé" },
  "Refusé": { className: "bg-red-100 text-red-800", label: "Refusé" },
}

const roleVariants = {
  "adherent": { className: "bg-blue-100 text-blue-800", label: "Adhérent" },
  "responsable": { className: "bg-purple-100 text-purple-800", label: "Responsable" },
  "admin": { className: "bg-gray-100 text-gray-800", label: "Administrateur" },
}

function getStatusBorder(status: string) {
  switch (status) {
    case "En Attente": return "border-yellow-300"
    case "Approuvé": return "border-green-300"
    case "Refusé": return "border-red-300"
    default: return "border-gray-200"
  }
}

// Dialogs
function UserDetailsDialog({ user, open, onOpenChange }: { user: User | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-screen overflow-y-auto p-6">
        <DialogHeader className="mb-4 border-b pb-4 flex flex-row items-center gap-2">
          <Eye className="h-6 w-6 text-green-500" />
          <div>
            <DialogTitle className="text-xl font-bold">Détails de l'utilisateur</DialogTitle>
            <DialogDescription>Informations complètes de l'utilisateur.</DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex items-center gap-4 border-b pb-4 mb-6">
          <Avatar className="h-14 w-14 border">
            <AvatarFallback className="text-xl">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold">{user.firstName} {user.lastName}</h3>
            <Badge variant="secondary" className="font-normal mt-1">
              {roleVariants[user.role as keyof typeof roleVariants]?.label || user.role}
            </Badge>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
              <p className="text-sm font-medium">{user.userEmail || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Téléphone</p>
              <p className="text-sm font-medium">{user.userPhone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IdCard className="h-3 w-3" /> Matricule</p>
              <p className="text-sm font-medium">{user.matricule || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BadgeInfo className="h-3 w-3" /> Statut</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusVariants[user.status as keyof typeof statusVariants]?.className || "bg-gray-100"}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteUserDialog({ user, open, onOpenChange, onConfirm, isDeleting }: any) {
  if (!user) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l'utilisateur</DialogTitle>
          <DialogDescription>Cette action est irréversible.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UpdateStatusDialog({ user, open, onOpenChange, onConfirm, selectedStatus, onStatusChange }: any) {
  if (!user) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le statut</DialogTitle>
          <DialogDescription>Mettre à jour le statut de l'utilisateur.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className={`p-4 rounded-lg border ${getStatusBorder(user.status)}`}>
            <div className="flex justify-between">
              <span className="font-semibold">{user.firstName} {user.lastName}</span>
              <Badge variant="outline">{user.status}</Badge>
            </div>
          </div>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger><SelectValue placeholder="Nouveau statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="En Attente">En attente</SelectItem>
              <SelectItem value="Approuvé">Approuvé</SelectItem>
              <SelectItem value="Refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onConfirm}>Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UsersSection() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ role: "", status: "" })
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"En Attente" | "Approuvé" | "Refusé">("En Attente")

  const {
    data: { data: users = [] } = {},
    isLoading,
    refetch,
  } = useQuery<{ data: User[] }>({
    queryKey: ["users"],
    queryFn: getAllUsersService,
  })

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.userPhone?.includes(searchQuery) ?? false) ||
        user.matricule.includes(searchQuery)

      const matchesRole = !filters.role || user.role === filters.role
      const matchesStatus = !filters.status || user.status === filters.status

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, filters])

  // Stats
  const stats = useMemo(() => [
    { label: "Utilisateurs", value: users.length },
    { label: "Approuvés", value: users.filter(u => u.status === "Approuvé").length },
    { label: "En Attente", value: users.filter(u => u.status === "En Attente").length },
    { label: "Refusés", value: users.filter(u => u.status === "Refusé").length },
  ], [users])

  // Handlers
  const handleEdit = useCallback((user: User) => navigate(`/responsable/users/edit/${user._id}`), [navigate])

  const handleDeleteClick = useCallback((user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDetailsClick = useCallback((user: User) => {
    setSelectedUser(user)
    setIsDetailsDialogOpen(true)
  }, [])

  const handleStatusClick = useCallback((user: User) => {
    setSelectedUser(user)
    setSelectedStatus(user.status as any)
    setIsStatusDialogOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!selectedUser) return
    setIsDeleting(true)
    try {
      await DeleteUserService(selectedUser._id!)
      toast.success("Utilisateur supprimé")
      refetch()
      setIsDeleteDialogOpen(false)
    } catch (err) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmStatusUpdate = async () => {
    if (!selectedUser) return
    try {
      await UpdateUserStatusService(selectedUser._id!, { status: selectedStatus })
      toast.success("Statut mis à jour")
      refetch()
      setIsStatusDialogOpen(false)
    } catch (err) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleExport = async () => {
    if (!filteredUsers.length) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Utilisateurs")

    // Define columns
    worksheet.columns = [
      { header: "Nom", key: "fullName", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Rôle", key: "role", width: 15 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Matricule", key: "matricule", width: 15 },
      { header: "Téléphone", key: "phone", width: 20 },
    ]

    // Add rows
    filteredUsers.forEach((u: User) => {
      worksheet.addRow({
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.userEmail,
        role: roleVariants[u.role as keyof typeof roleVariants]?.label || u.role,
        status: u.status,
        matricule: u.matricule,
        phone: u.userPhone || "N/A"
      })
    })

    // Styling headers
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' }
    }

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `utilisateurs_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns: ColumnDef<User>[] = useMemo(() => [
    createAvatarColumn<User>({
      getFirstName: (user) => user.firstName,
      getLastName: (user) => user.lastName,
      getSubtitle: (user) => user.matricule
    }, "Utilisateur"),
    createTextColumn<User>("userEmail", "Email"),
    createBadgeColumn<User>("role", "Rôle", roleVariants),
    createBadgeColumn<User>("status", "Statut", statusVariants),
    createActionsColumn<User>([
      { ...ActionPresets.edit(handleEdit) },
      { ...ActionPresets.delete(handleDeleteClick) },
      { ...ActionPresets.view(handleDetailsClick) },
      {
        label: "Statut",
        icon: <Info className="h-4 w-4" />,
        onClick: handleStatusClick
      }
    ])
  ], [handleEdit, handleDeleteClick, handleDetailsClick, handleStatusClick])

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
              <h1 className="text-lg font-medium">Utilisateurs</h1>
              <Badge variant="secondary" className="font-normal">{filteredUsers.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Exporter
              </Button>
              <Button onClick={() => navigate("/responsable/users/add")} size="sm">
                <UserPlus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Card key={i} className="shadow-none border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
                </Card>
              ))}
            </div>

            {/* Filters and Table Container */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input placeholder="Rechercher..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Select value={filters.role} onValueChange={v => setFilters(prev => ({ ...prev, role: v === "all" ? "" : v }))}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Rôle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {Object.entries(roleVariants).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={v => setFilters(prev => ({ ...prev, status: v === "all" ? "" : v }))}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {Object.entries(statusVariants).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => { setFilters({ role: "", status: "" }); setSearchQuery("") }}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={filteredUsers}
                isLoading={isLoading}
                showSearch={false}
                showColumnVisibility={false}
              />
            </div>
          </main>
        </div>
      </div>

      <UserDetailsDialog user={selectedUser} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />
      <DeleteUserDialog user={selectedUser} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} isDeleting={isDeleting} />
      <UpdateStatusDialog user={selectedUser} open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen} onConfirm={confirmStatusUpdate} selectedStatus={selectedStatus} onStatusChange={(val: any) => setSelectedStatus(val)} />
    </SidebarProvider>
  )
}