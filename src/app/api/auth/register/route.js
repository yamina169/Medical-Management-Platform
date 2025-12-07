// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { registerUser } from "@/actions/register";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📥 DATA FRONT :", body);

    const result = await registerUser(body);

    return NextResponse.json(result, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
