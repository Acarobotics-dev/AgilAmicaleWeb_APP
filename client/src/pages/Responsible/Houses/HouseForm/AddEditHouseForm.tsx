import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CalendarPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  X,
  Sofa,
  ThermometerSun,
  Tv,
  Wifi,
  Boxes,
  Laptop,
  Bath,
  TreeDeciduous,
  PanelsTopLeft,
  Waves,
  Columns4,
  Table,
  DoorOpen,
  ParkingCircle,
  Fence,
  Camera,
  DollarSign,
  CalendarDays,
  Info,
  Layers,
} from "lucide-react";
import { fr } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { priceValidation } from "./validation";
import { houseFormSchema } from "./houseFormSchema";
import ImageUploader from "@/components/common/ImagesUploader";

type HouseFormValues = z.infer<typeof houseFormSchema>;

// Constants
const TUNISIAN_GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "Manouba", "Médenine",
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

const AMENITIES_OPTIONS = [
  { label: "Entièrement meublé", icon: Sofa },
  { label: "Climatisation / Chauffage", icon: ThermometerSun },
  { label: "Télévision intelligente", icon: Tv },
  { label: "Internet / Wi-Fi", icon: Wifi },
  { label: "Placards intégrés / Rangements", icon: Boxes },
  { label: "Bureau / Espace de télétravail", icon: Laptop },
  { label: "Baignoire / Douche à l'italienne", icon: Bath },
  { label: "Jardin privé", icon: TreeDeciduous },
  { label: "Balcon / Terrasse", icon: PanelsTopLeft },
  { label: "Espace barbecue", icon: Columns4 },
  { label: "Piscine", icon: Waves },
  { label: "Coin repas / salon extérieur", icon: Table },
  { label: "Entrée privée", icon: DoorOpen },
  { label: "Garage / Parking couvert / Allée", icon: ParkingCircle },
  { label: "Propriété clôturée", icon: Fence },
  { label: "Système de sécurité / Caméras", icon: Camera },
];

interface AddEditHouseFormProps {
  onSubmit: (values: FormData) => Promise<void>;
  initialData?: {
    _id?: string;
    title: string;
    address: string;
    description: string;
    location: string;
    price: { week: { startdate: Date; endDate: Date }; price: number }[];
    numberOfRooms: number;
    numberOfBathrooms: number;
    amenities: string[];
    isAvailable: boolean;
    postedAt: string;
    images: string[];
  };
}

// Helper functions
function priceArrayToState(
  priceArr?: { week: { startdate: Date; endDate: Date }; price: number }[]
) {
  if (!priceArr || !Array.isArray(priceArr)) {
    return [{ startdate: "", endDate: "", price: "" }];
  }
  return priceArr.map((p) => ({
    startdate: p.week?.startdate ? new Date(p.week.startdate) : "",
    endDate: p.week?.endDate ? new Date(p.week.endDate) : "",
    price: p.price?.toString() || "",
  }));
}

function priceStateToArray(
  state: { startdate: Date | string; endDate: Date | string; price: string }[]
) {
  return state
    .filter(
      (p) =>
        p.startdate &&
        p.endDate &&
        p.price &&
        !isNaN(Number(p.price)) &&
        !isNaN(new Date(p.startdate).getTime()) &&
        !isNaN(new Date(p.endDate).getTime())
    )
    .map((p) => ({
      week: {
        startdate: new Date(p.startdate),
        endDate: new Date(p.endDate),
      },
      price: Number(p.price),
    }));
}

export function AddEditHouseForm({
  onSubmit,
  initialData,
}: AddEditHouseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceFields, setPriceFields] = useState<
    { startdate: Date | string; endDate: Date | string; price: string }[]
  >(priceArrayToState(initialData?.price));
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialData?.amenities || []
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  const form = useForm<HouseFormValues>({
    resolver: zodResolver(houseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      address: initialData?.address || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      numberOfRooms: initialData?.numberOfRooms || 0,
      numberOfBathrooms: initialData?.numberOfBathrooms || 0,
      amenities: initialData?.amenities?.join(",") || "",
      images: initialData?.images || [],
    },
  });

  // Extract errors for tab badges
  const { formState: { errors } } = form;

  const handlePriceDateSelect = (
    idx: number,
    key: "startdate" | "endDate",
    date: Date | undefined
  ) => {
    if (!date) return;
    setPriceFields((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: date } : item))
    );
  };

  const handlePriceChange = (
    idx: number,
    key: "startdate" | "endDate" | "price",
    value: string | Date
  ) => {
    setPriceFields((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  };

  const handleAddPriceRow = () => {
    setPriceFields((prev) => [
      ...prev,
      { startdate: "", endDate: "", price: "" },
    ]);
  };

  const handleRemovePriceRow = (idx: number) => {
    setPriceFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAmenityToggle = (label: string) => {
    const newAmenities = selectedAmenities.includes(label)
      ? selectedAmenities.filter((a) => a !== label)
      : [...selectedAmenities, label];
    setSelectedAmenities(newAmenities);
    form.setValue("amenities", newAmenities.join(","));
  };

  const handleSubmit = async (values: HouseFormValues) => {
    setIsSubmitting(true);
    try {
      // Validate price fields
      const priceArr = priceStateToArray(priceFields);
      if (priceArr.length === 0) {
        toast({
          title: "Erreur de prix",
          description: "Au moins une période de prix est requise",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        priceValidation.parse(priceArr[0]);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Erreur de prix",
            description: "Veuillez vérifier les informations de prix",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Check each price row: ensure start <= end and valid dates
      const priceDateErrors: string[] = [];
      priceFields.forEach((p, idx) => {
        if (!p.startdate || !p.endDate) {
          priceDateErrors.push(`Période ${idx + 1} : la date de début et de fin sont requises`);
          return;
        }
        const s = new Date(p.startdate as Date);
        const e = new Date(p.endDate as Date);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) {
          priceDateErrors.push(`Période ${idx + 1} : dates invalides`);
          return;
        }
        if (s.getTime() > e.getTime()) {
          priceDateErrors.push(`Période ${idx + 1} : la date de début est après la date de fin`);
        }
      });
      if (priceDateErrors.length > 0) {
        toast({
          title: "Erreurs de périodes tarifaires",
          description: priceDateErrors.join("; "),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Append basic fields
      const basicFields = {
        title: values.title,
        address: values.address,
        description: values.description,
        location: values.location,
        numberOfRooms: values.numberOfRooms.toString(),
        numberOfBathrooms: values.numberOfBathrooms.toString(),
      };

      Object.entries(basicFields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append price, amenities
      formData.append("price", JSON.stringify(priceArr));
      formData.append("amenities", JSON.stringify(selectedAmenities));

      // DEBUG: log price array before building final payload
      // eslint-disable-next-line no-console
      console.log("Computed priceArr:", priceArr);

      // Append images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // DEBUG: log final FormData entries (files shown as File objects)
      // eslint-disable-next-line no-console
      console.log("Final FormData entries:", Array.from(formData.entries()));

      // Include removed and kept image URLs
      formData.append(
        "removedImageUrls",
        JSON.stringify(removedImageUrls || [])
      );
      const keptImageUrls = initialData?.images
        ? initialData.images.filter((url) => !removedImageUrls.includes(url))
        : [];
      formData.append("keptImageUrls", JSON.stringify(keptImageUrls));
      if (initialData?._id) {
        formData.append("_id", initialData._id);
      }

      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la soumission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form
          id="house-form"
          onSubmit={form.handleSubmit(
            handleSubmit,
            (errors) => {
              // Log and notify validation errors so you can see what's failing
              // eslint-disable-next-line no-console
              console.error("Validation errors:", errors);
              toast({
                title: "Validation",
                description: "Veuillez vérifier les champs requis et corriger les erreurs.",
                variant: "destructive",
              });
            }
          )}
          className="space-y-8"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-gray-100 text-gray-500 rounded-xl p-1.5 mb-6 w-full justify-start overflow-x-auto flex flex-nowrap">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 gap-2 flex-shrink-0 relative"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Informations de base</span>
                <span className="sm:hidden">Base</span>
                {(errors.title || errors.location || errors.address || errors.description) && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full"></Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 gap-2 flex-shrink-0 relative"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Caractéristiques</span>
                <span className="sm:hidden">Caract.</span>
                {(errors.numberOfRooms || errors.numberOfBathrooms) && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full"></Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 gap-2 flex-shrink-0"
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Tarification</span>
                <span className="sm:hidden">Prix</span>
              </TabsTrigger>
              <TabsTrigger
                value="amenities"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 gap-2 flex-shrink-0"
              >
                <Sofa className="w-4 h-4" />
                <span className="hidden sm:inline">Équipements</span>
                <span className="sm:hidden">Équip.</span>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 gap-2 flex-shrink-0 relative"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Images</span>
                <span className="sm:hidden">Photos</span>
                {errors.images && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full"></Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <p className="text-xs text-gray-500 mb-6 text-center">
              Remplissez tous les onglets pour compléter le formulaire
            </p>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic" className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              Informations de base
            </h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Titre de la propriété *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Villa moderne avec piscine"
                        className="h-12 border-input focus:border-primary focus:ring-primary/20 rounded-xl bg-white"
                        {...field}
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
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Gouvernorat *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                          <SelectValue placeholder="Sélectionnez un gouvernorat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {TUNISIAN_GOVERNORATES.map((gov) => (
                          <SelectItem
                            key={gov}
                            value={gov}
                            className="rounded-lg"
                          >
                            {gov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Adresse complète *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 15 Avenue Habib Bourguiba, Centre-ville"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Description détaillée *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none"
                        placeholder="Décrivez votre propriété en détail : style, ambiance, points forts, proximité des commodités..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          </TabsContent>

          {/* Tab 2: Features */}
          <TabsContent value="features" className="space-y-6">
          {/* Details Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              Caractéristiques de la propriété
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="numberOfRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Nombre de chambres *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 3"
                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl text-center font-semibold"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
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
                    <FormLabel className="text-sm font-semibold text-gray-900/90 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Nombre de salles de bain *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2"
                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl text-center font-semibold"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          </TabsContent>

          {/* Tab 3: Pricing */}
          <TabsContent value="pricing" className="space-y-6">
          {/* Availability & Pricing Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              Disponibilité & Tarification
            </h3>
            <div className="space-y-8">
              {/* Pricing Section */}
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Tarification par Période
                </h4>
                <div className="space-y-4">
                  {priceFields.map((field, idx) => {
                    const hasError =
                      (!field.startdate || !field.endDate || !field.price) &&
                      form.formState.isSubmitted;
                    const priceError =
                      field.price && isNaN(Number(field.price))
                        ? "Le prix doit être un nombre valide"
                        : "";

                    return (
                      <div
                        key={idx}
                        className="bg-gray-100 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-900/90 mb-2">
                              Période {idx + 1}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "w-full h-12 text-left border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-xl",
                                        hasError && !field.startdate
                                          ? "border-red-500"
                                          : ""
                                      )}
                                    >
                                      {field.startdate && typeof field.startdate !== "string"
                                        ? format(new Date(field.startdate), "dd/MM/yyyy")
                                        : "Sélectionnez une date de début"}
                                      <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.startdate && typeof field.startdate !== "string"
                                        ? new Date(field.startdate)
                                        : undefined
                                    }
                                    onSelect={(date) => handlePriceDateSelect(idx, "startdate", date)}
                                    initialFocus
                                    locale={fr}
                                    weekStartsOn={1}
                                    className="rounded-xl"
                                  />
                                </PopoverContent>
                              </Popover>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "w-full h-12 text-left border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-xl",
                                        hasError && !field.endDate
                                          ? "border-red-500"
                                          : ""
                                      )}
                                    >
                                      {field.endDate && typeof field.endDate !== "string"
                                        ? format(new Date(field.endDate), "dd/MM/yyyy")
                                        : "Sélectionnez une date de fin"}
                                      <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.endDate && typeof field.endDate !== "string"
                                        ? new Date(field.endDate)
                                        : undefined
                                    }
                                    onSelect={(date) => handlePriceDateSelect(idx, "endDate", date)}
                                    initialFocus
                                    locale={fr}
                                    weekStartsOn={1}
                                    className="rounded-xl"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <div className="w-full lg:w-40">
                            <label className="block text-sm font-medium text-gray-900/90 mb-2">
                              Prix (DT)
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={field.price}
                                onChange={(e) =>
                                  handlePriceChange(
                                    idx,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className={cn(
                                  "h-12 text-center font-semibold border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-xl",
                                  (hasError && !field.price) || priceError
                                    ? "border-red-500"
                                    : ""
                                )}
                              />
                              {hasError && !field.price && (
                                <div className="absolute -bottom-6 text-xs text-red-500">
                                  Le prix est requis
                                </div>
                              )}
                              {priceError && (
                                <div className="absolute -bottom-6 text-xs text-red-500">
                                  {priceError}
                                </div>
                              )}
                            </div>
                          </div>
                          {priceFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemovePriceRow(idx)}
                              className="mt-6 lg:mt-0 rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPriceRow}
                    className="w-full lg:w-auto border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 rounded-xl"
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Ajouter une période tarifaire
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </TabsContent>

          {/* Tab 4: Amenities */}
          <TabsContent value="amenities" className="space-y-6">
          {/* Amenities Section */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Sofa className="w-5 h-5 text-white" />
              </div>
              Équipements & Commodités
            </h3>
            <div className="bg-white rounded-xl p-6 border border-orange-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {AMENITIES_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedAmenities.includes(option.label);
                  return (
                    <div
                      key={option.label}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                        ${
                          isSelected
                            ? "bg-orange-50 border-orange-300 text-orange-900 shadow-md"
                            : "bg-gray-100 border-gray-200 text-gray-900/90 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-900 hover:shadow-md"
                        }
                      `}
                      onClick={() => handleAmenityToggle(option.label)}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-orange-500 group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium flex-1">
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-orange-500 text-white">
                          <X className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {form.formState.errors.amenities && (
                <div className="mt-4 text-sm text-red-500 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-500 text-xs">!</span>
                  </div>
                  {form.formState.errors.amenities.message}
                </div>
              )}
              <input
                type="hidden"
                {...form.register("amenities")}
                value={selectedAmenities.join(",")}
              />
            </div>
          </div>
          </TabsContent>

          {/* Tab 5: Images */}
          <TabsContent value="images" className="space-y-6">
          {/* Images Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              Images de la propriété
            </h3>
            <div className="bg-white rounded-xl p-6 border border-indigo-200">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900/90 mb-4">
                      Téléchargez les images de la propriété
                    </FormLabel>
                    <FormControl>
                      <ImageUploader
                        maxFiles={10}
                        initialImages={initialData?.images}
                        onChange={({
                          newFiles,
                          newFilePreviewUrls,
                          keptUrls,
                          removedUrls,
                        }) => {
                          setImageFiles(newFiles);
                          setRemovedImageUrls(removedUrls);
                          field.onChange([
                            ...(keptUrls || []),
                            ...(newFilePreviewUrls || []),
                          ]);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          </TabsContent>
          </Tabs>

          {/* Submit Button - Outside tabs so it's always visible */}
          <div className="sticky bottom-0 bg-white pt-6 pb-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-6 h-12 rounded-xl border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {initialData ? "Mise à jour..." : "Ajout en cours..."}
                  </div>
                ) : initialData ? (
                  "Mettre à jour la propriété"
                ) : (
                  "Ajouter la propriété"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}