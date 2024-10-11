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

// Curl commands to test the API with different users and authorization scenarios:

// 1. Create a new job post (AGENT user)
// curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <AGENT_TOKEN>" -d '{"jobTitle":"Software Engineer","vacancies":2,"location":"New York","durationHours":40,"remuneration":100000,"contact":"jobs@example.com"}' http://localhost:3000/api/jobs

// 2. Create a new job post (UNIVERSITY user)
// curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <UNIVERSITY_TOKEN>" -d '{"jobTitle":"Professor","vacancies":1,"location":"Boston","durationHours":35,"remuneration":90000,"contact":"faculty@university.edu"}' http://localhost:3000/api/jobs

// 3. Create a new job post (TRAINER user - should fail due to unauthorized user type)
// curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TRAINER_TOKEN>" -d '{"jobTitle":"Fitness Instructor","vacancies":3,"location":"Los Angeles","durationHours":20,"remuneration":50000,"contact":"gym@example.com"}' http://localhost:3000/api/jobs

// 4. Get all job posts (no authentication required)
// curl -X GET http://localhost:3000/api/jobs

// 5. Update a job post (AGENT user)
// curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <AGENT_TOKEN>" -d '{"id":"<JOB_ID>","jobTitle":"Senior Software Engineer","vacancies":1,"location":"San Francisco","durationHours":40,"remuneration":150000,"contact":"jobs@example.com"}' http://localhost:3000/api/jobs

// 6. Update a job post (UNIVERSITY user)
// curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <UNIVERSITY_TOKEN>" -d '{"id":"<JOB_ID>","jobTitle":"Associate Professor","vacancies":2,"location":"Chicago","durationHours":35,"remuneration":95000,"contact":"faculty@university.edu"}' http://localhost:3000/api/jobs

// 7. Update a job post (TRAINER user - should fail due to unauthorized user type)
// curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <TRAINER_TOKEN>" -d '{"id":"<JOB_ID>","jobTitle":"Senior Fitness Instructor","vacancies":2,"location":"Miami","durationHours":25,"remuneration":60000,"contact":"gym@example.com"}' http://localhost:3000/api/jobs

// 8. Delete a job post (AGENT user)
// curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer <AGENT_TOKEN>" -d '{"id":"<JOB_ID>"}' http://localhost:3000/api/jobs

// 9. Delete a job post (UNIVERSITY user)
// curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer <UNIVERSITY_TOKEN>" -d '{"id":"<JOB_ID>"}' http://localhost:3000/api/jobs

// 10. Delete a job post (TRAINER user - should fail due to unauthorized user type)
// curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer <TRAINER_TOKEN>" -d '{"id":"<JOB_ID>"}' http://localhost:3000/api/jobs

// Note: Replace <AGENT_TOKEN>, <UNIVERSITY_TOKEN>, <TRAINER_TOKEN>, and <JOB_ID> with actual values in the curl commands above.
