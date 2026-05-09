import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Footer from "../../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
