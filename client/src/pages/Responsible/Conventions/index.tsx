"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "react-toastify"
import ExcelJS from "exceljs"
import {
  FileText,
  MoreHorizontal,
  Search,
  Eye,
  Trash2,
  Pencil,
  FileDown,
  Plus,
  Loader2,
  Download
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
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/common/data-table"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"

import { getAllConventions, DeleteConventionService, DownloadConventionService } from "@/services"
import { Convention } from "./types"

export function ConventionsSection() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")

  // States
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Data
  const { data: { data: conventions = [] } = {}, isLoading, refetch } = useQuery({
    queryKey: ["conventions"],
    queryFn: getAllConventions,
  })

  // Navigation refresh (legacy support)
  useEffect(() => {
    if ((location.state as any)?.refresh) {
      refetch()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, refetch, navigate, location.pathname])


  // Handlers
  const handleEdit = (c: Convention) => navigate(`/responsable/conventions/edit/${c._id}`, { state: { initialData: c } })

  const handleDeleteClick = (c: Convention) => {
    setSelectedConvention(c)
    setIsDeleteOpen(true)
  }

  const handleDownload = async (c: Convention) => {
    if (!c.filePath) {
      toast.error("Aucun fichier")
      return
    }
    try {
      await DownloadConventionService(c.filePath, `${c.title.replace(/\s+/g, "_")}.pdf`)
      toast.success("Téléchargement lancé")
    } catch (e) {
      toast.error("Échec du téléchargement")
    }
  }

  const handleExport = async () => {
    if (!filteredConventions.length) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Conventions")

    worksheet.columns = [
      { header: "Titre", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Date de création", key: "createdAt", width: 20 },
    ]

    filteredConventions.forEach((c: Convention) => {
      worksheet.addRow({
        title: c.title,
        description: c.description,
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"
      })
    })

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conventions_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleConfirmDelete = async () => {
    if (!selectedConvention?._id) return
    setIsDeleting(true)
    try {
      await DeleteConventionService(selectedConvention._id)
      toast.success("Convention supprimée")
      refetch()
      setIsDeleteOpen(false)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtering
  const filteredConventions = useMemo(() => {
    let filtered = conventions || []
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      filtered = filtered.filter((c: Convention) => c.title.toLowerCase().includes(lower))
    }
    return filtered
  }, [conventions, searchQuery])

  // Columns
  const columns: ColumnDef<Convention>[] = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden border">
            {row.original.imagePath ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${row.original.imagePath}`} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-300"><FileText className="h-4 w-4" /></div>}
          </div>
          <span className="font-medium truncate max-w-[200px]">{row.original.title}</span>
        </div>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-gray-500 truncate block max-w-[300px]">{row.original.description}</span>
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
            <DropdownMenuItem onClick={() => { setSelectedConvention(row.original); setIsDetailsOpen(true) }}>
              <Eye className="mr-2 h-4 w-4" /> Détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(row.original)} disabled={!row.original.filePath}>
              <Download className="mr-2 h-4 w-4" /> Télécharger
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
              <h1 className="text-lg font-medium">Conventions</h1>
              <Badge variant="secondary" className="font-normal">{filteredConventions.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Exporter
              </Button>
              <Button onClick={() => navigate("/responsable/conventions/add")} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle
              </Button>
            </div>
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
              data={filteredConventions}
              isLoading={isLoading}
              showSearch={false}
              showColumnVisibility={false}
            />
          </main>

        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedConvention?.title}</DialogTitle>
            <DialogDescription>Détails de la convention sélectionnée.</DialogDescription>
          </DialogHeader>
          {selectedConvention && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 py-4">
                {/* Image */}
                {selectedConvention.imagePath && (
                  <div className="rounded-lg overflow-hidden bg-gray-50 border">
                    <img src={`${import.meta.env.VITE_API_BASE_URL}/${selectedConvention.imagePath}`} className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedConvention.description}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedConvention)} disabled={!selectedConvention.filePath}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Télécharger le document
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la convention</DialogTitle>
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