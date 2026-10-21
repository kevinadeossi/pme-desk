
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const demandes = await prisma.demande.findMany({
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
    });

    return NextResponse.json({
      status: "ok",
      data: demandes,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Impossible de récupérer les demandes.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();

    if (
      typeof json !== "object" ||
      json === null ||
      Array.isArray(json)
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Les données envoyées sont invalides.",
        },
        { status: 400 },
      );
    }

    const body = json as Record<string, unknown>;

    if (
      typeof body.titre !== "string" ||
      body.titre.trim().length === 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Le titre de la demande est obligatoire.",
        },
        { status: 400 },
      );
    }

    if (
      typeof body.clientId !== "string" ||
      body.clientId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Le client associé est obligatoire.",
        },
        { status: 400 },
      );
    }

    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "La description doit être du texte.",
        },
        { status: 400 },
      );
    }

    const client = await prisma.client.findUnique({
      where: {
        id: body.clientId,
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          status: "error",
          message: "Le client sélectionné est introuvable.",
        },
        { status: 404 },
      );
    }

    const demande = await prisma.demande.create({
      data: {
        titre: body.titre.trim(),
        description:
          typeof body.description === "string" &&
          body.description.trim().length > 0
            ? body.description.trim()
            : null,
        clientId: client.id,
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
    });

    return NextResponse.json(
      {
        status: "ok",
        data: demande,
      },
      { status: 201 },
    );
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

    console.error("Erreur lors de la création de la demande :", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Impossible de créer la demande.",
      },
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
        {
          status: "error",
          message: "Les données envoyées sont invalides.",
        },
        { status: 400 },
      );
    }

    const body = json as Record<string, unknown>;

    if (
      typeof body.id !== "string" ||
      body.id.trim().length === 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "L'identifiant de la demande est obligatoire.",
        },
        { status: 400 },
      );
    }

    const demandeExistante = await prisma.demande.findUnique({
      where: { id: body.id },
      select: { id: true },
    });

    if (!demandeExistante) {
      return NextResponse.json(
        {
          status: "error",
          message: "La demande est introuvable.",
        },
        { status: 404 },
      );
    }

    const data: {
      statut?: string;
      titre?: string;
      description?: string | null;
      clientId?: string;
    } = {};

    if (body.statut !== undefined) {
      const statutsAutorises = [
        "EN_ATTENTE",
        "EN_COURS",
        "TERMINEE",
        "ANNULEE",
      ];

      if (
        typeof body.statut !== "string" ||
        !statutsAutorises.includes(body.statut)
      ) {
        return NextResponse.json(
          {
            status: "error",
            message: "Le statut envoyé est invalide.",
          },
          { status: 400 },
        );
      }

      data.statut = body.statut;
    }

    if (body.titre !== undefined) {
      if (
        typeof body.titre !== "string" ||
        body.titre.trim().length === 0
      ) {
        return NextResponse.json(
          {
            status: "error",
            message: "Le titre de la demande est obligatoire.",
          },
          { status: 400 },
        );
      }

      data.titre = body.titre.trim();
    }

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== "string"
      ) {
        return NextResponse.json(
          {
            status: "error",
            message: "La description doit être du texte.",
          },
          { status: 400 },
        );
      }

      data.description =
        typeof body.description === "string" &&
        body.description.trim().length > 0
          ? body.description.trim()
          : null;
    }

    if (body.clientId !== undefined) {
      if (
        typeof body.clientId !== "string" ||
        body.clientId.trim().length === 0
      ) {
        return NextResponse.json(
          {
            status: "error",
            message: "Le client associé est obligatoire.",
          },
          { status: 400 },
        );
      }

      const client = await prisma.client.findUnique({
        where: { id: body.clientId },
        select: { id: true },
      });

      if (!client) {
        return NextResponse.json(
          {
            status: "error",
            message: "Le client sélectionné est introuvable.",
          },
          { status: 404 },
        );
      }

      data.clientId = client.id;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Aucune modification à effectuer.",
        },
        { status: 400 },
      );
    }

    const demande = await prisma.demande.update({
      where: { id: body.id },
      data,
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
    });

    return NextResponse.json({
      status: "ok",
      data: demande,
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

    console.error("Erreur lors de la modification de la demande :", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Impossible de modifier la demande.",
      },
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
      Array.isArray(json)
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Les données envoyées sont invalides.",
        },
        { status: 400 },
      );
    }

    const body = json as Record<string, unknown>;

    if (
      typeof body.id !== "string" ||
      body.id.trim().length === 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "L'identifiant de la demande est obligatoire.",
        },
        { status: 400 },
      );
    }

    const demandeExistante = await prisma.demande.findUnique({
      where: { id: body.id },
      select: { id: true },
    });

    if (!demandeExistante) {
      return NextResponse.json(
        {
          status: "error",
          message: "La demande est introuvable.",
        },
        { status: 404 },
      );
    }

    await prisma.demande.delete({
      where: { id: body.id },
    });

    return NextResponse.json({
      status: "ok",
      message: "La demande a été supprimée avec succès.",
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

    console.error(
      "Erreur lors de la suppression de la demande :",
      error,
    );

    return NextResponse.json(
      {
        status: "error",
        message: "Impossible de supprimer la demande.",
      },
      { status: 500 },
    );
  }
}

