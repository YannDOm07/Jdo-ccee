"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Types matching the Prisma ENUMs
const STATUTS = ["ESATIC_CCEE", "ANCIEN", "EXTERNE"] as const

const formSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  telephone: z.string().regex(/^\+225[0-9]{10}$/, "Format invalide (ex: +2250102030405)"),
  email: z.string().email("Email invalide"),
  statut: z.enum(["ESATIC_CCEE", "ANCIEN", "EXTERNE"], {
    error: "Veuillez sélectionner votre statut",
  }),
  // Goodies & Options
  casquette_blanche: z.boolean().optional(),
  casquette_noire: z.boolean().optional(),
  casquette_verte: z.boolean().optional(),
  tshirt_beige: z.boolean().optional(),
  tshirt_vert: z.boolean().optional(),
})

const PRIX = {
  CASQUETTE_BLANCHE: 2000,
  CASQUETTE_NOIRE: 2000,
  CASQUETTE_VERTE: 2000,
  TSHIRT_BEIGE: 3000,
  TSHIRT_VERT: 3000,
}

export function RegistrationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "+225",
      email: "",
      casquette_blanche: false,
      casquette_noire: false,
      casquette_verte: false,
      tshirt_beige: false,
      tshirt_vert: false,
    },
  })

  // Watch values to calculate total dynamically
  const statut = form.watch("statut")
  const casquette_blanche = form.watch("casquette_blanche")
  const casquette_noire = form.watch("casquette_noire")
  const casquette_verte = form.watch("casquette_verte")
  const tshirt_beige = form.watch("tshirt_beige")
  const tshirt_vert = form.watch("tshirt_vert")

  const calculateTotal = () => {
    let total = 0
    if (casquette_blanche) total += PRIX.CASQUETTE_BLANCHE
    if (casquette_noire) total += PRIX.CASQUETTE_NOIRE
    if (casquette_verte) total += PRIX.CASQUETTE_VERTE
    if (tshirt_beige) total += PRIX.TSHIRT_BEIGE
    if (tshirt_vert) total += PRIX.TSHIRT_VERT
    return total
  }

  const totalAmount = calculateTotal()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // 1. Appel API d'inscription
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          montantTotal: totalAmount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      toast.success("Inscription validée !")

      // 2. Redirection conditionnelle (Paiement ou Confirmation directe)
      if (data.montantTotal > 0) {
        // Rediriger vers la page de paiement avec les infos
        router.push(`/paiement?participantId=${data.participantId}`)
      } else {
        // Gratuit (ESATIC sans goodies)
        router.push(`/confirmation?id=${data.participantId}`)
      }

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénoms</FormLabel>
                    <FormControl><Input placeholder="John" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone (Mobile Money valide)</FormLabel>
                    <FormControl><Input placeholder="+225..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Statut (Critique) */}
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ESATIC_CCEE">Étudiant ESATIC (CCEE ou autre)</SelectItem>
                      <SelectItem value="ANCIEN">Ancien de l'ESATIC</SelectItem>
                      <SelectItem value="EXTERNE">Participant Externe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {/* Messages Dynamiques de Gratuité */}
                  {statut === "ESATIC_CCEE" || statut === "ANCIEN" ? (
                      <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                         ✓ Inscription et T-shirt offerts gratuitement !
                      </p>
                  ) : null}
                  {statut === "EXTERNE" ? (
                      <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                         ✓ Inscription gratuite !
                      </p>
                  ) : null}
                </FormItem>
              )}
            />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goodies</span></div>
            </div>

               {/* Section Goodies Optionnels */}
               <div className="space-y-4">
                  <div>
                     <h3 className="text-base font-bold text-foreground">Souvenirs, T-Shirt & Goodies (Optionnel)</h3>
                     <p className="text-sm text-muted-foreground">Achetez vos articles en ligne pour les récupérer le jour J.</p>
                  </div>
                  
                  <div className="grid gap-4">
                     {/* Casquette Blanche */}
                     <FormField
                        control={form.control}
                        name="casquette_blanche"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-stone-200/80 p-4 hover:bg-stone-50/80 hover:border-primary/20 transition-all duration-200 cursor-pointer">
                              <FormControl>
                                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                 <FormLabel className="font-medium cursor-pointer">Casquette Blanche JDO</FormLabel>
                              </div>
                              <div className="font-semibold text-stone-600">{PRIX.CASQUETTE_BLANCHE} FCFA</div>
                           </FormItem>
                        )}
                     />
                     {/* Casquette Noire */}
                     <FormField
                        control={form.control}
                        name="casquette_noire"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-stone-200/80 p-4 hover:bg-stone-50/80 hover:border-primary/20 transition-all duration-200 cursor-pointer">
                              <FormControl>
                                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                 <FormLabel className="font-medium cursor-pointer">Casquette Noire JDO</FormLabel>
                              </div>
                              <div className="font-semibold text-stone-600">{PRIX.CASQUETTE_NOIRE} FCFA</div>
                           </FormItem>
                        )}
                     />
                     {/* Casquette Verte */}
                     <FormField
                        control={form.control}
                        name="casquette_verte"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-stone-200/80 p-4 hover:bg-stone-50/80 hover:border-primary/20 transition-all duration-200 cursor-pointer">
                              <FormControl>
                                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                 <FormLabel className="font-medium cursor-pointer">Casquette Verte JDO</FormLabel>
                              </div>
                              <div className="font-semibold text-stone-600">{PRIX.CASQUETTE_VERTE} FCFA</div>
                           </FormItem>
                        )}
                     />
                     {/* T-Shirt Beige */}
                     <FormField
                        control={form.control}
                        name="tshirt_beige"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-stone-200/80 p-4 hover:bg-stone-50/80 hover:border-primary/20 transition-all duration-200 cursor-pointer">
                              <FormControl>
                                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                 <FormLabel className="font-medium cursor-pointer">T-Shirt Beige JDO</FormLabel>
                              </div>
                              <div className="font-semibold text-stone-600">{PRIX.TSHIRT_BEIGE} FCFA</div>
                           </FormItem>
                        )}
                     />
                     {/* T-Shirt Vert */}
                     <FormField
                        control={form.control}
                        name="tshirt_vert"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-stone-200/80 p-4 hover:bg-stone-50/80 hover:border-primary/20 transition-all duration-200 cursor-pointer">
                              <FormControl>
                                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                 <FormLabel className="font-medium cursor-pointer">T-Shirt Vert JDO</FormLabel>
                              </div>
                              <div className="font-semibold text-stone-600">{PRIX.TSHIRT_VERT} FCFA</div>
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

            {/* Recapitulatif Total */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/10 p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
               <div>
                  <h4 className="font-bold text-foreground">Total à Payer</h4>
                  <p className="text-sm text-muted-foreground">
                     {totalAmount === 0 ? "Aucun frais requis" : "Paiement via Wave ensuite"}
                  </p>
               </div>
               <div className="text-3xl font-extrabold text-primary">
                  {totalAmount} <span className="text-base font-semibold text-muted-foreground">FCFA</span>
               </div>
            </div>

            <Button 
               type="submit" 
               className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
               disabled={isLoading || !statut}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {totalAmount > 0 ? "Valider & Procéder au Paiement →" : "Confirmer mon Inscription Gratuite ✓"}
            </Button>
          </form>
        </Form>
    </div>
  )
}
