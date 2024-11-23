"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // shadcn button
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // shadcn card components
import { Input } from "@/components/ui/input"; // shadcn input
import { Label } from "@/components/ui/label"; // shadcn label
import { ReusableAlert } from "@/components/Utils/ReusableAlert"; // assuming you have a reusable alert
import { Loader2 } from "lucide-react"; // Loader icon for loading state
import { useAuthStore } from "@/store/useAuthStore"; // Zustand store for token

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken); // Access the setToken function from Zustand store

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({
    type: "",
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    setMessage({ type: "", title: "", description: "" });

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
        setToken(data.token); // Store token in Zustand
        setMessage({
          type: "success",
          title: "Login Successful",
          description: "You have successfully logged in!",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        const errorData = await res.json();
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Card className="mx-auto w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Conditional alert */}
          {message.type && (
            <ReusableAlert
              type={message.type as "success" | "error"}
              title={message.title}
              description={message.description}
            />
          )}

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
                <span className="text-gray-500 text-sm mt-1 italic">
                  Please use your college email ID.
                </span>
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
                <span className="text-gray-500 text-sm mt-1 italic">
                  Must include 1 uppercase, 1 lowercase, 1 special character,
                  and be at least 6 characters long.
                </span>
              </div>

              <Button type="submit" className="w-full mt-4">
                {isLoading ? (
                  <Loader2 className="animate-spin flex justify-center" />
                ) : (
                  <>Login</>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <a href="/register" className="underline text-blue-600">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
