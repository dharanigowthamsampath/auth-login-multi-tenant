// Import necessary dependencies and components
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define Zod schemas for form validation
// Base schema for common fields
const baseSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  userType: z.enum(["UNIVERSITY", "AGENT", "TRAINER"]),
});

// Extended schema for trainer-specific fields
const trainerSchema = baseSchema.extend({
  expertise: z.array(z.string()),
  certification: z.string(),
  availableHours: z.number().min(0),
  hourlyRate: z.number().min(0),
});

// Extended schema for agent-specific fields
const agentSchema = baseSchema.extend({
  agencyName: z.string(),
  licenseNumber: z.string(),
  specialization: z.string(),
  yearsExperience: z.number().min(0),
});

// Extended schema for university-specific fields
const universitySchema = baseSchema.extend({
  name: z.string(),
  location: z.string(),
  establishedYear: z.number().min(1000).max(new Date().getFullYear()),
  accreditation: z.string(),
});

// Define the form schema type
type FormSchema = z.infer<
  typeof trainerSchema | typeof agentSchema | typeof universitySchema
>;

// Main Register component
export function Register() {
  // Initialize state variables
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Initialize form using react-hook-form and zod resolver
  const form = useForm<FormSchema>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      userType: "TRAINER",
    },
  });

  // Function to get the appropriate schema based on the current step and user type
  const getStepSchema = () => {
    if (step === 1) return baseSchema;
    switch (form.getValues("userType")) {
      case "TRAINER":
        return trainerSchema;
      case "AGENT":
        return agentSchema;
      case "UNIVERSITY":
        return universitySchema;
      default:
        return baseSchema;
    }
  };

  // Effect to reset form when step changes
  useEffect(() => {
    form.clearErrors();
    form.reset(form.getValues());
  }, [step]);

  // Form submission handler
  const onSubmit = async (values: FormSchema) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError("");

    const { username, email, password, userType, ...additionalInfo } = values;

    try {
      // Send registration request to the server
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          userType,
          additionalInfo,
        }),
      });

      if (response.ok) {
        router.push("login");
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render the registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 ? (
                // Render first step form fields (common fields)
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.reset({
                              ...form.getValues(),
                              userType: value as
                                | "UNIVERSITY"
                                | "AGENT"
                                | "TRAINER",
                            });
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UNIVERSITY">
                              University
                            </SelectItem>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="TRAINER">Trainer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                // Render second step form fields (user type specific fields)
                <>
                  {form.getValues("userType") === "TRAINER" && (
                    // Render trainer-specific fields
                    <>
                      <FormField
                        control={form.control}
                        name="expertise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expertise</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your expertise (comma-separated)"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value.split(","))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="certification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certification</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your certification"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="availableHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Hours</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter available hours"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter hourly rate"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {form.getValues("userType") === "AGENT" && (
                    // Render agent-specific fields
                    <>
                      <FormField
                        control={form.control}
                        name="agencyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your agency name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your license number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your specialization"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter years of experience"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {form.getValues("userType") === "UNIVERSITY" && (
                    // Render university-specific fields
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>University Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter university name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter university location"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="establishedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Established Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter established year"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accreditation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accreditation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter accreditation"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
              {error && (
                // Display error message if there's an error
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-between w-full">
                {step === 2 && (
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-[49%]"
                    variant="secondary"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className={step === 2 ? "w-[49%]" : "w-full"}
                  disabled={isLoading}
                >
                  {step === 2
                    ? isLoading
                      ? "Registering..."
                      : "Register"
                    : isLoading
                    ? "Loading..."
                    : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Link href="login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
