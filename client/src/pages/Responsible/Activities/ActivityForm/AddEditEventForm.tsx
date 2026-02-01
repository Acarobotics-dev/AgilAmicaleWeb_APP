"use client"

import type React from "react"
import { useForm, useWatch } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar as CalendarIcon,
  Check,
  Plane,
  Bus,
  Train,
  Ship,
  Tent,
  Building2,
  Dumbbell,
  PartyPopper,
  MapPin,
  Clock,
  Briefcase,
  Users,
  Shirt,
  Camera,
  Utensils,
  Sun,
  Umbrella,
  Glasses,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import type { Event, EventType } from "./types"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import ImageUploader from "@/components/common/ImagesUploader"
import { toast } from "react-toastify"

// Modern SaaS-style Constants (No Emojis)
const EVENT_TYPES = [
  { value: "Voyage", label: "Voyage", icon: Plane },
  { value: "Excursion", label: "Excursion", icon: Bus },
  { value: "Club", label: "Club", icon: Building2 },
  { value: "Activité", label: "Activité", icon: Dumbbell },
  { value: "Évènement", label: "Évènement", icon: PartyPopper },
] as const

const TRANSPORT_TYPES = [
  { value: "Avion", label: "Avion", icon: Plane },
  { value: "Bus", label: "Bus", icon: Bus },
  { value: "Train", label: "Train", icon: Train },
  { value: "Bateau", label: "Bateau", icon: Ship },
] as const

const SPORT_TYPES = [
  "Football", "Basketball", "Handball", "Volleyball",
  "Tennis", "Natation", "Athlétisme", "Rugby", "Cyclisme", "Autre"
] as const

const AGE_GROUPS = [
  "Enfants", "Adolescents", "Adultes", "Tous"
] as const

// Updated Includes with Icons
const INCLUDES_OPTIONS: Record<string, { label: string; icon: React.ElementType }[]> = {
  Voyage: [
    { label: "Hébergement", icon: Building2 },
    { label: "Transport", icon: Bus },
    { label: "Petit-déjeuner", icon: Utensils },
    { label: "Visites guidées", icon: MapPin },
    { label: "Billets d'entrée", icon: Briefcase }, // Abstract ticket icon
  ],
  Excursion: [
    { label: "Transport", icon: Bus },
    { label: "Guide", icon: Users },
    { label: "Collation", icon: Utensils },
    { label: "Entrées", icon: Briefcase },
  ],
  Club: [
    { label: "Accès aux locaux", icon: Building2 },
    { label: "Matériel fourni", icon: Briefcase },
    { label: "Encadrement", icon: Users },
    { label: "Goûter", icon: Utensils },
  ],
  Activité: [
    { label: "Coach sportif", icon: Dumbbell },
    { label: "Matériel", icon: Briefcase },
    { label: "Assurance", icon: Briefcase }, // Abstract
    { label: "Espace réservé", icon: MapPin },
  ],
  Évènement: [
    { label: "Intervenants", icon: Users },
    { label: "Programme", icon: Briefcase },
    { label: "Pause-café", icon: Utensils },
  ],
}

// Updated Equipment with Icons
const EXCURSION_EQUIPMENT = [
  { label: "Casquette", icon: Sun }, // Abstract for hat/sun protection
  { label: "Crème solaire", icon: Sun },
  { label: "Bouteille d'eau", icon: Utensils }, // Abstract
  { label: "Sac à dos", icon: Briefcase },
  { label: "Lunettes", icon: Glasses },
  { label: "Vêtements", icon: Shirt },
  { label: "K-way", icon: Umbrella },
  { label: "Appareil photo", icon: Camera },
  { label: "Encas", icon: Utensils },
  { label: "Carte d'identité", icon: Briefcase },
]

// --- Modern UI Components ---

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

const FormSection = ({ title, description, children }: FormSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <Separator className="bg-gray-200" />
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

interface BadgeSelectorProps {
  options: { label: string; icon: React.ElementType }[]
  selected: string[]
  onChange: (values: string[]) => void
}

const BadgeSelector = ({ options, selected, onChange }: BadgeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.label)
          const Icon = option.icon
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                const newValues = isSelected
                  ? selected.filter(label => label !== option.label)
                  : [...selected, option.label]
                onChange(newValues)
              }}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-all
                ${isSelected
                  ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`} />
              {option.label}
              {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Main Form Component ---

interface AddEditEventFormProps {
  onSubmit: (formData: FormData) => void
  initialData?: Event
}

export function AddEditEventForm({ onSubmit, initialData }: AddEditEventFormProps) {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [removedImages, setRemovedImages] = useState<string[]>([])

  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "Excursion", // Default to Excursion if new
      description: initialData?.description || "",
      images: [] as File[],
      featuredPhoto: initialData?.featuredPhoto || "",
      basePrice: (initialData?.pricing as any)?.basePrice?.toString() || initialData?.pricing?.toString() || "",
      cojoinPrice: (initialData?.pricing as any)?.cojoinPrice?.toString() || initialData?.cojoinPrice?.toString() || "",
      childPrice: (initialData?.pricing as any)?.childPrice?.toString() || initialData?.childPrice?.toString() || "",
      companionsCount: (initialData as any)?.companionsCount?.toString() || "",
      childrenCount: (initialData as any)?.childrenCount?.toString() || "",
      includes: initialData?.includes?.join(", ") || "",
      maxParticipants: initialData?.maxParticipants?.toString() || "",
      currentParticipants: initialData?.currentParticipants?.toString() || "",
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,

      // Type specific defaults - handle safe access
      destination: (initialData as any)?.destination || "",
      departureCity: (initialData as any)?.departureCity || "",
      transportType: (initialData as any)?.transportType || "",
      accommodation: (initialData as any)?.accommodation || "",
      duration: (initialData as any)?.durationHours?.toString() || (initialData as any)?.durationMinutes?.toString() || "",
      meetingPoint: (initialData as any)?.meetingPoint || "",
      meetingTime: (initialData as any)?.meetingTime || "",
      equipmentRequired: (initialData as any)?.equipmentRequired?.join(", ") || "",
      clubAddress: (initialData as any)?.adresseclub || "",
      clubCategory: (initialData as any)?.categoryclub || "",
      ageGroup: (initialData as any)?.ageGroup || "",
      sportType: (initialData as any)?.sportType || "",
      location: (initialData as any)?.location || "",
      eventTime: (initialData as any)?.eventTime || "",
      organizer: (initialData as any)?.organizer || "",
    },
  })

  // Watch type to conditionally render fields
  const selectedType = useWatch({ control: form.control, name: "type" }) as EventType

  // Handlers
  const handleImagesChange = useCallback((payload: {
    newFiles: File[]
    removedUrls: string[]
  }) => {
    const { newFiles, removedUrls } = payload
    setNewImages(newFiles || [])
    setRemovedImages(removedUrls || [])
    form.setValue("images" as any, newFiles || [])
  }, [form])

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const formData = new FormData()

      // Common fields
      const commonFields = [
        "title", "type", "description", "featuredPhoto",
        "maxParticipants", "currentParticipants", "isActive", "isFeatured"
      ]
      commonFields.forEach(field => {
        if (values[field] !== undefined && values[field] !== null) formData.append(field, values[field].toString())
      })

      // Dates
      if (values.startDate) formData.append("startDate", format(values.startDate, "yyyy-MM-dd"))
      if (values.endDate) formData.append("endDate", format(values.endDate, "yyyy-MM-dd"))

      // Pricing
      const pricing: any = {}
      if (values.basePrice) pricing.basePrice = Number(values.basePrice)
      if (values.cojoinPrice) pricing.cojoinPrice = Number(values.cojoinPrice)
      if (values.childPrice) pricing.childPrice = Number(values.childPrice)
      if (Object.keys(pricing).length > 0) {
        formData.append("pricing", JSON.stringify(pricing))
      }

      // Includes calculation (from separate checkboxes/badges logic if implemented, or just the string)
      // Note: In this redesign, we should probably map the includes properly.
      // For now, let's assume 'includes' in values might be coming from a BadgeSelector.
      // But wait, the default value initialized was a string. Let's fix that in the UI part.
      // If using BadgeSelector for includes, we need to adapt.

      // Let's assume values.includes is a string (comma separated) OR array, depending on how we hook it up.
      // I will implement a proper Includes selector below.
      if (Array.isArray(values.includes)) {
        formData.append("includes", JSON.stringify(values.includes))
      } else if (typeof values.includes === 'string' && values.includes) {
        // Fallback for string input
        const inc = values.includes.split(",").map((s: string) => s.trim()).filter(Boolean)
        formData.append("includes", JSON.stringify(inc))
      }

      // Type-specifics
      switch (selectedType) {
        case "Voyage":
          if (values.destination) formData.append("destination", values.destination)
          if (values.departureCity) formData.append("departureCity", values.departureCity)
          if (values.transportType) formData.append("transportType", values.transportType)
          if (values.accommodation) formData.append("accommodation", values.accommodation)
          break
        case "Excursion":
          if (values.destination) formData.append("destination", values.destination)
          if (values.duration) formData.append("durationHours", values.duration)
          if (values.meetingPoint) formData.append("meetingPoint", values.meetingPoint)
          if (values.meetingTime) formData.append("meetingTime", values.meetingTime)
          // Equipment
          if (values.equipmentRequired) {
            // If string
            if (typeof values.equipmentRequired === 'string') {
              const equipment = values.equipmentRequired.split(",").map((v: string) => v.trim()).filter(Boolean)
              formData.append("equipmentRequired", JSON.stringify(equipment))
            } else if (Array.isArray(values.equipmentRequired)) {
              formData.append("equipmentRequired", JSON.stringify(values.equipmentRequired))
            }
          }
          break
        case "Club":
          if (values.clubAddress) formData.append("adresseclub", values.clubAddress)
          if (values.clubCategory) formData.append("categoryclub", values.clubCategory)
          if (values.ageGroup) formData.append("ageGroup", values.ageGroup)
          break
        case "Activité":
          if (values.sportType) formData.append("sportType", values.sportType)
          if (values.duration) formData.append("durationMinutes", values.duration)
          if (values.location) formData.append("location", values.location)
          break
        case "Évènement":
          if (values.location) formData.append("location", values.location)
          if (values.eventTime) formData.append("eventTime", values.eventTime)
          if (values.organizer) formData.append("organizer", values.organizer)
          break
      }

      // Images
      const existingImages: string[] = Array.isArray(initialData?.images)
        ? initialData!.images.filter(url => !removedImages.includes(url))
        : []
      existingImages.forEach(url => formData.append("existingImages", url))
      if (removedImages.length) formData.append("removedImageUrls", JSON.stringify(removedImages))
      newImages.forEach(file => formData.append("images", file))

      if ((initialData as any)?._id) {
        formData.append("_id", (initialData as any)._id)
      }

      await onSubmit(formData)
    } catch (error) {
      console.error(error)
      toast.error("Une erreur est survenue lors de la préparation des données.")
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to render type-specific fields
  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case "Voyage":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl><Input placeholder="Ex: Paris" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departureCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville de départ</FormLabel>
                  <FormControl><Input placeholder="Ex: Tunis" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSPORT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2"><t.icon className="w-4 h-4" />{t.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hébergement</FormLabel>
                  <FormControl><Input placeholder="Ex: Hôtel 4 étoiles" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case "Excursion":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl><Input placeholder="Ex: Carthage" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meetingPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Point de rencontre</FormLabel>
                    <FormControl><Input placeholder="Ex: Devant le musée" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (heures)</FormLabel>
                    <FormControl><Input type="number" placeholder="Ex: 4" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meetingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de rencontre</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Equipment Selector */}
            <FormField
              control={form.control}
              name="equipmentRequired"
              render={({ field }) => {
                // Ensure value is initialized correctly for array ops
                // If it's a string, we might need to rely on the badge selector to handle it?
                // Actually, let's just control the field as an array of strings in the form state if possible,
                // but our defaultValues set it to string. Let's adapt.
                // We'll treat the field value as string for storage (comma joined) but parse for the UI
                const current = typeof field.value === 'string' && field.value ? field.value.split(',').map((s: string) => s.trim()) : []

                return (
                  <FormItem>
                    <FormLabel>Équipement requis</FormLabel>
                    <FormControl>
                      <BadgeSelector
                        options={EXCURSION_EQUIPMENT}
                        selected={current}
                        onChange={(vals) => field.onChange(vals.join(', '))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        )

      case "Club":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clubAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl><Input placeholder="Adresse du club" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clubCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <FormControl><Input placeholder="Ex: Sport, Art" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ageGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tranche d'âge</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {AGE_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        )

      case "Activité":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SPORT_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée (minutes)</FormLabel>
                  <FormControl><Input type="number" placeholder="Ex: 90" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu</FormLabel>
                  <FormControl><Input placeholder="Lieu de l'activité" {...field} /></FormControl>
                </FormItem>
              )}
            />
          </div>
        )

      case "Évènement":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu</FormLabel>
                  <FormControl><Input placeholder="Lieu de l'événement" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisateur</FormLabel>
                  <FormControl><Input placeholder="Nom de l'organisateur" {...field} /></FormControl>
                </FormItem>
              )}
            />
          </div>
        )

      default:
        return null
    }
  }

  // Calculate includes options based on type
  const currentIncludesOptions = useMemo(() => INCLUDES_OPTIONS[selectedType] || [], [selectedType])

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {initialData ? "Modifier l'événement" : "Nouvel événement"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Remplissez les détails ci-dessous pour publier votre événement.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">

            {/* 1. Informations Générales */}
            <FormSection title="Informations générales" description="Détails de base sur l'activité.">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl><Input placeholder="Ex: Voyage organisé..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'activité</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {EVENT_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>
                                <div className="flex items-center gap-2">
                                  <t.icon className="w-4 h-4 text-gray-500" />
                                  <span>{t.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Début</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={`pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                  {field.value ? format(field.value, "PP", { locale: fr }) : <span>Date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus locale={fr} />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fin</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={`pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                  {field.value ? format(field.value, "PP", { locale: fr }) : <span>Date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus locale={fr} />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Décrivez l'événement en détail..." className="resize-none min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* 2. Détails spécifiques */}
            <FormSection title={`Détails - ${selectedType}`} description="Informations spécifiques au type sélectionné.">
              {renderTypeSpecificFields()}
            </FormSection>

            {/* 3. Inclus & Tarification */}
            <FormSection title="Tarification & Services" description="Définissez les prix et les services inclus.">
              <div className="space-y-6">
                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix Adhérent (TND)</FormLabel>
                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cojoinPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix Conjoint</FormLabel>
                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix Enfant</FormLabel>
                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Includes */}
                {currentIncludesOptions.length > 0 && (
                  <FormField
                    control={form.control}
                    name="includes"
                    render={({ field }) => {
                      const current = typeof field.value === 'string' && field.value ? field.value.split(',').map(s => s.trim()) : []
                      return (
                        <FormItem>
                          <FormLabel>Inclus dans l'offre</FormLabel>
                          <FormControl>
                            <BadgeSelector
                              options={currentIncludesOptions}
                              selected={current}
                              onChange={(vals) => field.onChange(vals.join(', '))}
                            />
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                )}
              </div>
            </FormSection>

            {/* 4. Participants */}
            <FormSection title="Participants & Capacité" description="Gérez les places disponibles.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité maximale</FormLabel>
                      <FormControl><Input type="number" placeholder="Ex: 50" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Actif</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Rendre l'événement visible aux utilisateurs
                        </div>
                      </div>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* 5. Images */}
            <FormSection title="Galerie" description="Ajoutez des images pour illustrer l'événement.">
              <div className="space-y-4">
                <ImageUploader
                  initialImages={initialData?.images || []}
                  onChange={handleImagesChange}
                />
              </div>
            </FormSection>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 hover:bg-gray-800 text-white min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  )
}