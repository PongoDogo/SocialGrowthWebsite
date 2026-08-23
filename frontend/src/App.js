import "@/App.css";
import { Toaster } from "sonner";
import { LangProvider } from "@/i18n";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Services } from "@/components/Services";
import { Clients } from "@/components/Clients";
import { Process } from "@/components/Process";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function App() {
  return (
    <LangProvider>
      <div className="App grain" data-testid="app-root">
        <Navbar />
        <main>
          <Hero />
          <Stats />
          <Services />
          <Clients />
          <Process />
          <Contact />
        </main>
        <Footer />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </LangProvider>
  );
}
