"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react"

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [errorInfo, setErrorInfo] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Basic setup for html5-qrcode
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      async (decodedText) => {
         // Stop scanning temporarily
         setIsScanning(true)
         setErrorInfo(null)
         scanner.clear()

         try {
            const res = await fetch(`/api/qrcode/verify?token=${encodeURIComponent(decodedText)}`)
            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || "Token invalide")
            
            setScanResult(data.participant)
         } catch (e: any) {
            setErrorInfo(e.message)
         } finally {
            setIsScanning(false)
         }
      },
      (error) => {
         // Ignore silent scan errors (just means no code in frame)
      }
    )

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e))
    }
  }, [])

  const resetScanner = () => {
     window.location.reload() // Fastest way to cleanly re-init html5-qrcode
  }

  return (
    <div className="flex-1 w-full bg-stone-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
           <h1 className="text-2xl font-bold text-[#C9A84C]">Scanner JDO 2026</h1>
           <p className="text-stone-400 text-sm">Placez le QR code au centre du cadre.</p>
        </div>

        {!scanResult && !errorInfo && !isScanning && (
           <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
              <div id="reader" className="w-full"></div>
           </div>
        )}

        {isScanning && (
           <div className="flex flex-col items-center justify-center p-12 bg-stone-800 rounded-2xl">
              <Loader2 className="h-12 w-12 text-[#C9A84C] animate-spin mb-4" />
              <p>Vérification en cours...</p>
           </div>
        )}

        {errorInfo && (
           <Card className="bg-red-950 border-red-900 text-white">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                 <ShieldAlert className="h-16 w-16 text-red-500" />
                 <div>
                    <h3 className="text-xl font-bold text-red-500">Accès Refusé</h3>
                    <p className="text-red-200 mt-2">{errorInfo}</p>
                 </div>
                 <button onClick={resetScanner} className="mt-4 px-6 py-2 bg-white text-red-900 rounded-full font-bold">
                    Scanner un autre billet
                 </button>
              </CardContent>
           </Card>
        )}

        {scanResult && (
           <Card className="bg-green-950 border-green-900 text-white">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                 <ShieldCheck className="h-16 w-16 text-green-500" />
                 <div>
                    <h3 className="text-2xl font-bold text-green-400 uppercase">
                       {scanResult.nom} {scanResult.prenom}
                    </h3>
                    <div className="mt-4 space-x-2">
                       <Badge variant="outline" className="border-green-700 text-green-300">
                          {scanResult.statut.replace('_', ' ')}
                       </Badge>
                        {(scanResult.statut === "ESATIC_CCEE" || scanResult.statut === "ANCIEN") && (
                           <Badge className="bg-[#6B7C3E]">T-SHIRT OK</Badge>
                        )}
                    </div>
                 </div>

                 {scanResult.commandes?.length > 0 && (
                    <div className="w-full text-left bg-black/20 p-4 rounded-xl mt-4">
                       <p className="text-xs text-stone-400 font-bold mb-2 uppercase">À REMETTRE (GOODIES) :</p>
                       <ul className="text-sm space-y-1">
                          {scanResult.commandes.map((c: any) => (
                             <li key={c.id} className="text-green-200 font-medium">👉 {c.quantite}x {c.article}</li>
                          ))}
                       </ul>
                    </div>
                 )}

                 <button onClick={resetScanner} className="mt-6 w-full py-3 bg-[#6B7C3E] hover:bg-[#566332] text-white rounded-xl font-bold shadow-lg">
                    Scanner le Billet Suivant
                 </button>
              </CardContent>
           </Card>
        )}

      </div>
    </div>
  )
}
