import React from 'react';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import GulArora from "@/components/GulArora";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Petals from "@/components/Petals";
import { readContent } from "@/lib/content";

// Force Next.js to render dynamically so updates show instantly
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();

  const {
    business,
    homepage,
    gulArora,
    team,
    categories,
    gallery,
    testimonials,
    contact,
  } = content;

  return (
    <div className="flex flex-col min-h-screen bg-charcoal text-ivory antialiased selection:bg-cherry-500 selection:text-white">
      {/* Falling Petals Canvas */}
      <Petals />

      {/* Floating Action Button */}
      <FloatingWhatsApp whatsappNumber={contact.whatsappNumber} />

      {/* Navigation header */}
      <Navbar businessName={business.name} whatsappNumber={contact.whatsappNumber} />

      {/* Page Sections */}
      <main className="flex-grow">
        <Hero
          heroImage={homepage.heroImage}
          headline={homepage.headline}
          punchline={homepage.punchline}
          whatsappNumber={contact.whatsappNumber}
          rating={business.rating}
          reviewsCount={business.reviewsCount}
        />
        
        <About
          aboutText={homepage.aboutText}
          aboutImage={homepage.aboutImage}
          established={business.established}
          rating={business.rating}
          reviewsCount={business.reviewsCount}
          instagramFollowers={business.instagramFollowers}
        />
        
        <GulArora founder={gulArora} team={team} />
        
        <Services categories={categories} whatsappNumber={contact.whatsappNumber} />
        
        <Portfolio gallery={gallery} />
        
        <Testimonials testimonials={testimonials} />
        
        <Contact contact={contact} />
      </main>

      {/* Footer */}
      <Footer businessName={business.name} />
    </div>
  );
}
