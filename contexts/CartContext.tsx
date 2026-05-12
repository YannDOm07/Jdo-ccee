"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "sonner"

export type CartItem = {
  goodieId: string
  nom: string
  prix: number
  quantite: number
  imageUrl?: string | null
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (goodieId: string) => void
  updateQuantity: (goodieId: string, delta: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localeStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jdo_cart")
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("jdo_cart", JSON.stringify(items))
    } catch (e) {
      console.error("Failed to save cart to local storage", e)
    }
  }, [items])

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => item.goodieId === newItem.goodieId)
      if (existing) {
        toast.info(`Quantité augmentée pour ${newItem.nom}`)
        return prev.map(item => 
          item.goodieId === newItem.goodieId 
            ? { ...item, quantite: item.quantite + newItem.quantite } 
            : item
        )
      }
      return [...prev, newItem]
    })
  }

  const removeFromCart = (goodieId: string) => {
    setItems(prev => prev.filter(item => item.goodieId !== goodieId))
  }

  const updateQuantity = (goodieId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.goodieId === goodieId) {
        const newQuantite = Math.max(1, item.quantite + delta)
        return { ...item, quantite: newQuantite }
      }
      return item
    }))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("jdo_cart")
  }

  const total = items.reduce((acc, item) => acc + (item.prix * item.quantite), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
