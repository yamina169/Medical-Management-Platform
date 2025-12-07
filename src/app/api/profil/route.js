import prisma from "@/lib/prisma";
import * as jose from "jose";
import { updateUserProfile } from "@/actions/profil"; // 🟢 utiliser ta fonction existante

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(req) {
  const authHeader = req.headers.get("authorization");
  let token;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    const cookieHeader = req.headers.get("cookie") || "";
    token = cookieHeader.match(/token=([^;]+)/)?.[1];
  }

  if (!token) throw new Error("Token missing");

  const secretKey = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jose.jwtVerify(token, secretKey);
  const userId = payload.sub || payload.id;

  if (!userId) throw new Error("Invalid token");
  return userId;
}

export async function GET(req) {
  try {
    const userId = await getUserIdFromToken(req);

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user)
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  try {
    const userId = await getUserIdFromToken(req);
    const body = await req.json();

    const updatedUser = await updateUserProfile(userId, body);

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
