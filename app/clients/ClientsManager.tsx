
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Props = {
  initialClients: Client[];
};

export default function ClientsManager({ initialClients }: Props) {
  const router = useRouter();

  const [clients, setClients] = useState(initialClients);
  const [recherche, setRecherche] = useState("");
  const [modalOuverte, setModalOuverte] = useState(false);
  const [clientEnEdition, setClientEnEdition] = useState<Client | null>(null);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const clientsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    if (!terme) return clients;

    return clients.filter((client) =>
      [client.nom, client.email, client.telephone]
        .some((valeur) => valeur?.toLowerCase().includes(terme))
    );
  }, [clients, recherche]);

  function fermerModal() {
    if (chargement) return;

    setModalOuverte(false);
    setErreur("");
    setNom("");
    setEmail("");
    setTelephone("");
  }

  function ouvrirModalAjout() {
    setClientEnEdition(null);
    setNom("");
    setEmail("");
    setTelephone("");
    setErreur("");
    setModalOuverte(true);
    }

    function ouvrirModalEdition(client: Client) {
    setClientEnEdition(client);
    setNom(client.nom);
    setEmail(client.email ?? "");
    setTelephone(client.telephone ?? "");
    setErreur("");
    setModalOuverte(true);
    }


  
    async function ajouterClient(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErreur("");

        if (!nom.trim()) {
            setErreur("Le nom du client est obligatoire.");
            return;
        }

        setChargement(true);

        try {
            const response = await fetch("/api/clients", {
            method: clientEnEdition ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...(clientEnEdition ? { id: clientEnEdition.id } : {}),
                nom: nom.trim(),
                email: email.trim() || null,
                telephone: telephone.trim() || null,
            }),
            });

            const resultat = await response.json();

            if (!response.ok) {
            setErreur(
                resultat.message ||
                (clientEnEdition
                    ? "Impossible de modifier ce client."
                    : "Impossible d'ajouter ce client.")
            );
            return;
            }

            if (clientEnEdition) {
            setClients((precedents) =>
                precedents.map((client) =>
                client.id === resultat.data.id ? resultat.data : client
                )
            );
            } else {
            setClients((precedents) => [resultat.data, ...precedents]);
            }

            fermerModal();
            router.refresh();
        } catch {
            setErreur("Erreur de connexion. Vérifie que le serveur fonctionne.");
        } finally {
            setChargement(false);
        }
    }

    
    async function supprimerClient(client: Client) {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer le client "${client.nom}" ?\n\nAttention : ses demandes associées seront également supprimées.`
        );

        if (!confirmation) return;

        setErreur("");
        setChargement(true);

        try {
            const response = await fetch("/api/clients", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: client.id }),
            });

            const resultat = await response.json();

            if (!response.ok) {
            setErreur(resultat.message || "Impossible de supprimer ce client.");
            return;
            }

            setClients((precedents) =>
            precedents.filter((element) => element.id !== client.id)
            );

            router.refresh();
        } catch {
            setErreur("Erreur de connexion. Vérifie que le serveur fonctionne.");
        } finally {
            setChargement(false);
        }
    }



  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Gérez et retrouvez facilement vos contacts.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {clients.length} client{clients.length > 1 ? "s" : ""} enregistré
            {clients.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={ouvrirModalAjout}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          + Ajouter un client
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label htmlFor="recherche-clients" className="mb-2 block text-sm font-medium text-gray-700">
          Rechercher un client
        </label>
        <input
          id="recherche-clients"
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Nom, adresse e-mail ou téléphone..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Liste des clients</h2>
        </div>

        {clientsFiltres.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-800">
              {recherche ? "Aucun résultat trouvé" : "Aucun client pour le moment"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {recherche
                ? "Essaie avec un autre nom, e-mail ou numéro."
                : "Ajoute ton premier client pour commencer."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Client</th>
                  <th className="px-5 py-4 font-medium">E-mail</th>
                  <th className="px-5 py-4 font-medium">Téléphone</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientsFiltres.map((client) => (
                  <tr key={client.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {client.nom}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {client.email || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {client.telephone || "—"}
                    </td>
                    
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <button
                            type="button"
                            onClick={() => ouvrirModalEdition(client)}
                            disabled={chargement}
                            className="font-medium text-indigo-600 transition hover:text-indigo-800 disabled:opacity-50"
                            >
                                Modifier
                            </button>

                            <button
                            type="button"
                            onClick={() => supprimerClient(client)}
                            disabled={chargement}
                            className="font-medium text-red-600 transition hover:text-red-800 disabled:opacity-50"
                            >
                                Supprimer
                            </button>
                        </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOuverte && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fermerModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modal-client"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="titre-modal-client" className="text-xl font-bold text-gray-900">
                  {clientEnEdition ? "Modifier le client" : "Ajouter un client"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {clientEnEdition
                    ? "Modifie les coordonnées de ce client."
                    : "Renseigne les informations de ton nouveau client."}
                </p>
              </div>
              <button
                type="button"
                onClick={fermerModal}
                disabled={chargement}
                aria-label="Fermer la fenêtre"
                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={ajouterClient} className="space-y-5">
              <div>
                <label htmlFor="nom-client" className="mb-2 block text-sm font-medium text-gray-700">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom-client"
                  autoFocus
                  required
                  maxLength={120}
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  placeholder="Ex. : Jean Dupont"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              <div>
                <label htmlFor="email-client" className="mb-2 block text-sm font-medium text-gray-700">
                  Adresse e-mail
                </label>
                <input
                  id="email-client"
                  type="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jean@exemple.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              <div>
                <label htmlFor="telephone-client" className="mb-2 block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  id="telephone-client"
                  type="tel"
                  maxLength={30}
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                  placeholder="Ex. : 97000000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {erreur && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {erreur}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={chargement}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={chargement}
                  className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chargement
                    ? "Enregistrement..."
                    : clientEnEdition
                        ? "Enregistrer les modifications"
                        : "Enregistrer le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
