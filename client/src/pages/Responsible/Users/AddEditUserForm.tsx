"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User } from "./types"

const baseSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  userEmail: z.string().email("Email invalide"),
  userPhone: z.string().min(8, "Numéro de téléphone invalide"),
  matricule: z.string().length(4, "4 chiffres requis").regex(/^\d+$/, "Chiffres uniquement"),
  role: z.enum(["adherent", "responsable"]),
  status: z.enum(["En Attente", "Approuvé", "Refusé"]),
})

const createSchema = baseSchema.extend({
  password: z.string().min(6, "Minimum 6 caractères"),
})

const editSchema = baseSchema.extend({
  password: z.string().optional(),
})

type UserFormValues = z.infer<typeof createSchema>

interface AddEditUserFormProps {
  onSubmit: (values: UserFormValues) => Promise<void> | void
  initialData?: User | null
  isSubmitting?: boolean
}

export function AddEditUserForm({
  onSubmit,
  initialData,
  isSubmitting = false
}: AddEditUserFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(initialData ? editSchema : createSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      userEmail: initialData?.userEmail || "",
      userPhone: initialData?.userPhone || "",
      matricule: initialData?.matricule || "",
      role: (initialData?.role as "adherent" | "responsable") || "adherent",
      status: (initialData?.status as "En Attente" | "Approuvé" | "Refusé") || "En Attente",
      password: "",
    },
  })

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {initialData ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les accès et les informations personnelles
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="tn"
                        value={field.value}
                        onChange={field.onChange}
                        inputStyle={{
                          height: "40px",
                          width: "100%",
                          fontSize: "14px",
                          borderRadius: "0 0.5rem 0.5rem 0",
                        }}
                        countrySelectorStyleProps={{
                          buttonStyle: {
                            height: "40px",
                            borderRadius: "0.5rem 0 0 0.5rem",
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Compte & Sécurité</h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule</FormLabel>
                    <FormControl>
                      <Input placeholder="0000" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe {initialData && "(optionnel)"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={initialData ? "Laisser vide pour conserver" : "••••••"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="adherent">Adhérent</SelectItem>
                        <SelectItem value="responsable">Responsable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En Attente">En Attente</SelectItem>
                        <SelectItem value="Approuvé">Approuvé</SelectItem>
                        <SelectItem value="Refusé">Refusé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
