import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Upload, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-muted/50 dark:bg-muted/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-accent shadow-glow mb-8 animate-fade-in">
              <BookOpen className="w-10 h-10 text-accent-foreground" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              Data Science Department
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Resource Portal
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Access all your course materials, lecture notes, and study resources in one centralized platform designed for Data Science students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/auth">
                <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="gap-2 border-primary/30 text-foreground hover:bg-primary/10">
                  <GraduationCap className="w-5 h-5" />
                  Student Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
                className="group p-8 rounded-2xl bg-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary shadow-md group-hover:shadow-lg transition-shadow mb-6">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">3rd Semester Subjects</h2>
            <p className="text-muted-foreground">Core subjects covered in the curriculum</p>
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm font-medium text-foreground animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-primary rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-accent blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-accent blur-2xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Ready to Access Your Resources?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Login with your USN to start exploring course materials.
              </p>
              <Link to="/auth">
                <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Login Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">DS Resource Portal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Data Science Department. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
