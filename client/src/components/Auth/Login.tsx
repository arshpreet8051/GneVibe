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
import { ReusableAlert } from "@/components/Utils/ReusableAlert"; // Import the reusable alert

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({
    type: "",
    title: "",
    description: "",
  }); // Store alert message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", title: "", description: "" }); // Clear any previous messages

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        // On success, set success alert
        setMessage({
          type: "success",
          title: "Login Successful",
          description: "You have successfully logged in!",
        });
        console.log("Login successful", data);
      } else {
        const errorData = await res.json();
        // On error, set error alert
        setMessage({
          type: "error",
          title: "Login Failed",
          description: errorData.message || "An error occurred during login.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        title: "An Error Occurred",
        description: "An error occurred during login. Please try again later.",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center">
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>

          {/* Conditionally render the reusable alert based on success or error */}
          {message.type && (
            <ReusableAlert
              type={message.type as "success" | "error"}
              title={message.title}
              description={message.description}
            />
          )}

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
