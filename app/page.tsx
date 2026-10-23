import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";


const navigation = [
  { label: "Tableau de bord", icon: "⌂", href: "/", active: true },
  { label: "Clients", icon: "♙", href: "/clients", active: false },
  { label: "Demandes", icon: "▤", href: "/demandes", active: false },
  { label: "Devis", icon: "▧", href: "#", active: false },
];

// données fictives du dashboard
// const statistics = [
//   // {
//   //   label: "Total des clients",
//   //   value: "0",
//   //   detail: "Aucun client enregistré",
//   //   icon: "♙",
//   //   color: "bg-blue-50 text-blue-700",
//   // },
//   {
//     label: "Demandes en cours",
//     value: "0",
//     detail: "Aucune demande en attente",
//     icon: "◷",
//     color: "bg-amber-50 text-amber-700",
//   },
//   {
//     label: "Devis créés",
//     value: "0",
//     detail: "Aucun devis pour le moment",
//     icon: "▧",
//     color: "bg-violet-50 text-violet-700",
//   },
//   {
//     label: "Devis acceptés",
//     value: "0 FCFA",
//     detail: "Montant total accepté",
//     icon: "↗",
//     color: "bg-emerald-50 text-emerald-700",
//   },
// ];

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

async function DemandesStatisticsCards() {
  const [
    totalDemandes,
    demandesEnAttente,
    demandesTerminees,
  ] = await Promise.all([
    prisma.demande.count(),
    prisma.demande.count({
      where: { statut: "EN_ATTENTE" },
    }),
    prisma.demande.count({
      where: { statut: "TERMINEE" },
    }),
  ]);

  const statistiques = [
    {
      label: "Total des demandes",
      valeur: totalDemandes,
      detail: "Demandes enregistrées",
      couleur: "bg-blue-50 text-blue-700",
      icone: "D",
    },
    {
      label: "Demandes en attente",
      valeur: demandesEnAttente,
      detail: "À traiter",
      couleur: "bg-amber-50 text-amber-700",
      icone: "A",
    },
    {
      label: "Demandes terminées",
      valeur: demandesTerminees,
      detail: "Travaux terminés",
      couleur: "bg-emerald-50 text-emerald-700",
      icone: "T",
    },
  ];

  return (
    <>
      {statistiques.map((statistique) => (
        <article
          key={statistique.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              {statistique.label}
            </p>

            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${statistique.couleur}`}
            >
              {statistique.icone}
            </span>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight">
            {statistique.valeur}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {statistique.detail}
          </p>
        </article>
      ))}
    </>
  );
}

async function RecentActivities() {
  const [clients, demandes] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nom: true,
        createdAt: true,
      },
    }),
    prisma.demande.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        titre: true,
        statut: true,
        createdAt: true,
        client: {
          select: { nom: true },
        },
      },
    }),
  ]);

  const activites = [
    ...clients.map((client) => ({
      id: `client-${client.id}`,
      type: "client" as const,
      titre: `Nouveau client : ${client.nom}`,
      detail: "Client ajouté à votre entreprise",
      date: client.createdAt,
    })),
    ...demandes.map((demande) => ({
      id: `demande-${demande.id}`,
      type: "demande" as const,
      titre: `Demande : ${demande.titre}`,
      detail: `Client : ${demande.client.nom} · Statut : ${demande.statut}`,
      date: demande.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  return (
    <>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">Activité récente</h2>
          <p className="mt-1 text-sm text-slate-500">
            Les derniers clients et demandes enregistrés.
          </p>
        </div>

        <span className="w-fit rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          {activites.length} opération{activites.length > 1 ? "s" : ""}
        </span>
      </div>

      {activites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
            ▤
          </div>
          <h3 className="mt-4 font-semibold">
            Aucune activité pour le moment
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Les clients et les demandes apparaîtront ici après leur création.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {activites.map((activite) => (
            <li
              key={activite.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                  activite.type === "client"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {activite.type === "client" ? "C" : "D"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">
                  {activite.titre}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {activite.detail}
                </p>
                <time
                  dateTime={activite.date.toISOString()}
                  className="mt-2 block text-xs text-slate-400"
                >
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(activite.date)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Navigation latérale */}
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:overflow-y-auto shrink-0 border-r border-slate-200 bg-white p-6">
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
            <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Espace de travail
            </p>

            <nav className="space-y-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    item.active
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                      : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg transition-colors ${
                      item.active
                        ? "bg-blue-500/15 text-blue-300"
                        : "text-slate-400 group-hover:text-slate-100"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">{item.label}</span>

                  {item.active && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
   
          <div className="mt-auto border-t border-slate-700/70 pt-5">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-300 ring-1 ring-blue-400/20">
                  P
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    PME Desk
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Votre activité, mieux organisée.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-700/70 pt-3">
                <span className="text-xs text-slate-400">
                  Version
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-[11px] font-medium text-slate-300">
                  0.1.0
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="min-w-0 flex-1 md:ml-64">
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

              <Suspense
                fallback={
                  <>
                    {[1, 2, 3].map((item) => (
                      <article
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <p className="text-sm text-slate-500">
                          Chargement des statistiques...
                        </p>
                        <p className="mt-5 text-2xl font-bold">...</p>
                      </article>
                    ))}
                  </>
                }
              >
                <DemandesStatisticsCards />
              </Suspense>
            </section>
            
            {/* Activité récente */}
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100/50 sm:p-8">
              <Suspense
                fallback={
                  <p className="py-8 text-sm text-slate-500">
                    Chargement des activités...
                  </p>
                }
              >
                <RecentActivities />
              </Suspense>
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
