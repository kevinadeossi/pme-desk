import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";


const navigation = [
  { label: "Tableau de bord", icon: "⌂", href: "/", active: true },
  { label: "Clients", icon: "♙", href: "/clients", active: false },
  { label: "Demandes", icon: "▤", href: "/demandes", active: false },
  { label: "Devis", icon: "▧", href: "#", active: false },
];


const statistics = [
  // {
  //   label: "Total des clients",
  //   value: "0",
  //   detail: "Aucun client enregistré",
  //   icon: "♙",
  //   color: "bg-blue-50 text-blue-700",
  // },
  {
    label: "Demandes en cours",
    value: "0",
    detail: "Aucune demande en attente",
    icon: "◷",
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "Devis créés",
    value: "0",
    detail: "Aucun devis pour le moment",
    icon: "▧",
    color: "bg-violet-50 text-violet-700",
  },
  {
    label: "Devis acceptés",
    value: "0 FCFA",
    detail: "Montant total accepté",
    icon: "↗",
    color: "bg-emerald-50 text-emerald-700",
  },
];

async function ClientCountCard() {
  const totalClients = await prisma.client.count();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          Total des clients
        </p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">
          ♙
        </span>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight">
        {totalClients}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {totalClients === 0
          ? "Aucun client enregistré"
          : `${totalClients} client${totalClients > 1 ? "s" : ""} enregistré${totalClients > 1 ? "s" : ""}`}
      </p>
    </article>
  );
}


export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Navigation latérale */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-6 md:flex md:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              P
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">PME Desk</p>
              <p className="text-xs text-slate-500">Gestion d&apos;entreprise</p>
            </div>
          </Link>

          <div className="mt-10">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Espace de travail
            </p>

            <nav className="space-y-1">
              
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

            </nav>
          </div>

          <div className="mt-auto rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold">PME Desk</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Votre activité, mieux organisée.
            </p>
            <span className="mt-3 inline-block rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
              Version 0.1.0
            </span>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">Espace de travail</p>
              <p className="font-semibold">Mon entreprise</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              ME
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  VOTRE ACTIVITÉ EN UN COUP D&apos;ŒIL
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Tableau de bord
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Retrouvez les informations essentielles de votre entreprise.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Mode démonstration
              </span>
            </section>

            {/* Statistiques */}
            <section
              aria-label="Statistiques de l&apos;entreprise"
              className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <Suspense
                fallback={
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50">
                    <p className="text-sm font-medium text-slate-500">
                      Total des clients
                    </p>
                    <p className="mt-5 text-2xl font-bold">...</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Chargement des données...
                    </p>
                  </article>
                }
              >
                <ClientCountCard />
              </Suspense>

              {statistics.map((statistic) => (
                <article
                  key={statistic.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">
                      {statistic.label}
                    </p>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${statistic.color}`}
                    >
                      {statistic.icon}
                    </span>
                  </div>

                  <p className="mt-5 text-2xl font-bold tracking-tight">
                    {statistic.value}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {statistic.detail}
                  </p>
                </article>
              ))}
            </section>

            {/* Activité récente */}
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100/50 sm:p-8">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold">Activité récente</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Suivez les dernières opérations de votre entreprise.
                  </p>
                </div>
                <span className="w-fit rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                  0 opération
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                  ▤
                </div>
                <h3 className="mt-4 font-semibold">Aucune activité pour le moment</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Les nouvelles demandes, les clients et les devis apparaîtront
                  ici lorsque vous commencerez à utiliser PME Desk.
                </p>
              </div>
            </section>

            <footer className="py-8 text-center text-xs text-slate-400">
              PME Desk · Un outil simple pour mieux gérer votre entreprise.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
