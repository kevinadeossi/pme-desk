
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ClientsManager from "./ClientsManager";

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <a
            href="/"
            className="mb-4 inline-flex text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            ← Retour au tableau de bord
          </a>

          <div>
            <p className="text-sm font-medium text-indigo-600">
              GESTION COMMERCIALE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Mes clients
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Centralisez les coordonnées de vos clients et retrouvez-les
              facilement.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div
              className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"
              role="status"
            >
              Chargement des clients...
            </div>
          }
        >
          <ClientsContent />
        </Suspense>
      </div>
    </main>
  );
}

async function ClientsContent() {
  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const clientsForClient = clients.map((client) => ({
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }));

  return <ClientsManager initialClients={clientsForClient} />;
}
