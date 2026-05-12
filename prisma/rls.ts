import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Verrouillage de la base de données (Enable RLS)...")
  
  const tables = ['Participant', 'Goodie', 'Commande', 'Paiement']
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`)
    console.log(`✅ RLS activé pour la table: ${table}`)
  }
  
  console.log("Toutes les tables sont maintenant protégées contre l'accès public via l'API Supabase.")
}

main()
  .catch((e) => {
    console.error("Erreur lors de l'activation de RLS:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
