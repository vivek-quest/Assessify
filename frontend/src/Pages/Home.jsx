import React from 'react'
import manWithLaptop from '../assets/Images/manWithLaptop.png'
import AssessifyLogo from '../assets/Images/Assessify.png'
import '../App.css'
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import HeroSection from '../Components/HeroSection';
import FeatureCard from '../Components/FeatureCard';
import { Brain, Building2, Users, Sparkles, ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Transform Your Hiring Process
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Streamline your interviews with AI-powered assessments
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-red-600" />}
            title="AI-Powered Interviews"
            description="Conduct smart interviews powered by advanced AI technology"
          />
          <FeatureCard
            icon={<Building2 className="w-6 h-6 text-red-600" />}
            title="Institute Dashboard"
            description="Comprehensive tools for managing assessments and candidates"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6 text-red-600" />}
            title="Candidate Management"
            description="Track and evaluate candidates efficiently"
          />
        </div>
      </section>

      <section className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of institutions transforming their hiring process</p>
          <Link to={'/login'}>
            <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5 dancing-arrow" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home;