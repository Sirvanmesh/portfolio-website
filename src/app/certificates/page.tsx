import type { Metadata } from "next";
import { Certificates } from "@/components/Sections";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesPage() {
  return <Certificates />;
}
