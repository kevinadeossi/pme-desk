
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import DemandesManager from "./DemandesManager";

export default function DemandesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <a
            href="/"
            className="mb-4 inline-flex text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            &larr; Retour au tableau de bord
          </a>

          <div>
            <p className="text-sm font-medium text-indigo-600">
              GESTION COMMERCIALE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Mes demandes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Centralisez les demandes de vos clients et suivez leur traitement.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div
              className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"
              role="status"
            >
              Chargement des demandes...
            </div>
          }
        >
          <DemandesContent />
        </Suspense>
      </div>
    </main>
  );
}

async function DemandesContent() {
  const [demandes, clients] = await Promise.all([
    prisma.demande.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            email: true,
            telephone: true,
          },
        },
      },
    }),
    prisma.client.findMany({
      orderBy: {
        nom: "asc",
      },
      select: {
        id: true,
        nom: true,
      },
    }),
  ]);

  const demandesForClient = demandes.map((demande) => ({
    ...demande,
    createdAt: demande.createdAt.toISOString(),
    updatedAt: demande.updatedAt.toISOString(),
  }));

  return (
    <DemandesManager
      initialDemandes={demandesForClient}
      clients={clients}
    />
  );
}
