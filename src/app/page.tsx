import {
  About,
  AiToolkit,
  Contact,
  Experience,
  Footer,
  Hero,
  Certificates,
  Nav,
  Projects,
  TerminalSection,
} from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <TerminalSection />
        <About />
        <AiToolkit />
        <Experience />
        <Projects />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
