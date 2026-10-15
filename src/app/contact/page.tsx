import type { Metadata } from "next";
import { Contact } from "@/components/Sections";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <Contact />;
}
