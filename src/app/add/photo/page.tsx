'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function PhotoAddPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setPreview(base64)
      setIsProcessing(true)
      
      try {
        const res = await fetch('/api/ai/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        })
        const data = await res.json()
        
        if (data.success && data.parsedMeal) {
          sessionStorage.setItem('ai_draft_meal', JSON.stringify({
            source_type: 'PHOTO',
            parsed: data.parsedMeal
          }))
          router.push('/add/review')
        } else {
          alert('Hubo un error interpretando la foto.')
          setIsProcessing(false)
          setPreview(null)
        }
      } catch (err) {
        alert('Error de conexión.')
        setIsProcessing(false)
        setPreview(null)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col pt-12 text-center">
      <div className="w-full mb-8 flex items-center justify-between">
         <Link href="/add" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Atrás
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full mx-auto">
        {!preview ? (
          <>
            <div className="bg-blue-100 text-blue-600 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner">
               <Camera className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Foto de tu comida</h1>
            <p className="text-slate-500 font-medium mb-12 px-4">
              Toma una foto clara de tu plato. La IA identificará los alimentos y calculará las porciones automáticamente.
            </p>

            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Camera className="w-6 h-6" /> Tomar foto ahora
            </button>
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture')
                  fileInputRef.current.click()
                  setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 1000)
                }
              }}
              className="w-full max-w-xs bg-white mt-4 border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3"
            >
              <ImageIcon className="w-5 h-5" /> Subir de galería
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Comida preview" className="w-full max-w-xs rounded-3xl shadow-xl opacity-60 mb-8 aspect-square object-cover" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 space-y-4 pt-12">
              <div className="bg-white p-4 rounded-full shadow-2xl">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
              <p className="bg-slate-900/80 text-white px-4 py-2 rounded-xl font-bold backdrop-blur-sm animate-pulse">
                Analizando nutrientes...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
