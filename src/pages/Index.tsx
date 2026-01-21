import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Upload, Users, ArrowRight, CheckCircle2, ChevronDown, Smartphone, Sparkles } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Lazy load the 3D scene for better performance
const HeroScene = lazy(() => import('@/components/3d/HeroScene'));

const Index = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0118] scroll-smooth">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-[#0a0118] pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />
        
        {/* 3D Scene */}
        <Suspense fallback={
          <div className="absolute inset-0 bg-[#0a0118]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
          </div>
        }>
          <HeroScene />
        </Suspense>

        {/* Graffiti-style background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5] overflow-hidden">
          <div className="relative">
            <span 
              className="text-[12vw] font-black text-transparent tracking-wider select-none opacity-30"
              style={{
                WebkitTextStroke: '2px rgba(147, 51, 234, 0.5)',
                fontFamily: 'Impact, sans-serif',
                letterSpacing: '0.1em',
                transform: 'rotate(-5deg)',
              }}
            >
              DATA SCIENCE
            </span>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none z-[15]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-400/60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 py-20 lg:py-32 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo with glow */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-900/50 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_rgba(147,51,234,0.5)] mb-8 animate-fade-in">
              <BookOpen className="w-10 h-10 text-purple-300" />
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up tracking-tight">
              Data Science Department
              <span className="block mt-2 bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(167,139,250,0.5)]">
                Resource Portal
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-purple-200/80 mb-12 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Access all your course materials, lecture notes, and study resources in one centralized platform designed for Data Science students.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300 border-0 px-8 py-6 text-lg rounded-full"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 bg-white/5 backdrop-blur-xl border-purple-500/30 text-purple-200 hover:bg-white/10 hover:text-white hover:border-purple-400/50 px-8 py-6 text-lg rounded-full transition-all duration-300"
                >
                  <GraduationCap className="w-5 h-5" />
                  Student Login
                </Button>
              </Link>
            </div>

            {/* Scroll indicator */}
            <button 
              onClick={() => scrollToSection('features')}
              className="mt-16 animate-bounce cursor-pointer mx-auto flex flex-col items-center text-purple-400/60 hover:text-purple-300 transition-colors"
            >
              <span className="text-sm mb-1">Explore</span>
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Decorative stars */}
        <div className="absolute bottom-20 right-10 z-20">
          <Sparkles className="w-8 h-8 text-purple-400/50 animate-pulse" />
        </div>
        <div className="absolute top-40 left-10 z-20">
          <Sparkles className="w-6 h-6 text-violet-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0a0118] relative scroll-mt-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-purple-300/70 max-w-2xl mx-auto text-lg">
              A comprehensive platform for accessing and managing educational resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: 'Organized Materials',
                description: 'Access study materials organized by semester and subject for easy navigation.',
              },
              {
                icon: Upload,
                title: 'Admin Uploads',
                description: 'Administrators can easily upload and manage course resources.',
              },
              {
                icon: Users,
                title: 'Role-Based Access',
                description: 'Secure login system with separate access for students and administrators.',
              },
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-[0_0_30px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-all duration-300 mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-purple-300/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section id="subjects" className="py-24 bg-gradient-to-b from-[#0a0118] to-purple-950/20 relative scroll-mt-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">3rd Semester Subjects</h2>
            <p className="text-purple-300/70 text-lg">Core subjects covered in the curriculum</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              'Mathematics',
              'Digital Design & Computer Organization',
              'Data Structures & Algorithms',
              'R-Language',
              'Operating Systems',
            ].map((subject, index) => (
              <div 
                key={subject}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-purple-500/20 text-sm font-medium text-purple-200 hover:bg-white/10 hover:border-purple-400/40 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                {subject}
              </div>
            ))}
          </div>

          {/* Add to Home Screen Guide */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-purple-500/20 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Add to Home Screen</h3>
              </div>
              <p className="text-purple-300/70 mb-6">
                Install this app on your device for quick access:
              </p>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-purple-500/10">
                  <span className="font-semibold text-purple-400 min-w-16">iOS:</span>
                  <span className="text-purple-200/80">Tap the Share button → "Add to Home Screen"</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-purple-500/10">
                  <span className="font-semibold text-purple-400 min-w-16">Android:</span>
                  <span className="text-purple-200/80">Tap Menu (⋮) → "Add to Home Screen" or "Install App"</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-purple-500/10">
                  <span className="font-semibold text-purple-400 min-w-16">Desktop:</span>
                  <span className="text-purple-200/80">Click the install icon in the address bar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-[#0a0118] relative scroll-mt-4 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-xl rounded-[2rem] p-12 relative overflow-hidden border border-purple-500/20">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet-500 blur-[80px]" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Access Your Resources?
              </h2>
              <p className="text-purple-200/80 mb-8 text-lg">
                Login with your USN to start exploring course materials.
              </p>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all duration-300 border-0 px-8 py-6 text-lg rounded-full"
                >
                  Login Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-purple-500/10 bg-[#0a0118]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-900/50 border border-purple-500/20">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <span className="font-semibold text-white">DS Resource Portal</span>
            </div>
            <p className="text-sm text-purple-300/50">
              © {new Date().getFullYear()} Data Science Department. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
