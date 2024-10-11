import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// curl commands to test this API:
// For TRAINER:
// curl -X POST -H "Content-Type: application/json" -d '{"username":"trainer1","email":"trainer1@example.com","password":"password123","userType":"TRAINER","additionalInfo":{"expertise":["Math","Science"],"certification":"Certified Teacher","availableHours":20,"hourlyRate":50}}' http://localhost:3000/api/auth/register

// For UNIVERSITY:
// curl -X POST -H "Content-Type: application/json" -d '{"username":"university1","email":"university1@example.com","password":"password123","userType":"UNIVERSITY","additionalInfo":{"name":"Example University","location":"New York","establishedYear":1900,"accreditation":"Fully Accredited"}}' http://localhost:3000/api/auth/register

// For AGENT:
// curl -X POST -H "Content-Type: application/json" -d '{"username":"agent1","email":"agent1@example.com","password":"password123","userType":"AGENT","additionalInfo":{"agencyName":"Top Recruiters","licenseNumber":"AG12345","specialization":"International Students","yearsExperience":5}}' http://localhost:3000/api/auth/register

export async function POST(request: Request) {
  try {
    const { username, email, password, userType, additionalInfo } =
      await request.json();

    // Check if all required fields are provided
    if (!username || !email || !password || !userType) {
      return NextResponse.json(
        { error: "Username, email, password, and userType are required" },
        { status: 400 }
      );
    }

    // Check if user type is valid
    const validUserTypes = ["UNIVERSITY", "AGENT", "TRAINER"];
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        userType,
      },
    });

    // Create specific user type record
    let specificUserData;
    switch (userType) {
      case "UNIVERSITY":
        specificUserData = await prisma.university.create({
          data: {
            userId: newUser.id,
            name: additionalInfo.name,
            location: additionalInfo.location,
            establishedYear: additionalInfo.establishedYear,
            accreditation: additionalInfo.accreditation,
          },
        });
        break;
      case "AGENT":
        specificUserData = await prisma.agent.create({
          data: {
            userId: newUser.id,
            agencyName: additionalInfo.agencyName,
            licenseNumber: additionalInfo.licenseNumber,
            specialization: additionalInfo.specialization,
            yearsExperience: additionalInfo.yearsExperience,
          },
        });
        break;
      case "TRAINER":
        specificUserData = await prisma.trainer.create({
          data: {
            userId: newUser.id,
            expertise: Array.isArray(additionalInfo.expertise)
              ? additionalInfo.expertise.join(",")
              : additionalInfo.expertise,
            certification: additionalInfo.certification,
            availableHours: additionalInfo.availableHours,
            hourlyRate: additionalInfo.hourlyRate,
          },
        });
        break;
    }

    // If you want to return the created user data, you might want to fetch it again
    // to include the specific user type data and convert expertise back to an array
    if (userType === "TRAINER") {
      const createdTrainer = await prisma.trainer.findUnique({
        where: { userId: newUser.id },
        include: { user: true },
      });

      if (createdTrainer) {
        return NextResponse.json(
          {
            message: "User registered successfully",
            user: {
              ...createdTrainer.user,
              trainer: {
                ...createdTrainer,
                expertise: createdTrainer.expertise.split(","),
              },
            },
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
