import { LoginForm } from "@/components/Auth/Login";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
  return (
    <>
      <div className="mx-auto h-screen justify-center items-center flex">
        <h1>Hey There'</h1>
      </div>
    </>
  );
}
