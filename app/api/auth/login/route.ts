import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { University, Agent, Trainer } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret";

// Define interfaces for response data
interface TrainerResponse extends Omit<Trainer, "expertise"> {
  expertise: string[];
}

interface UserResponse {
  id: string;
  email: string;
  username: string;
  userType: "UNIVERSITY" | "AGENT" | "TRAINER";
  university?: University;
  agent?: Agent;
  trainer?: TrainerResponse;
}

interface LoginResponse {
  message: string;
  token: string;
  user: UserResponse;
}

// curl command to test this API:
// curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' http://localhost:3000/api/auth/login

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Fetch user type-specific data
    let specificUserData: University | Agent | TrainerResponse | undefined;
    switch (user.userType) {
      case "UNIVERSITY":
        const universityData = await prisma.university.findUnique({
          where: { userId: user.id },
        });
        if (universityData) {
          specificUserData = universityData;
        } else {
          throw new Error("University data not found");
        }
        break;
      case "AGENT":
        const agentData = await prisma.agent.findUnique({
          where: { userId: user.id },
        });
        if (!agentData) {
          throw new Error("Agent not found");
        }
        specificUserData = agentData;
        break;
      case "TRAINER":
        const trainerData = await prisma.trainer.findUnique({
          where: { userId: user.id },
        });
        if (trainerData) {
          specificUserData = {
            ...trainerData,
            expertise: trainerData.expertise.split(","),
          };
        } else {
          throw new Error("Trainer not found");
        }
        break;
      default:
        throw new Error("Invalid user type");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Prepare the response data
    const responseData: LoginResponse = {
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType as "UNIVERSITY" | "AGENT" | "TRAINER",
        [user.userType.toLowerCase()]: specificUserData,
      },
    };

    // Return the token and user data in the response body
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
