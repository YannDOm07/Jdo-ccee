import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding goodies...')

  // Unlink old goodies from existing commandes to avoid FK restriction
  await prisma.commande.updateMany({
    where: { goodieId: { not: null } },
    data: { goodieId: null }
  })
  
  // Wipe old goodies
  await prisma.goodie.deleteMany()

  const goodies = [
    {
      nom: "Casquette Blanche",
      prix: 2000,
      description: "Casquette officielle JDO de couleur blanche.",
      stock: 100,
      tag: "SOUVENIR",
      imageUrl: "/goodies/casquette_blanche.jpg"
    },
    {
      nom: "Casquette Noire",
      prix: 2000,
      description: "Casquette officielle JDO de couleur noire.",
      stock: 100,
      tag: "SOUVENIR",
      imageUrl: "/goodies/casquette_noire.jpg"
    },
    {
      nom: "Casquette Verte",
      prix: 2000,
      description: "Casquette officielle JDO de couleur verte.",
      stock: 100,
      tag: "SOUVENIR",
      imageUrl: "/goodies/casquette_verte.jpg"
    },
    {
      nom: "T-Shirt Beige",
      prix: 3000,
      description: "T-Shirt officiel du Jardin des Oliviers 2026, couleur beige.",
      stock: 150,
      tag: "OFFICIEL",
      imageUrl: "/goodies/tee-shirt_beige.jpg"
    },
    {
      nom: "T-Shirt Vert",
      prix: 3000,
      description: "T-Shirt officiel du Jardin des Oliviers 2026, couleur verte.",
      stock: 150,
      tag: "OFFICIEL",
      imageUrl: "/goodies/tee-shirt_vert.jpg"
    }
  ]

  for (const goodie of goodies) {
    await prisma.goodie.create({
      data: goodie
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
