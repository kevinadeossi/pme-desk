
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  nom: string;
};

type Demande = {
  id: string;
  titre: string;
  description: string | null;
  statut: string;
  clientId: string;
  client: {
    id: string;
    nom: string;
    email: string | null;
    telephone: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialDemandes: Demande[];
  clients: Client[];
};

function formaterDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function libelleStatut(statut: string) {
  switch (statut) {
    case "EN_ATTENTE":
      return "En attente";
    case "EN_COURS":
      return "En cours";
    case "TERMINEE":
      return "Terminée";
    case "ANNULEE":
      return "Annulée";
    default:
      return statut.replaceAll("_", " ");
  }
}

export default function DemandesManager({
  initialDemandes,
  clients,
}: Props) {
  const router = useRouter();

  const [demandes, setDemandes] = useState(initialDemandes);
  const [recherche, setRecherche] = useState("");
  const [modalOuverte, setModalOuverte] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);  
  const [statutsEnCours, setStatutsEnCours] = useState<string[]>([]);
  const [erreurStatut, setErreurStatut] = useState("");
  const [demandeEnEdition, setDemandeEnEdition] = useState<Demande | null>(null);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [erreurModification, setErreurModification] = useState("");

  async function modifierStatut(demandeId: string, nouveauStatut: string) {
    const demandeActuelle = demandes.find(
      (demande) => demande.id === demandeId,
    );

    if (!demandeActuelle || demandeActuelle.statut === nouveauStatut) {
      return;
    }

    setErreurStatut("");
    setStatutsEnCours((precedents) => [...precedents, demandeId]);

    try {
      const response = await fetch("/api/demandes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: demandeId,
          statut: nouveauStatut,
        }),
      });

      const resultat = await response.json();

      if (!response.ok) {
        throw new Error(
          resultat.message || "Impossible de modifier le statut.",
        );
      }

      setDemandes((precedentes) =>
        precedentes.map((demande) =>
          demande.id === demandeId
            ? (resultat.data as Demande)
            : demande,
        ),
      );

      router.refresh();
    } catch (error) {
      setErreurStatut(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la modification du statut.",
      );
    } finally {
      setStatutsEnCours((precedents) =>
        precedents.filter((id) => id !== demandeId),
      );
    }
  }


  const demandesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    if (!terme) return demandes;

    return demandes.filter((demande) =>
      [
        demande.titre,
        demande.description,
        demande.client.nom,
        libelleStatut(demande.statut),
      ].some((valeur) => valeur?.toLowerCase().includes(terme)),
    );
  }, [demandes, recherche]);

  function ouvrirModal() {
    setTitre("");
    setDescription("");
    setClientId(clients[0]?.id ?? "");
    setErreur("");
    setModalOuverte(true);
  }

  function fermerModal() {
    if (chargement) return;

    setModalOuverte(false);
    setTitre("");
    setDescription("");
    setClientId("");
    setErreur("");
  }
    
  function ouvrirModification(demande: Demande) {
    setDemandeEnEdition(demande);
    setTitre(demande.titre);
    setDescription(demande.description ?? "");
    setClientId(demande.clientId);
    setErreurModification("");
    }

    function fermerModification() {
    if (modificationEnCours) return;

    setDemandeEnEdition(null);
    setTitre("");
    setDescription("");
    setClientId("");
    setErreurModification("");
    }

    async function enregistrerModification(
    event: React.FormEvent<HTMLFormElement>,
    ) {
    event.preventDefault();

    if (!demandeEnEdition) return;

    if (!titre.trim()) {
        setErreurModification("Le titre de la demande est obligatoire.");
        return;
    }

    if (!clientId) {
        setErreurModification("Sélectionne un client.");
        return;
    }

    setModificationEnCours(true);
    setErreurModification("");

    try {
        const response = await fetch("/api/demandes", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: demandeEnEdition.id,
            titre: titre.trim(),
            description: description.trim() || null,
            clientId,
        }),
        });

        const resultat = await response.json();

        if (!response.ok) {
        throw new Error(
            resultat.message || "Impossible de modifier la demande.",
        );
        }

        setDemandes((precedentes) =>
        precedentes.map((demande) =>
            demande.id === demandeEnEdition.id
            ? (resultat.data as Demande)
            : demande,
        ),
        );

        setDemandeEnEdition(null);
        setTitre("");
        setDescription("");
        setClientId("");
        setErreurModification("");
        router.refresh();   
    } catch (error) {
        setErreurModification(
        error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la modification.",
        );
    } finally {
        setModificationEnCours(false);
    }
  }

  async function ajouterDemande(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErreur("");

    if (!titre.trim()) {
      setErreur("Le titre de la demande est obligatoire.");
      return;
    }

    if (!clientId) {
      setErreur("Sélectionne un client.");
      return;
    }

    setChargement(true);

    try {
      const response = await fetch("/api/demandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: titre.trim(),
          description: description.trim() || null,
          clientId,
        }),
      });

      const resultat = await response.json();

      if (!response.ok) {
        setErreur(
          resultat.message || "Impossible de créer la demande.",
        );
        return;
      }

      setDemandes((precedentes) => [
        resultat.data as Demande,
        ...precedentes,
      ]);

      fermerModal();
      router.refresh();
    } catch {
      setErreur(
        "Erreur de connexion. Vérifie que le serveur fonctionne.",
      );
    } finally {
      setChargement(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Consulte et organise les demandes de tes clients.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {demandes.length} demande{demandes.length > 1 ? "s" : ""} enregistrée
            {demandes.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={ouvrirModal}
          disabled={clients.length === 0}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Nouvelle demande
        </button>
      </div>

      {clients.length === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Tu dois d’abord enregistrer un client dans la rubrique Clients
          avant de pouvoir créer une demande.
        </p>
      )}
      {erreurStatut && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {erreurStatut}
        </p>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="recherche-demandes"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Rechercher une demande
        </label>
        <input
          id="recherche-demandes"
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Titre, client, description ou statut..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Liste des demandes
          </h2>
        </div>

        {demandesFiltrees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-800">
              {recherche
                ? "Aucun résultat trouvé"
                : "Aucune demande pour le moment"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {recherche
                ? "Essaie avec un autre terme de recherche."
                : "Crée ta première demande pour commencer."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Demande</th>
                  <th className="px-5 py-4 font-medium">Client</th>
                  <th className="px-5 py-4 font-medium">Statut</th>
                  <th className="px-5 py-4 font-medium">Date de création</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandesFiltrees.map((demande) => (
                  <tr
                    key={demande.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="max-w-sm px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {demande.titre}
                      </p>
                      {demande.description && (
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                          {demande.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {demande.client.nom}
                    </td>
                    
                    <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                            <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                demande.statut === "EN_ATTENTE"
                                ? "bg-amber-50 text-amber-700"
                                : demande.statut === "EN_COURS"
                                    ? "bg-blue-50 text-blue-700"
                                    : demande.statut === "TERMINEE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-700"
                            }`}
                            >
                            {libelleStatut(demande.statut)}
                            </span>

                            <select
                            aria-label={`Modifier le statut de ${demande.titre}`}
                            value={demande.statut}
                            disabled={statutsEnCours.includes(demande.id)}
                            onChange={(event) =>
                                modifierStatut(demande.id, event.target.value)
                            }
                            className="max-w-40 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500 disabled:cursor-wait disabled:opacity-50"
                            >
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="EN_COURS">En cours</option>
                            <option value="TERMINEE">Terminée</option>
                            <option value="ANNULEE">Annulée</option>
                            </select>
                        </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formaterDate(demande.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                        <button
                            type="button"
                            onClick={() => ouvrirModification(demande)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Modifier
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {demandeEnEdition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modification-demande"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
            <h2
                id="titre-modification-demande"
                className="mb-5 text-xl font-bold text-slate-900"
            >
                Modifier la demande
            </h2>

            <form onSubmit={enregistrerModification} className="space-y-5">
                <div>
                <label htmlFor="client-modification" className="mb-2 block text-sm font-medium text-slate-700">
                    Client
                </label>
                <select
                    id="client-modification"
                    required
                    value={clientId}
                    onChange={(event) => setClientId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                    {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.nom}
                    </option>
                    ))}
                </select>
                </div>

                <div>
                <label htmlFor="titre-modification" className="mb-2 block text-sm font-medium text-slate-700">
                    Titre
                </label>
                <input
                    id="titre-modification"
                    required
                    maxLength={200}
                    value={titre}
                    onChange={(event) => setTitre(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
                </div>

                <div>
                <label htmlFor="description-modification" className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                </label>
                <textarea
                    id="description-modification"
                    rows={4}
                    maxLength={5000}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
                </div>

                {erreurModification && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {erreurModification}
                </p>
                )}

                <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={fermerModification}
                    disabled={modificationEnCours}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={modificationEnCours}
                    className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {modificationEnCours ? "Enregistrement..." : "Enregistrer"}
                </button>
                </div>
            </form>
            </div>
        </div>
      )}

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
            aria-labelledby="titre-modal-demande"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="titre-modal-demande"
                  className="text-xl font-bold text-slate-900"
                >
                  Nouvelle demande
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Renseigne les informations de la demande du client.
                </p>
              </div>

              <button
                type="button"
                onClick={fermerModal}
                disabled={chargement}
                aria-label="Fermer la fenêtre"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={ajouterDemande} className="space-y-5">
              <div>
                <label
                  htmlFor="client-demande"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  id="client-demande"
                  required
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="titre-demande"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Titre de la demande{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="titre-demande"
                  required
                  maxLength={200}
                  autoFocus
                  value={titre}
                  onChange={(event) => setTitre(event.target.value)}
                  placeholder="Ex. : Création d'un site web"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="description-demande"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description-demande"
                  rows={4}
                  maxLength={5000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Décris le besoin du client..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {erreur && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {erreur}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={chargement}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={chargement || clients.length === 0}
                  className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chargement ? "Enregistrement..." : "Enregistrer la demande"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
