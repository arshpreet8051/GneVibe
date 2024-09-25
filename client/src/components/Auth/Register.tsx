"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // shadcn Select component
import { ReusableAlert } from "@/components/Utils/ReusableAlert"; // Import the alert component

// Define a mapping for branch names
const branchMap: Record<string, string> = {
  IT: "Information Technology",
  CSE: "Computer Science and Engineering",
  ECE: "Electronics and Communication Engineering",
  EE: "Electrical Engineering",
  ME: "Mechanical Engineering",
  CE: "Civil Engineering",
  PE: "Production Engineering",
};

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    crn: "",
    urn: "",
    yearOfAdmission: "",
    branch: "",
  });
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    description: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branchMap[formData.branch as keyof typeof branchMap]; // Type assertion
    const dataToSend = {
      ...formData,
      branch, // Use the mapped value for branch
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (res.ok) {
        const responseData = await res.json();
        console.log(responseData)
        setAlert({
          type: "success",
          title: "Registration Successful!",
          description: responseData.message,
        });
        console.log("Registration successful", responseData);
      } else {
        const errorData = await res.json();
        setAlert({
          type: "error",
          title: "Registration Failed",
          description:
            errorData.message || "An error occurred during registration.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        title: "Error",
        description: "An error occurred during registration.",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center">
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {/* Name and Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Shubham Kumar"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="example"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 tracking-wide mt-2">
                  Enter the college email ending with{" "}
                  <strong>@gndec.ac.in</strong>
                </p>
              </div>
            </div>

            {/* Password and Branch */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Branch</Label>
                <Select
                  name="branch"
                  required
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(branchMap).map((key) => (
                      <SelectItem key={key} value={key}>
                        {branchMap[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CRN and URN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="crn">CRN</Label>
                <Input
                  id="crn"
                  name="crn"
                  placeholder="2121116"
                  required
                  value={formData.crn}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="urn">URN</Label>
                <Input
                  id="urn"
                  name="urn"
                  placeholder="2104574"
                  required
                  value={formData.urn}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Year of Admission */}
            <div>
              <Label htmlFor="yearOfAdmission">Year of Admission</Label>
              <Input
                id="yearOfAdmission"
                name="yearOfAdmission"
                type="number"
                placeholder="2021"
                required
                value={formData.yearOfAdmission}
                onChange={handleChange}
              />
            </div>

            {/* Submit button */}
            <div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>

          {/* Render alert if exists */}
          {alert && (
            <ReusableAlert
              type={alert.type}
              title={alert.title}
              description={alert.description}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
