'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mic, Square, Loader2 } from 'lucide-react'

export default function AudioAddPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = [] 
        stream.getTracks().forEach(track => track.stop())
        await processAudio(audioBlob)
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      alert('Necesitamos acceso al micrófono para grabarte.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAudio = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')

    try {
      const res = await fetch('/api/ai/audio', { method: 'POST', body: formData })
      const data = await res.json()
      
      if (data.success && data.parsedMeal) {
        sessionStorage.setItem('ai_draft_meal', JSON.stringify({
           source_type: 'AUDIO',
           parsed: data.parsedMeal
        }))
        router.push('/add/review')
      } else {
        alert('Hubo un error interpretando el audio.')
        setIsProcessing(false)
      }
    } catch (e) {
      alert('Error de red.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col pt-12 items-center text-center">
      <div className="w-full mb-8 flex items-center justify-between">
         <Link href="/add" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Atrás
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
         <div className="bg-purple-100 text-purple-600 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Mic className="w-10 h-10" />
         </div>
         <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">¿Qué has comido?</h1>
         <p className="text-slate-500 font-medium mb-12 px-4">
           Toca para empezar y descríbelo con naturalidad. Ej: "Me comí dos huevos fritos con un trozo de pan y un café."
         </p>

         {!isProcessing ? (
           <button 
             onClick={isRecording ? stopRecording : startRecording}
             className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-slate-900 hover:bg-slate-800 hover:scale-105 active:scale-95'}`}
           >
             {isRecording ? <Square className="w-10 h-10 text-white fill-white" /> : <Mic className="w-12 h-12 text-white" />}
           </button>
         ) : (
           <div className="flex flex-col items-center text-emerald-600">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="font-bold animate-pulse">Analizando tu comida...</p>
           </div>
         )}
      </div>
    </div>
  )
}
