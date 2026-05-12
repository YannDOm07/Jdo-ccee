"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const formSchema = z.object({
  transactionId: z.string().min(8, "Le numéro doit comporter au moins 8 caractères").max(20, "Le numéro est trop long"),
})

type PaymentStatus = "idle" | "loading" | "success" | "error"

export function WavePaymentForm({ participantId }: { participantId: string }) {
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionId: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus("loading")
    setErrorMessage("")
    
    try {
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          transactionId: values.transactionId, // En réalité, c'est le numéro de téléphone ici
          operateur: "WAVE",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur de validation de paiement")
      }

      setStatus("success")
      toast.success("Numéro de paiement enregistré avec succès !")

    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.message)
      toast.error(error.message)
    }
  }

  // ── SUCCESS STATE ──
  if (status === "success") {
    return (
      <Card className="w-full shadow-lg border-green-200 bg-green-50/30">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Paiement signalé !
            </h3>
            <p className="text-green-700 text-sm leading-relaxed max-w-sm mx-auto">
              Votre numéro de téléphone a bien été reçu. L'équipe CCEE va vérifier la réception du transfert.
            </p>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-4 max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-left">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Statut actuel</p>
                <p className="text-sm text-amber-600 font-bold">En attente de vérification</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-sm mx-auto">
            <div className="flex gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Un administrateur vérifiera votre paiement dans les plus brefs délais. 
                Votre QR Code d'accès sera activé une fois la transaction confirmée.
                Vous pouvez consulter l'état de votre paiement depuis votre <a href="/profil" className="underline font-semibold hover:text-amber-900">profil</a>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── FORM STATE (idle / loading / error) ──
  return (
    <Card className="w-full shadow-lg border-stone-200">
      <CardHeader className="bg-blue-50/50 border-b">
        <div className="flex items-center gap-4">
           <div className="bg-[#1cc6ff] text-white font-bold p-2 px-4 rounded-xl text-xl">wave</div>
           <div>
            <CardTitle className="text-xl">Paiement via Wave</CardTitle>
            <CardDescription>
               Suivez les instructions ci-dessous pour valider votre commande.
            </CardDescription>
           </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Instructions */}
        <div className="space-y-4 text-stone-700 bg-stone-50 p-4 rounded-lg border">
           <h3 className="font-semibold">Instructions de paiement :</h3>
           <ol className="list-decimal pl-5 space-y-4 text-sm">
              <li>Cliquez sur le bouton sécurisé ci-dessous pour ouvrir l'application Wave et effectuer le paiement :</li>
              <div className="flex items-center justify-center my-4">
                 <a href="https://pay.wave.com/m/M_ci_P2KvInolTvzh/c/ci/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button type="button" className="bg-[#1cc6ff] hover:bg-[#18a8d8] text-white font-bold px-8 h-12 shadow-md w-full rounded-xl">
                       Payer le montant via Wave
                    </Button>
                 </a>
              </div>
              <li>Une fois le paiement effectué sur Wave, <b>entrez simplement le numéro de téléphone utilisé</b> dans le champ ci-dessous.</li>
              <li>Cela nous permet de retrouver et vérifier votre transfert très facilement.</li>
           </ol>
        </div>

        {/* Error Message */}
        {status === "error" && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Erreur de vérification</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Input Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone payeur</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 0707070707" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
               type="submit" 
               className="w-full h-14 text-lg font-bold bg-[#1cc6ff] hover:bg-[#18a8d8] text-white rounded-xl"
               disabled={status === "loading"}
            >
              {status === "loading" && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {status === "loading" ? "Vérification en cours..." : "Confirmer mon paiement"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
