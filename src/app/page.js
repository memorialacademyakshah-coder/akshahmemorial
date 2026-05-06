

import Navbar from '../../component/navbar'
import Hero from '../../component/hero'
import ServicesSection from '../../component/ServicesSection'

import StatsSection from '../../component/stateSection'
import TestimonialsSection from '../../component/TestimonialsSection'
import Footer from '../../component/Footer'
import StagesSection from '../../component/StagesSection'
import WorkShowcase from '../../component/WorkShowcase'
import TeamSection from '../../component/TeamSection'
import BrandSlider from '../../component/brandlogo'

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <ServicesSection />
      <StagesSection />
      <StatsSection />
      <WorkShowcase />
      <TestimonialsSection />
      <TeamSection />
      <BrandSlider />
      <Footer />

    </>
    

  )
}