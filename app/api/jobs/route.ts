import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Create a new job post
export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = await verifyToken(token);

    if (
      !user ||
      (user.userType !== "AGENT" && user.userType !== "UNIVERSITY")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const newJob = await prisma.jobPost.create({
      data: {
        title,
        description,
        userId: user.userId,
      },
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all job posts
export async function GET() {
  try {
    const jobs = await prisma.jobPost.findMany({
      include: { createdBy: { select: { email: true, userType: true } } },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a job post
export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = await verifyToken(token);

    if (
      !user ||
      (user.userType !== "AGENT" && user.userType !== "UNIVERSITY")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, title, description } = await request.json();

    if (!id || (!title && !description)) {
      return NextResponse.json(
        { error: "Invalid update data" },
        { status: 400 }
      );
    }

    const job = await prisma.jobPost.findUnique({ where: { id } });

    if (!job || job.userId !== user.userId) {
      return NextResponse.json(
        { error: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedJob = await prisma.jobPost.update({
      where: { id },
      data: { title, description },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a job post
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = await verifyToken(token);

    if (
      !user ||
      (user.userType !== "AGENT" && user.userType !== "UNIVERSITY")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const job = await prisma.jobPost.findUnique({ where: { id } });

    if (!job || job.userId !== user.userId) {
      return NextResponse.json(
        { error: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.jobPost.delete({ where: { id } });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Job deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
