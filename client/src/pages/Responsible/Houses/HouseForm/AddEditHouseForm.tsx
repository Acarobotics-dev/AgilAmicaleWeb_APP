"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import {
  CalendarIcon,
  Loader2,
  Plus,
  Trash2,
  Check,
  Sofa,
  Tv,
  Wifi,
  Wind,
  Waves,
  Car,
  Trees,
  Utensils,
} from "lucide-react"
import { toast } from "react-toastify"; // Switched to react-toastify
import ImageUploader from "@/components/common/ImagesUploader"
import { houseFormSchema } from "./houseFormSchema"

type HouseFormValues = z.infer<typeof houseFormSchema>

// Constants
const TUNISIAN_GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "Manouba", "Médenine",
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan"
]

const AMENITIES_OPTIONS = [
  { label: "Climatisation", icon: Wind },
  { label: "Wi-Fi", icon: Wifi },
  { label: "Télévision", icon: Tv },
  { label: "Piscine", icon: Waves },
  { label: "Parking", icon: Car },
  { label: "Jardin", icon: Trees },
  { label: "Cuisine équipée", icon: Utensils },
  { label: "Meublé", icon: Sofa },
]

interface AddEditHouseFormProps {
  onSubmit: (values: FormData) => Promise<void>
  initialData?: {
    _id?: string
    title: string
    address: string
    description: string
    location: string
    price: { week: { startdate: Date; endDate: Date }; price: number }[]
    numberOfRooms: number
    numberOfBathrooms: number
    amenities: string[]
    images: string[]
  }
}

// Helpers
function transformInitialPrice(priceArr?: any[]) {
  if (!priceArr || !Array.isArray(priceArr)) return [{ week: { startdate: "", endDate: "" }, price: "" }]
  return priceArr.map(p => ({
    week: {
      startdate: p.week?.startdate ? new Date(p.week.startdate) : undefined,
      endDate: p.week?.endDate ? new Date(p.week.endDate) : undefined
    },
    price: p.price
  }))
}

export function AddEditHouseForm({ onSubmit, initialData }: AddEditHouseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([])

  const form = useForm<HouseFormValues>({
    resolver: zodResolver(houseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      address: initialData?.address || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      numberOfRooms: initialData?.numberOfRooms || 0,
      numberOfBathrooms: initialData?.numberOfBathrooms || 0,
      amenities: initialData?.amenities.join(",") || "",
      // Note: Schema likely expects string for amenities if it was .join(",") in previous code,
      // but ideally we should change schema to array.
      // For now, let's stick to the previous pattern of comma-separated string if that's what the schema validation expects.
      // However, looking at the previous code, it was doing JSON.stringify(selectedAmenities) in submit.
      // Let's verify how we handle it. We'll use a local state for selection and sync to form.
    },
  })

  // Handling Amenities as array locally
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || [])

  // Handling Pricing manually since it's complex structure
  const [prices, setPrices] = useState<any[]>(transformInitialPrice(initialData?.price))

  const handlePriceChange = (index: number, field: string, value: any) => {
    const newPrices = [...prices]
    if (field === 'price') newPrices[index].price = value
    else if (field === 'startdate') newPrices[index].week.startdate = value
    else if (field === 'endDate') newPrices[index].week.endDate = value
    setPrices(newPrices)
  }

  const addPriceRow = () => {
    setPrices([...prices, { week: { startdate: undefined, endDate: undefined }, price: "" }])
  }

  const removePriceRow = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index))
  }

  const handleImagesChange = (payload: { newFiles: File[], removedUrls: string[] }) => {
    setImageFiles(payload.newFiles)
    setRemovedImageUrls(payload.removedUrls)
  }

  const handleSubmit = async (values: HouseFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Basic Fields
      formData.append("title", values.title)
      formData.append("address", values.address)
      formData.append("description", values.description)
      formData.append("location", values.location)
      formData.append("numberOfRooms", values.numberOfRooms.toString())
      formData.append("numberOfBathrooms", values.numberOfBathrooms.toString())

      // Arrays
      formData.append("amenities", JSON.stringify(selectedAmenities))

      // Process prices to match backend expectation
      const validPrices = prices.filter(p => p.price && p.week.startdate && p.week.endDate).map(p => ({
        week: {
          startdate: p.week.startdate,
          endDate: p.week.endDate
        },
        price: Number(p.price)
      }))
      formData.append("price", JSON.stringify(validPrices))

      // Images
      imageFiles.forEach(file => formData.append("images", file))
      if (initialData?.images) {
        const kept = initialData.images.filter(url => !removedImageUrls.includes(url))
        formData.append("keptImageUrls", JSON.stringify(kept))
        formData.append("removedImageUrls", JSON.stringify(removedImageUrls))
      }

      if (initialData?._id) formData.append("_id", initialData._id)

      await onSubmit(formData)
    } catch (e) {
      console.error(e)
      toast.error("Une erreur est survenue lors de la préparation des données.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 ">
        <h1 className="text-2xl font-semibold text-gray-900">
          {initialData ? "Modifier la propriété" : "Nouvelle propriété"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les détails de votre maison de vacances.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">

          {/* Section 1: Info Base */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl><Input placeholder="Ex: Villa avec piscine" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gouvernorat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TUNISIAN_GOVERNORATES.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète</FormLabel>
                  <FormControl><Input placeholder="Rue, Code postal..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les atouts de votre propriété..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 2: Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Caractéristiques</h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="numberOfRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chambres</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfBathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salles de bain</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>Équipements</FormLabel>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map((item) => {
                  const isSelected = selectedAmenities.includes(item.label)
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setSelectedAmenities(prev =>
                          isSelected ? prev.filter(x => x !== item.label) : [...prev, item.label]
                        )
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-all",
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                      {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Tarification</h3>
            <Separator />

            <div className="space-y-4">
              {prices.map((price, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex-1 space-y-2 w-full">
                    <FormLabel className="text-xs text-gray-500">Période</FormLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !price.week.startdate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {price.week.startdate ? format(price.week.startdate, "P", { locale: fr }) : "Début"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={price.week.startdate} onSelect={(date) => handlePriceChange(idx, 'startdate', date)} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !price.week.endDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {price.week.endDate ? format(price.week.endDate, "P", { locale: fr }) : "Fin"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={price.week.endDate} onSelect={(date) => handlePriceChange(idx, 'endDate', date)} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="w-full md:w-32 space-y-2">
                    <FormLabel className="text-xs text-gray-500">Prix (DT)</FormLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price.price}
                      onChange={(e) => handlePriceChange(idx, 'price', e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removePriceRow(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addPriceRow} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Ajouter une période
              </Button>
            </div>
          </div>

          {/* Section 4: Images */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Photos</h3>
            <Separator />
            <ImageUploader
              initialImages={initialData?.images || []}
              onChange={handleImagesChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur pb-4 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  )
}