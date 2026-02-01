import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Action item configuration for the actions dropdown
 */
interface ActionItem<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  className?: string;
  iconBgClass?: string;
}

/**
 * Creates an actions column with a dropdown menu
 */
export function createActionsColumn<TData>(
  actions: ActionItem<TData>[],
  options?: { header?: string }
): ColumnDef<TData> {
  return {
    id: "actions",
    header: options?.header || "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white shadow-lg rounded-xl border border-gray-200 z-50 p-1"
          >
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(data);
                }}
                className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${action.className || "hover:bg-gray-50"
                  }`}
              >
                {action.icon && (
                  <div className={`p-1 rounded-lg ${action.iconBgClass || "bg-gray-100"}`}>
                    {action.icon}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

/**
 * Common action presets for CRUD operations
 */
export const ActionPresets = {
  edit: <TData,>(onClick: (row: TData) => void): ActionItem<TData> => ({
    label: "Modifier",
    icon: <Pencil className="h-4 w-4 text-blue-600" />,
    onClick,
    className: "hover:bg-blue-50",
    iconBgClass: "bg-blue-100",
  }),

  delete: <TData,>(onClick: (row: TData) => void): ActionItem<TData> => ({
    label: "Supprimer",
    icon: <Trash2 className="h-4 w-4 text-red-600" />,
    onClick,
    className: "hover:bg-red-50",
    iconBgClass: "bg-red-100",
  }),

  view: <TData,>(onClick: (row: TData) => void): ActionItem<TData> => ({
    label: "Détails",
    icon: <Eye className="h-4 w-4 text-green-600" />,
    onClick,
    className: "hover:bg-green-50",
    iconBgClass: "bg-green-100",
  }),
};

/**
 * Badge variant configuration
 */
type BadgeVariant = {
  className: string;
  label?: string;
};

/**
 * Creates a badge column for status display
 */
export function createBadgeColumn<TData>(
  accessorKey: keyof TData & string,
  header: string,
  variants: Record<string, BadgeVariant>,
  options?: { icon?: React.ReactNode; defaultVariant?: BadgeVariant }
): ColumnDef<TData> {
  const defaultVariant = options?.defaultVariant || {
    className: "bg-gray-100 text-gray-800",
  };

  return {
    accessorKey,
    header,
    cell: ({ row }) => {
      const value = row.getValue(accessorKey) as string;
      const variant = variants[value] || defaultVariant;

      return (
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${variant.className}`}
        >
          {options?.icon && <span className="mr-1">{options.icon}</span>}
          {variant.label || value}
        </span>
      );
    },
  };
}

/**
 * Creates an avatar column for user display
 */
export function createAvatarColumn<TData>(
  config: {
    getFirstName: (row: TData) => string;
    getLastName: (row: TData) => string;
    getSubtitle?: (row: TData) => string;
  },
  header: string
): ColumnDef<TData> {
  return {
    id: "avatar",
    header,
    cell: ({ row }) => {
      const data = row.original;
      const firstName = config.getFirstName(data);
      const lastName = config.getLastName(data);
      const subtitle = config.getSubtitle?.(data);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-medium">
            <AvatarFallback>
              {firstName?.charAt(0)}
              {lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {firstName} {lastName}
            </p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      );
    },
  };
}

/**
 * Creates a date column with French formatting
 */
export function createDateColumn<TData>(
  accessorKey: keyof TData & string,
  header: string,
  options?: { formatStr?: string; showTime?: boolean }
): ColumnDef<TData> {
  const formatStr = options?.formatStr || (options?.showTime ? "d MMMM yyyy HH:mm" : "d MMMM yyyy");

  return {
    accessorKey,
    header,
    cell: ({ row }) => {
      const value = row.getValue(accessorKey);
      if (!value) return <span className="text-gray-400">-</span>;

      const date = typeof value === "string" ? new Date(value) : (value as Date);

      return (
        <span className="text-sm text-gray-900">
          {format(date, formatStr, { locale: fr })}
        </span>
      );
    },
  };
}

/**
 * Creates a sortable header component
 */
export function SortableHeader({
  column,
  children,
}: {
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" };
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-8 px-2 hover:bg-gray-200"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

/**
 * Creates a currency column with formatting
 */
export function createCurrencyColumn<TData>(
  accessorKey: keyof TData & string,
  header: string,
  options?: { currency?: string; locale?: string }
): ColumnDef<TData> {
  const currency = options?.currency || "EUR";
  const locale = options?.locale || "fr-FR";

  return {
    accessorKey,
    header,
    cell: ({ row }) => {
      const value = row.getValue(accessorKey) as number | null | undefined;
      if (value === null || value === undefined) return <span className="text-gray-400">-</span>;

      const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(value);

      return <span className="text-sm font-semibold text-gray-900">{formatted}</span>;
    },
  };
}

/**
 * Creates a simple text column with truncation
 */
export function createTextColumn<TData>(
  accessorKey: keyof TData & string,
  header: string,
  options?: { className?: string; truncate?: boolean; maxWidth?: string }
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    cell: ({ row }) => {
      const value = row.getValue(accessorKey) as string | null | undefined;
      if (!value) return <span className="text-gray-400">-</span>;

      const className = [
        "text-sm text-gray-900",
        options?.truncate ? "truncate" : "",
        options?.className || "",
      ].join(" ");

      return (
        <span
          className={className}
          style={options?.maxWidth ? { maxWidth: options.maxWidth, display: "block" } : undefined}
        >
          {value}
        </span>
      );
    },
  };
}
