import { LoginForm } from "@/components/Auth/Login";
import Image from "next/image";
import { redirect } from "next/navigation";
import DashboardPage from "../dashboard/page";

export default function Home() {
  return <DashboardPage />;
}
