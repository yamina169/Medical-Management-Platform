import prisma from "@/lib/prisma";
import {
  activateSubscription,
  autoUpdateSubscriptions,
} from "@/actions/subscriptions";
import jwt from "jsonwebtoken"; // ou la lib que tu utilises pour JWT

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req, res) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // Vérifier le token
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.role !== "SUPERADMIN") {
      return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await autoUpdateSubscriptions();

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        include: { admins: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.clinic.count(),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: clinics,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

export async function PUT(req, res) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // Vérifier le token
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.role !== "CLINIC_ADMIN") {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json();
    if (!body.clinicId || typeof body.clinicId !== "number") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "clinicId is required and must be a number",
        }),
        { status: 400 }
      );
    }

    // Vérifier que l'admin appartient bien à cette clinique
    const adminClinic = await prisma.adminClinic.findFirst({
      where: { clinicId: body.clinicId, userId: user.id },
    });
    if (!adminClinic) return new Response("Forbidden", { status: 403 });

    const updatedClinic = await activateSubscription(body.clinicId);

    return new Response(
      JSON.stringify({ success: true, clinic: updatedClinic }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
