import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white overflow-hidden selection:bg-[#BA170D] selection:text-white">
      <Navbar />
      <Hero />
      
      {/* Additional Content Spacing to prove scroll */}
      <section className="h-screen flex items-center justify-center bg-black/50">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Experience the Energy</h2>
          <p className="text-gray-400">Join us for the most electrifying event of the year.</p>
        </div>
      </section>
    </main>
  );
}
