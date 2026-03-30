import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

const TARGET_EMAIL = 'jjaviergb95@gmail.com'

type DbInfoRow = {
  current_database: string
  current_schema: string
}

type TableRow = {
  schemaname: string
  tablename: string
}

export default async function BootstrapSuperadminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/bootstrap-superadmin')
  }

  const normalizedEmail = session.user.email.trim().toLowerCase()

  if (normalizedEmail !== TARGET_EMAIL) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Acceso restringido</h1>
          <p className="mt-4 text-slate-600">
            Esta utilidad temporal solo permite elevar a superadmin la cuenta
            <strong> {TARGET_EMAIL}</strong>.
          </p>
          <p className="mt-2 text-slate-500">
            Has iniciado sesión como <strong>{session.user.email}</strong>.
          </p>
        </div>
      </main>
    )
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { role: 'SUPERADMIN' }
  })

  const [dbInfo] = await prisma.$queryRaw<DbInfoRow[]>`
    SELECT current_database(), current_schema()
  `

  const tables = await prisma.$queryRaw<TableRow[]>`
    SELECT schemaname, tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schemaname, tablename
    LIMIT 25
  `

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Superadmin activado</h1>
          <p className="mt-4 text-slate-700">
            La cuenta <strong>{TARGET_EMAIL}</strong> ya tiene el rol
            <strong> SUPERADMIN</strong> en la misma base de datos que está usando la app.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Base conectada por la app</h2>
          <div className="mt-4 space-y-2 text-slate-700">
            <p>
              <strong>Database:</strong> {dbInfo?.current_database ?? 'desconocida'}
            </p>
            <p>
              <strong>Schema:</strong> {dbInfo?.current_schema ?? 'desconocido'}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Tablas visibles</h2>
          {tables.length > 0 ? (
            <ul className="mt-4 grid gap-2 text-sm text-slate-700">
              {tables.map((table) => (
                <li key={`${table.schemaname}.${table.tablename}`}>
                  <code>{table.schemaname}.{table.tablename}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-slate-600">
              La app no ha devuelto tablas visibles desde esta consulta.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
