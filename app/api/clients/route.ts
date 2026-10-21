
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      status: "ok",
      data: clients,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des clients :", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Impossible de récupérer les clients.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("nom" in body) ||
      typeof body.nom !== "string" ||
      body.nom.trim().length === 0
    ) {
      return NextResponse.json(
        { status: "error", message: "Le nom du client est obligatoire." },
        { status: 400 },
      );
    }

    const email =
      "email" in body && typeof body.email === "string"
        ? body.email.trim()
        : "";

    const telephone =
      "telephone" in body && typeof body.telephone === "string"
        ? body.telephone.trim()
        : "";

    const client = await prisma.client.create({
      data: {
        nom: body.nom.trim(),
        email: email || null,
        telephone: telephone || null,
      },
    });

    return NextResponse.json(
      { status: "ok", data: client },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { status: "error", message: "Le JSON envoyé est invalide." },
        { status: 400 },
      );
    }

    console.error("Erreur lors de la création du client :", error);

    return NextResponse.json(
      { status: "error", message: "Impossible de créer le client." },
      { status: 500 },
    );
  }
}


export async function PATCH(request: Request) {
  try {
    const json: unknown = await request.json();

    if (
      typeof json !== "object" ||
      json === null ||
      Array.isArray(json)
    ) {
      return NextResponse.json(
        { status: "error", message: "Les données envoyées sont invalides." },
        { status: 400 },
      );
    }

    const body = json as Record<string, unknown>;

    if (
      typeof body.id !== "string" ||
      body.id.trim().length === 0
    ) {
      return NextResponse.json(
        { status: "error", message: "L'identifiant du client est obligatoire." },
        { status: 400 },
      );
    }

    const hasNom = "nom" in body;
    const hasEmail = "email" in body;
    const hasTelephone = "telephone" in body;

    if (!hasNom && !hasEmail && !hasTelephone) {
      return NextResponse.json(
        { status: "error", message: "Aucune information à modifier." },
        { status: 400 },
      );
    }

    if (
      hasNom &&
      (typeof body.nom !== "string" || body.nom.trim().length === 0)
    ) {
      return NextResponse.json(
        { status: "error", message: "Le nom du client est obligatoire." },
        { status: 400 },
      );
    }

    if (
      hasEmail &&
      body.email !== null &&
      typeof body.email !== "string"
    ) {
      return NextResponse.json(
        { status: "error", message: "L'adresse e-mail est invalide." },
        { status: 400 },
      );
    }

    if (
      hasTelephone &&
      body.telephone !== null &&
      typeof body.telephone !== "string"
    ) {
      return NextResponse.json(
        { status: "error", message: "Le téléphone est invalide." },
        { status: 400 },
      );
    }

    const data: {
      nom?: string;
      email?: string | null;
      telephone?: string | null;
    } = {};

    if (hasNom) {
      const nom = body.nom;

    if (typeof nom === "string") {
        data.nom = nom.trim();
    }
    }

    if (hasEmail) {
      data.email =
        typeof body.email === "string" && body.email.trim()
          ? body.email.trim()
          : null;
    }

    if (hasTelephone) {
      data.telephone =
        typeof body.telephone === "string" && body.telephone.trim()
          ? body.telephone.trim()
          : null;
    }

    const client = await prisma.client.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json({
      status: "ok",
      data: client,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { status: "error", message: "Le JSON envoyé est invalide." },
        { status: 400 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { status: "error", message: "Client introuvable." },
        { status: 404 },
      );
    }

    console.error("Erreur lors de la modification du client :", error);

    return NextResponse.json(
      { status: "error", message: "Impossible de modifier le client." },
      { status: 500 },
    );
  }
}


export async function DELETE(request: Request) {
  try {
    const json: unknown = await request.json();

    if (
      typeof json !== "object" ||
      json === null ||
      Array.isArray(json) ||
      !("id" in json) ||
      typeof json.id !== "string" ||
      json.id.trim().length === 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "L'identifiant du client est obligatoire.",
        },
        { status: 400 },
      );
    }

    const client = await prisma.client.delete({
      where: { id: json.id },
    });

    return NextResponse.json({
      status: "ok",
      message: "Client supprimé avec succès.",
      data: client,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Le JSON envoyé est invalide.",
        },
        { status: 400 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { status: "error", message: "Client introuvable." },
        { status: 404 },
      );
    }

    console.error("Erreur lors de la suppression du client :", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Impossible de supprimer le client.",
      },
      { status: 500 },
    );
  }
}
