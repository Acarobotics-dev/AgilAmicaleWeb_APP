"use client"

import type React from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, useWatch } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import {
  Bus,
  TramFront,
  Croissant,
  MapIcon,
  Ticket,
  UserRoundSearch,
  DoorOpen,
  PackageCheck,
  UserRoundCheck,
  CalendarDays,
  Sandwich,
  Dumbbell,
  ShieldCheck,
  Warehouse,
  Mic,
  ListTodo,
  Coffee,
  BedDouble,
  Utensils,
  Hotel,
  Edit3,
  Plane,
  DollarSign,
  MoveHorizontal,
  Wine,
  Sailboat,
  Music,
  Sun,
  SunMedium,
  Droplet,
  Backpack,
  Glasses,
  Shirt,
  CloudRain,
  Camera,
  Award as IdCard,
  ClipboardIcon,
  UsersIcon,
  X,
  Save,
  Plus,
  Check,
  Clock,
  Info,
  Star,
  Settings,
  ImageIcon,
} from "lucide-react"
import type { Event, EventType } from "./types"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { TailChase } from "ldrs/react"
import "ldrs/react/TailChase.css"
import ImageUploader from "@/components/common/ImagesUploader"

interface AddEditEventFormProps {
  onSubmit: (formData: FormData) => void
  initialData?: Event
}

const INCLUDES_OPTIONS: Record<string, { label: string; icon: React.ElementType; category?: string }[]> = {
  Voyage: [
    { label: "Chambre d'hôtel", icon: BedDouble, category: "Hébergement" },
    { label: "Pension complète", icon: Utensils, category: "Hébergement" },
    { label: "Accès à un complexe tout compris", icon: Hotel, category: "Hébergement" },
    { label: "Transport en bus aller-retour", icon: Bus, category: "Transport" },
    { label: "Vols ou trains nationaux", icon: Plane, category: "Transport" },
    { label: "Transferts aéroport", icon: MoveHorizontal, category: "Transport" },
    { label: "Transports locaux", icon: TramFront, category: "Transport" },
    { label: "Dîner de bienvenue", icon: Wine, category: "Restauration" },
    { label: "Petit-déjeuner quotidien", icon: Croissant, category: "Restauration" },
    { label: "Snacks et bouteilles d'eau", icon: Sandwich, category: "Restauration" },
    { label: "Visites guidées", icon: MapIcon, category: "Activités" },
    { label: "Billets d'entrée aux attractions", icon: Ticket, category: "Activités" },
    { label: "Croisière", icon: Sailboat, category: "Activités" },
    { label: "Spectacle culturel ou performance", icon: Music, category: "Activités" },
  ],
  Excursion: [
    { label: "Transport en bus aller-retour", icon: Bus },
    { label: "Transports locaux", icon: TramFront },
    { label: "Petit-déjeuner ou collation", icon: Croissant },
    { label: "Visites guidées", icon: MapIcon },
    { label: "Billets d'entrée aux attractions", icon: Ticket },
    { label: "Accompagnement par un guide", icon: UserRoundSearch },
  ],
  Club: [
    { label: "Accès aux locaux du club", icon: DoorOpen },
    { label: "Matériel fourni", icon: PackageCheck },
    { label: "Encadrement par un animateur", icon: UserRoundCheck },
    { label: "Activités hebdomadaires", icon: CalendarDays },
    { label: "Goûter ou collation", icon: Sandwich },
  ],
  Activité: [
    { label: "Encadrement par un coach sportif", icon: UserRoundCheck },
    { label: "Matériel sportif fourni", icon: Dumbbell },
    { label: "Assurance incluse", icon: ShieldCheck },
    { label: "Espace d'entraînement réservé", icon: Warehouse },
    { label: "Boissons ou collations", icon: Sandwich },
  ],
  Évènement: [
    { label: "Intervenants invités", icon: Mic },
    { label: "Programme ou agenda", icon: ListTodo },
    { label: "Pause-café", icon: Coffee },
  ],
}

const EXCURSION_EQUIPMENT_OPTIONS = [
  { label: "Casquette ou chapeau", icon: Sun },
  { label: "Crème solaire", icon: SunMedium },
  { label: "Bouteille d'eau", icon: Droplet },
  { label: "Sac à dos", icon: Backpack },
  { label: "Lunettes de soleil", icon: Glasses },
  { label: "Vêtements confortables", icon: Shirt },
  { label: "K-way ou coupe-vent", icon: CloudRain },
  { label: "Appareil photo ou smartphone", icon: Camera },
  { label: "Petit encas", icon: Sandwich },
  { label: "Carte d'identité ou passeport", icon: IdCard },
]

const FormSection = ({
  icon: Icon,
  title,
  description,
  children,
  variant = "default",
}: {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
  variant?: "default" | "primary" | "success" | "warning"
}) => {
  const variants = {
    default: "border-gray-200 bg-gray-100/50",
    primary: "border-blue-200 bg-blue-50/50",
    success: "border-green-200 bg-green-50/50",
    warning: "border-amber-200 bg-amber-50/50",
  }

  const iconVariants = {
    default: "text-gray-500 bg-gray-100",
    primary: "text-blue-600 bg-blue-100",
    success: "text-green-600 bg-green-100",
    warning: "text-amber-600 bg-amber-100",
  }

  return (
    <Card className={`border ${variants[variant]} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={`p-2 rounded-lg ${iconVariants[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-500 font-normal mt-1">{description}</p>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  )
}

const BadgeSelector = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Aucune sélection",
  variant = "default",
}: {
  options: { label: string; icon: React.ElementType }[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  variant?: "default" | "primary" | "success"
}) => {
  const variants = {
    default: {
      selected: "bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700",
      unselected: "bg-white text-gray-900/90 border-gray-200 hover:bg-blue-50 hover:border-blue-300",
    },
    primary: {
      selected: "bg-purple-600 text-white border-purple-600 shadow-md hover:bg-purple-700",
      unselected: "bg-white text-gray-900/90 border-gray-200 hover:bg-purple-50 hover:border-purple-300",
    },
    success: {
      selected: "bg-green-600 text-white border-green-600 shadow-md hover:bg-green-700",
      unselected: "bg-white text-gray-900/90 border-gray-200 hover:bg-green-50 hover:border-green-300",
    },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon
          const isSelected = selectedValues.includes(opt.label)
          const variantStyles = variants[variant]

          return (
            <button
              type="button"
              key={opt.label}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                isSelected ? variantStyles.selected : variantStyles.unselected
              }`}
              onClick={() => {
                const newValues = isSelected
                  ? selectedValues.filter((l) => l !== opt.label)
                  : [...selectedValues, opt.label]
                onChange(newValues)
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-left flex-1">{opt.label}</span>
              {isSelected && <Check className="w-4 h-4 ml-auto" />}
            </button>
          )
        })}
      </div>

      {selectedValues.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-900/90 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Éléments sélectionnés ({selectedValues.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((label) => {
              const found = options.find((o) => o.label === label)
              const Icon = found?.icon
              return (
                <Badge
                  key={label}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function AddEditEventForm({ onSubmit, initialData }: AddEditEventFormProps) {
  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "Évènement",
      description: initialData?.description || "",
      images: [] as File[],
      featuredPhoto: initialData?.featuredPhoto || "",
      basePrice: initialData?.pricing?.basePrice?.toString() || "",
      cojoinPrice: initialData?.pricing?.cojoinPrice?.toString() || "",
      childPrice: initialData?.pricing?.childPrice?.toString() || "",
      companionsCount:
        (initialData as any)?.numberOfCompanions?.toString() || (initialData as any)?.companionsCount?.toString() || "",
      childrenCount:
        (initialData as any)?.numberOfChildren?.toString() || (initialData as any)?.childrenCount?.toString() || "",
      includes: initialData?.includes?.join(", ") || "",
      maxParticipants: initialData?.maxParticipants?.toString() || "",
      currentParticipants: initialData?.currentParticipants?.toString() || "",
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      // Voyage
      startDate: (initialData as any)?.startDate ? new Date((initialData as any).startDate) : undefined,
      endDate: (initialData as any)?.endDate ? new Date((initialData as any).endDate) : undefined,
      destination: (initialData as any)?.destination || "",
      departureCity: (initialData as any)?.departureCity || "",
      transportType: (initialData as any)?.transportType || "",
      accommodation: (initialData as any)?.accommodation || "",
      // Excursion
      durationHours: (initialData as any)?.durationHours?.toString() || "",
      meetingPoint: (initialData as any)?.meetingPoint || "",
      meetingTime: (initialData as any)?.meetingTime || "",
      equipmentRequired: (initialData as any)?.equipmentRequired?.join(", ") || "",
      // Club
      adresseclub: (initialData as any)?.adresseclub || "",
      schedule: (initialData as any)?.schedule || [],
      categoryclub: (initialData as any)?.categoryclub || "",
      ageGroup: (initialData as any)?.ageGroup || "",
      // Activité
      activityTime: (initialData as any)?.activityTime || "",
      sportType: (initialData as any)?.sportType || "",
      durationMinutes: (initialData as any)?.durationMinutes?.toString() || "",
      location: (initialData as any)?.location || "",
      equipmentProvided: (initialData as any)?.equipmentProvided?.join(", ") || "",
      // Évènement
      eventTime: (initialData as any)?.eventTime || "",
      organizer: (initialData as any)?.organizer || "",
      // location handled by "location" field above (shared across types)
    },
  })

  const [newImages, setNewImages] = useState<File[]>([])
  const [removedImages, setRemovedImages] = useState<string[]>([])

  // Handle image changes from ImageUploader
  const handleImagesChange = useCallback(
    (payload: {
      newFiles: File[]
      keptUrls: string[]
      removedUrls: string[]
      combined: Array<string | File>
      combinedPreviewUrls?: string[]
      newFilePreviewUrls?: string[]
    }) => {
      const { newFiles, removedUrls } = payload
      setNewImages(newFiles || [])
      setRemovedImages(removedUrls || [])
      form.setValue("images", newFiles || [])
    },
    [form],
  )

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  }) as EventType

  const includesOptionsMemo = useMemo(() => INCLUDES_OPTIONS[selectedType] || [], [selectedType])

  // Helper to normalize time strings to 24-hour 'HH:mm' format
  const normalizeTime = (value?: string) => {
    if (!value) return ""
    try {
      const parsed = parse(value, "HH:mm", new Date())
      if (isNaN(parsed.getTime())) {
        return value
      }
      return format(parsed, "HH:mm")
    } catch (e) {
      return value
    }
  }

  // Helper to format Date -> yyyy-MM-dd for input[type="date"]
  const formatForDateInput = (d?: string | Date) => {
    if (!d) return ""
    try {
      return format(new Date(d), "yyyy-MM-dd")
    } catch {
      return ""
    }
  }

  const includesOptions = includesOptionsMemo

  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const isEditMode = Boolean(initialData)
  const isSubmitting = submitting

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const formData = new FormData()

      // Common fields
      ;[
        "title",
        "type",
        "description",
        "featuredPhoto",
        "maxParticipants",
        "currentParticipants",
        "isActive",
        "isFeatured",
      ].forEach((field) => {
        if (values[field] !== undefined && values[field] !== "") formData.append(field, values[field].toString())
      })

      // Includes
      const includesArray = values.includes
        .split(",")
        .map((item: string) => item.trim())
        .filter(Boolean)
      formData.append("includes", JSON.stringify(includesArray))

      // Universal start/end dates
      if (values.startDate) formData.append("startDate", format(new Date(values.startDate), "yyyy-MM-dd"))
      if (values.endDate) formData.append("endDate", format(new Date(values.endDate), "yyyy-MM-dd"))

      // Pricing object
      const pricingObj: any = {}
      if (values.basePrice !== undefined && values.basePrice !== "") {
        pricingObj.basePrice = Number(values.basePrice)
      }
      if (values.cojoinPrice !== undefined && values.cojoinPrice !== "") {
        pricingObj.cojoinPrice = Number(values.cojoinPrice)
      }
      if (values.childPrice !== undefined && values.childPrice !== "") {
        pricingObj.childPrice = Number(values.childPrice)
      }
      if (Object.keys(pricingObj).length > 0) {
        formData.append("pricing", JSON.stringify(pricingObj))
      }

      // Map companion/children counts
      if (values.companionsCount !== undefined && values.companionsCount !== "") {
        formData.append("numberOfCompanions", String(Number(values.companionsCount)))
        formData.append("companionsCount", String(Number(values.companionsCount)))
      }
      if (values.childrenCount !== undefined && values.childrenCount !== "") {
        formData.append("numberOfChildren", String(Number(values.childrenCount)))
        formData.append("childrenCount", String(Number(values.childrenCount)))
      }

      // Type-specific fields (keeping all the existing logic)
      if (selectedType === "Voyage") {
        if (values.destination) formData.append("destination", values.destination)
        if (values.departureCity) formData.append("departureCity", values.departureCity)
        if (values.transportType) formData.append("transportType", values.transportType)
        if (values.accommodation) formData.append("accommodation", values.accommodation)
      }
      if (selectedType === "Excursion") {
        if (values.destination) formData.append("destination", values.destination)
        if (values.durationHours) formData.append("durationHours", values.durationHours)
        if (values.meetingPoint) formData.append("meetingPoint", values.meetingPoint)
        if (values.meetingTime) formData.append("meetingTime", values.meetingTime)
        if (values.equipmentRequired) {
          const eqArr = values.equipmentRequired
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean)
          formData.append("equipmentRequired", JSON.stringify(eqArr))
        }
        formData.append("guideIncluded", values.guideIncluded ? "true" : "false")
      }
      if (selectedType === "Club") {
        if (values.adresseclub) formData.append("adresseclub", values.adresseclub)
        if (values.schedule) {
          const scheduleArr = values.schedule
            .filter((s: any) => s.day && s.time?.startTime && s.time?.endTime)
            .map((s: any) => ({
              day: s.day instanceof Date ? format(s.day, "yyyy-MM-dd") : format(new Date(s.day), "yyyy-MM-dd"),
              time: s.time,
            }))
          formData.append("schedule", JSON.stringify(scheduleArr))
        }
        if (values.categoryclub) formData.append("categoryclub", values.categoryclub)
        if (values.ageGroup) formData.append("ageGroup", values.ageGroup)
      }
      if (selectedType === "Activité") {
        if (values.sportType) formData.append("sportType", values.sportType)
        if (values.durationMinutes) formData.append("durationMinutes", values.durationMinutes)
        if (values.location) formData.append("location", values.location)
        if (values.equipmentProvided) {
          const eqArr = values.equipmentProvided
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean)
          formData.append("equipmentProvided", JSON.stringify(eqArr))
        }
      }
      if (selectedType === "Évènement") {
        if (values.location) formData.append("location", values.location)
        if (values.eventTime) formData.append("eventTime", values.eventTime)
        if (values.organizer) formData.append("organizer", values.organizer)
        if (values.program) {
          const progArr = values.program
            .split("\n")
            .map((line: string) => {
              const [time, activity] = line.split("|").map((v) => v.trim())
              return time && activity ? { time, activity } : null
            })
            .filter(Boolean)
          formData.append("program", JSON.stringify(progArr))
        }
      }

      // Images handling
      const existingImages: string[] = Array.isArray(initialData?.images)
        ? initialData!.images.filter((u: string) => !removedImages.includes(u))
        : []
      existingImages.forEach((url: string) => formData.append("existingImages", url))
      formData.append("removedImageUrls", JSON.stringify(removedImages || []))

      if (newImages && newImages.length) {
        newImages.forEach((file) => {
          if (file instanceof File) formData.append("images", file)
        })
      }

      if ((initialData as any)?._id) {
        formData.append("_id", (initialData as any)._id)
      }

      await onSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Form {...form}>
          <form id="event-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <FormSection
              icon={CalendarIcon}
              title="Informations générales"
              description="Définissez les informations de base de votre événement"
              variant="primary"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Titre de l'événement *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Entrez le nom de l'événement"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-base"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-500" />
                        Type d'événement *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-base">
                            <SelectValue placeholder="Sélectionnez un type d'événement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Voyage">
                            <div className="flex items-center gap-2">
                              <Backpack className="w-4 h-4" />
                              Voyage
                            </div>
                          </SelectItem>
                          <SelectItem value="Excursion">
                            <div className="flex items-center gap-2">
                              <Bus className="w-4 h-4" />
                              Excursion
                            </div>
                          </SelectItem>
                          <SelectItem value="Club">
                            <div className="flex items-center gap-2">
                              <MapIcon className="w-4 h-4" />
                              Club
                            </div>
                          </SelectItem>
                          <SelectItem value="Activité">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="w-4 h-4" />
                              Activité
                            </div>
                          </SelectItem>
                          <SelectItem value="Évènement">
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4" />
                              Évènement
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Universal Start / End dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-green-500" />
                        Date de début *
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-12 pl-3 text-left font-normal border-gray-300 hover:border-blue-500 transition-colors bg-white"
                            >
                              {field.value
                                ? format(new Date(field.value), "PPP", { locale: fr })
                                : "Sélectionnez une date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={fr}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-red-500" />
                        Date de fin *
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-12 pl-3 text-left font-normal border-gray-300 hover:border-blue-500 transition-colors bg-white"
                            >
                              {field.value
                                ? format(new Date(field.value), "PPP", { locale: fr })
                                : "Sélectionnez une date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={fr}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Description Section */}
            <FormSection
              icon={Edit3}
              title="Description"
              description="Décrivez votre événement de manière détaillée et attractive"
              variant="success"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900/90">Description de l'événement *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors resize-none text-base"
                        placeholder="Décrivez votre événement en détail : objectifs, programme, public cible..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Pricing Section */}
            <FormSection
              icon={DollarSign}
              title="Tarification"
              description="Définissez les prix pour les différentes catégories de participants"
              variant="warning"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { priceField: "basePrice", label: "Prix d'Adhérent", icon: UsersIcon },
                  { priceField: "cojoinPrice", label: "Prix d'accompagnant", icon: UserRoundCheck },
                  { priceField: "childPrice", label: "Prix Enfant", icon: Star },
                ].map(({ priceField, label, icon: Icon }) => (
                  <FormField
                    key={priceField}
                    control={form.control}
                    name={priceField as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Icon className="w-4 h-4 text-amber-600" />
                          {label}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              placeholder="0"
                              className="h-12 pr-16 border-gray-300 focus:border-amber-500 focus:ring-amber-500 transition-colors text-base"
                              {...field}
                            />
                            <div className="absolute right-3 top-3 bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-sm font-semibold">
                              TND
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companionsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <UserRoundCheck className="w-4 h-4 text-blue-600" />
                        Nombre d'accompagnants
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="childrenCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-600" />
                        Nombre d'enfants
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Includes Section */}
            <FormSection
              icon={ClipboardIcon}
              title="Prestations incluses"
              description="Sélectionnez les éléments inclus dans votre événement"
            >
              <FormField
                control={form.control}
                name="includes"
                render={({ field }) => {
                  const selectedIncludes: string[] = field.value
                    ? field.value
                        .split(",")
                        .map((v: string) => v.trim())
                        .filter(Boolean)
                    : []

                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90">
                        Éléments inclus dans l'événement
                      </FormLabel>
                      <BadgeSelector
                        options={includesOptions}
                        selectedValues={selectedIncludes}
                        onChange={(values) => field.onChange(values.join(", "))}
                        variant="primary"
                      />
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )
                }}
              />
            </FormSection>

            {/* Participants Section */}
            <FormSection
              icon={UsersIcon}
              title="Gestion des participants"
              description="Définissez le nombre de participants autorisés"
            >
              <div className="max-w-md">
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-orange-600" />
                        Nombre maximum de participants *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Ex: 50"
                          className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Définissez le nombre maximum de participants autorisés
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Type-specific fields with modern styling */}
            {selectedType === "Voyage" && (
              <FormSection
                icon={Backpack}
                title="Détails du voyage"
                description="Informations spécifiques à votre voyage"
                variant="primary"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-blue-600" />
                          Destination *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Paris, France"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departureCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-green-600" />
                          Ville de départ *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Tunis"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Bus className="w-4 h-4 text-purple-600" />
                          Type de transport *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Sélectionnez le transport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Avion">
                              <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4" />
                                Avion
                              </div>
                            </SelectItem>
                            <SelectItem value="Bus">
                              <div className="flex items-center gap-2">
                                <Bus className="w-4 h-4" />
                                Bus
                              </div>
                            </SelectItem>
                            <SelectItem value="Train">
                              <div className="flex items-center gap-2">
                                <TramFront className="w-4 h-4" />
                                Train
                              </div>
                            </SelectItem>
                            <SelectItem value="Bateau">
                              <div className="flex items-center gap-2">
                                <Sailboat className="w-4 h-4" />
                                Bateau
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accommodation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Hotel className="w-4 h-4 text-amber-600" />
                          Hébergement
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Hôtel 4 étoiles"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
            )}

            {/* Excursion fields with modern styling */}
            {selectedType === "Excursion" && (
              <FormSection
                icon={Bus}
                title="Détails de l'excursion"
                description="Informations spécifiques à votre excursion"
                variant="success"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-green-600" />
                          Destination *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Tunis, Carthage"
                            className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="durationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Durée *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-colors bg-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(normalizeTime(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meetingPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-purple-600" />
                          Point de rencontre *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Devant le musée du Bardo"
                            className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meetingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          Heure de rencontre *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-colors bg-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(normalizeTime(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Equipment Required with modern badge selector */}
                <FormField
                  control={form.control}
                  name="equipmentRequired"
                  render={({ field }) => {
                    const selectedEquipment: string[] = field.value
                      ? field.value
                          .split(",")
                          .map((v: string) => v.trim())
                          .filter(Boolean)
                      : []
                    return (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Backpack className="w-4 h-4 text-amber-600" />
                          Équipement requis
                        </FormLabel>
                        <BadgeSelector
                          options={EXCURSION_EQUIPMENT_OPTIONS}
                          selectedValues={selectedEquipment}
                          onChange={(values) => field.onChange(values.join(", "))}
                          variant="success"
                        />
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </FormSection>
            )}

            {/* Club fields - keeping existing logic but with modern styling */}
            {selectedType === "Club" && (
              <FormSection icon={MapIcon} title="Détails du club" description="Informations spécifiques à votre club">
                <FormField
                  control={form.control}
                  name="adresseclub"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-blue-600" />
                        Adresse du club
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Adresse du club"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Schedule field - keeping existing complex logic */}
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => {
                    const schedule: {
                      day: any
                       time: { startTime: string; endTime: string }
                     }[] = Array.isArray(field.value) ? field.value : []

                    const updateSchedule = (idx: number, key: "day" | "startTime" | "endTime", value: any) => {
                      const updated = schedule.map((entry, i) =>
                        i === idx
                          ? key === "day"
                            ? { ...entry, day: value instanceof Date ? value : value ? new Date(value) : "" }
                            : { ...entry, time: { ...entry.time, [key]: value } }
                          : entry,
                      )
                      field.onChange(updated)
                    }

                    const addEntry = () => {
                      field.onChange([...schedule, { day: "", time: { startTime: "", endTime: "" } }])
                    }

                    const removeEntry = (idx: number) => {
                      field.onChange(schedule.filter((_, i) => i !== idx))
                    }

                    return (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-purple-600" />
                          Planning hebdomadaire
                        </FormLabel>
                        <div className="space-y-4">
                          {schedule.map((entry, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl border border-gray-200"
                            >
                              <FormControl>
                                <Input
                                  type="date"
                                  className="w-48 h-12 border-gray-300 bg-white"
                                  value={entry.day ? formatForDateInput(entry.day) : ""}
                                  onChange={(e) =>
                                    updateSchedule(idx, "day", e.target.value ? new Date(e.target.value) : undefined)
                                  }
                                />
                              </FormControl>

                              <Input
                                type="time"
                                className="flex-1 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                value={entry.time.startTime || ""}
                                onChange={(e) => updateSchedule(idx, "startTime", normalizeTime(e.target.value))}
                                placeholder="Début"
                              />
                              <Input
                                type="time"
                                className="flex-1 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                value={entry.time.endTime || ""}
                                onChange={(e) => updateSchedule(idx, "endTime", normalizeTime(e.target.value))}
                                placeholder="Fin"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeEntry(idx)}
                                className="h-12 w-12"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            onClick={addEntry}
                            variant="outline"
                            className="w-full h-12 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors bg-transparent"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter une plage horaire
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryclub"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-green-600" />
                          Catégorie du club
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Catégorie"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-orange-600" />
                          Tranche d'âge
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Sélectionnez une tranche d'âge" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Enfants">Enfants</SelectItem>
                              <SelectItem value="Adolescents">Adolescents</SelectItem>
                              <SelectItem value="Adultes">Adultes</SelectItem>
                              <SelectItem value="Tous">Tous</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
            )}

            {/* Activity fields - keeping existing logic with modern styling */}
            {selectedType === "Activité" && (
              <FormSection
                icon={Dumbbell}
                title="Détails de l'activité"
                description="Informations spécifiques à votre activité sportive"
                variant="success"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-blue-600" />
                          Type de sport
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-green-500">
                              <SelectValue placeholder="Sélectionnez un sport" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Football">Football</SelectItem>
                              <SelectItem value="Basketball">Basketball</SelectItem>
                              <SelectItem value="Handball">Handball</SelectItem>
                              <SelectItem value="Volleyball">Volleyball</SelectItem>
                              <SelectItem value="Tennis">Tennis</SelectItem>
                              <SelectItem value="Natation">Natation</SelectItem>
                              <SelectItem value="Athlétisme">Athlétisme</SelectItem>
                              <SelectItem value="Rugby">Rugby</SelectItem>
                              <SelectItem value="Cyclisme">Cyclisme</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          Durée
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors bg-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(normalizeTime(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-red-600" />
                          Lieu
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lieu"
                            className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="equipmentProvided"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-amber-600" />
                        Équipement fourni (séparé par virgule)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Équipement fourni"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            )}

            {/* Event fields - keeping existing logic with modern styling */}
            {selectedType === "Évènement" && (
              <FormSection
                icon={Music}
                title="Détails de l'événement"
                description="Informations spécifiques à votre événement"
                variant="warning"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-red-600" />
                          Lieu
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lieu de l'événement"
                            className="h-12 border-gray-300 focus:border-amber-500 focus:ring-amber-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Heure de l'évènement
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-12 border-gray-300 focus:border-amber-500 focus:ring-amber-500 transition-colors bg-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                        <UserRoundCheck className="w-4 h-4 text-green-600" />
                        Organisateur
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Organisateur"
                          className="h-12 border-gray-300 focus:border-amber-500 focus:ring-amber-500 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            )}

            {/* Images Section */}
            <FormSection
              icon={ImageIcon}
              title="Images de l'événement"
              description="Ajoutez des images pour illustrer votre événement"
            >
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      Galerie d'images
                    </FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors">
                        <ImageUploader
                          initialImages={initialData?.images || []}
                          onChange={handleImagesChange}
                          disabled={submitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Ajoutez des images de qualité pour rendre votre événement plus attractif
                    </p>
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Action Footer - only the submit Button is changed below */}
            <Card className="bg-gradient-to-r from-white to-gray-100/20 border-2 border-gray-200 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-sm text-gray-500">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Les champs marqués d'un astérisque (*) sont obligatoires
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Assurez-vous de remplir tous les champs requis avant de soumettre
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/responsable/events")}
                      className="flex items-center gap-2 px-6 py-3 h-12 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </Button>

                    { /* Replaced submit button: use consistent compact style */ }
                    <Button
                      type="submit"
                      form="event-form"
                      disabled={isSubmitting}
                      className="h-12 px-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <TailChase size={16} color="white" />
                          <span>{isEditMode ? "Mise à jour..." : "Création..."}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{isEditMode ? "Mettre à jour" : "Créer"}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}
