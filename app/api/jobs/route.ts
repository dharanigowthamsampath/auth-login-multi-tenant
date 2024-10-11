import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/auth";

// Create a new job post
export const POST = authMiddleware(["AGENT", "UNIVERSITY"])(
  async (request: Request) => {
    try {
      const user = (request as any).user;
      const {
        jobTitle,
        vacancies,
        location,
        durationHours,
        remuneration,
        contact,
      } = await request.json();

      if (
        !jobTitle ||
        !vacancies ||
        !location ||
        !durationHours ||
        !remuneration ||
        !contact
      ) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 }
        );
      }

      const newJob = await prisma.job.create({
        data: {
          jobTitle,
          vacancies,
          location,
          durationHours,
          remuneration,
          contact,
          postedById: user.userId,
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
);

// Get all job posts
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: { postedBy: { select: { email: true, userType: true } } },
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
export const PUT = authMiddleware(["AGENT", "UNIVERSITY"])(
  async (request: Request) => {
    try {
      const user = (request as any).user;
      const {
        id,
        jobTitle,
        vacancies,
        location,
        durationHours,
        remuneration,
        contact,
      } = await request.json();

      if (!id) {
        return NextResponse.json(
          { error: "Job ID is required" },
          { status: 400 }
        );
      }

      const job = await prisma.job.findUnique({ where: { id } });

      if (!job || job.postedById !== user.userId) {
        return NextResponse.json(
          { error: "Job not found or unauthorized" },
          { status: 404 }
        );
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          jobTitle,
          vacancies,
          location,
          durationHours,
          remuneration,
          contact,
        },
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
);

// Delete a job post
export const DELETE = authMiddleware(["AGENT", "UNIVERSITY"])(
  async (request: Request) => {
    try {
      const user = (request as any).user;
      const { id } = await request.json();

      if (!id) {
        return NextResponse.json(
          { error: "Job ID is required" },
          { status: 400 }
        );
      }

      const job = await prisma.job.findUnique({ where: { id } });

      if (!job || job.postedById !== user.userId) {
        return NextResponse.json(
          { error: "Job not found or unauthorized" },
          { status: 404 }
        );
      }

      await prisma.job.delete({ where: { id } });

      return NextResponse.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Job deletion error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
