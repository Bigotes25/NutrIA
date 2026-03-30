'use client'

import { signIn } from 'next-auth/react'

type GoogleAuthButtonProps = {
  label: string
  callbackUrl?: string
}

export function GoogleAuthButton({
  label,
  callbackUrl = '/dashboard',
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl })}
      className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-800 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/40 active:scale-[0.98]"
    >
      <span className="flex items-center justify-center gap-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[11px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
          G
        </span>
        {label}
      </span>
    </button>
  )
}
