"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

const apiEndpoints = [
  {
    name: "Register User",
    endpoint: "/api/auth/register",
    method: "POST",
    description: "Register a new user (UNIVERSITY, AGENT, or TRAINER)",
    example:
      'curl -X POST -H "Content-Type: application/json" -d \'{"username":"user1","email":"user1@example.com","password":"password123","userType":"TRAINER","additionalInfo":{"expertise":["Math","Science"],"certification":"Certified Teacher","availableHours":20,"hourlyRate":50}}\' http://localhost:3000/api/auth/register',
  },
  {
    name: "Login User",
    endpoint: "/api/auth/login",
    method: "POST",
    description: "Login a user and receive a JWT token",
    example:
      'curl -X POST -H "Content-Type: application/json" -d \'{"email":"user1@example.com","password":"password123"}\' http://localhost:3000/api/auth/login',
  },
  {
    name: "Create Job",
    endpoint: "/api/jobs",
    method: "POST",
    description: "Create a new job posting (requires authentication)",
    example:
      'curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d \'{"jobTitle":"Math Teacher","vacancies":2,"location":"New York","durationHours":40,"remuneration":5000,"contact":"jobs@example.com"}\' http://localhost:3000/api/jobs',
  },
  {
    name: "Get All Jobs",
    endpoint: "/api/jobs",
    method: "GET",
    description: "Retrieve all job postings",
    example: "curl http://localhost:3000/api/jobs",
  },
  {
    name: "Update Job",
    endpoint: "/api/jobs",
    method: "PUT",
    description: "Update an existing job posting (requires authentication)",
    example:
      'curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d \'{"id":"job_id_here","jobTitle":"Updated Math Teacher","vacancies":3}\' http://localhost:3000/api/jobs',
  },
  {
    name: "Delete Job",
    endpoint: "/api/jobs",
    method: "DELETE",
    description: "Delete a job posting (requires authentication)",
    example:
      'curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d \'{"id":"job_id_here"}\' http://localhost:3000/api/jobs',
  },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEndpoints = apiEndpoints.filter(
    (endpoint) =>
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            API Endpoints Dashboard
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Available API Endpoints</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Search endpoints..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Example</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEndpoints.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell>{endpoint.name}</TableCell>
                      <TableCell>{endpoint.endpoint}</TableCell>
                      <TableCell>{endpoint.method}</TableCell>
                      <TableCell>{endpoint.description}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 p-1 rounded break-all">
                          {endpoint.example}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
