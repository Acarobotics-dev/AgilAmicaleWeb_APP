"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  Row,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, Search, Loader2 } from "lucide-react";
import { DataTablePagination } from "@/components/common/tablepaginationControl";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Show global search input - default true */
  showSearch?: boolean;
  /** Show column visibility toggle - default true */
  showColumnVisibility?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Custom empty state component */
  emptyState?: React.ReactNode;
  /** Callback when row is clicked */
  onRowClick?: (row: Row<TData>) => void;
  /** Initial page size */
  initialPageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showSearch = true,
  showColumnVisibility = true,
  searchPlaceholder = "Rechercher...",
  isLoading = false,
  emptyState,
  onRowClick,
  initialPageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Column Visibility Controls */}
      {(showSearch || showColumnVisibility) && (
        <div className="flex items-center justify-between gap-4">
          {showSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="w-full bg-white border-input focus:outline-none pl-10 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          )}

          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white focus:outline-none"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtrer les colonnes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white rounded-md shadow-lg p-2 space-y-1 border-gray-200">
                <p className="px-2 py-1 text-sm font-semibold text-gray-900">Afficher / Masquer</p>
                <DropdownMenuSeparator className="bg-border h-[1px] my-1" />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <div
                      key={column.id}
                      className="px-1 py-1 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded"
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={() => column.toggleVisibility(!column.getIsVisible())}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-0 focus:outline-none"
                      />
                      <span className="text-sm capitalize text-gray-900">
                        {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                      </span>
                    </div>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Chargement...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-gray-100/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-gray-500"
                >
                  {emptyState || "Aucun résultat trouvé."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}