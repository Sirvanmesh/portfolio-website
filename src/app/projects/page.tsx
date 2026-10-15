import type { Metadata } from "next";
import { Projects } from "@/components/Sections";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <Projects />;
}
