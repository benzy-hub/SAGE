import {
  Header,
  Hero,
  Features,
  LetsMakeItHappen,
  CaseStudies,
  HowItWorks,
  Testimonials,
  Contact,
  Footer,
  Roles,
  PageLoader,
} from "@/components/landing";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <PageLoader />
      <Header />
      <main>
        <Hero />
        <Features />
        <LetsMakeItHappen />
        <CaseStudies />
        <HowItWorks />
        <Roles />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
