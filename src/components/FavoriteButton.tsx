'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { saveAsFavorite } from '@/app/add/actions'

interface FavoriteButtonProps {
  mealEntryId: string
  isInitiallyFavorite?: boolean
  mealTitle?: string
}

export default function FavoriteButton({ mealEntryId, isInitiallyFavorite = false, mealTitle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (isFavorite || loading) return // For now, only support adding. Deleting is from the /add page.

    setLoading(true)
    try {
      await saveAsFavorite(mealEntryId, mealTitle)
      setIsFavorite(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isFavorite || loading}
      className={`p-2 rounded-xl transition-all active:scale-95 ${
        isFavorite 
          ? 'bg-amber-50 text-amber-500' 
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
      }`}
    >
      <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-500' : ''} ${loading ? 'animate-pulse' : ''}`} />
    </button>
  )
}
