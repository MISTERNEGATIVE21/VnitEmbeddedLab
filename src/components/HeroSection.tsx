'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Microchip, 
  Wrench, 
  BarChart3, 
  ArrowRight,
  ExternalLink,
  MapPin,
  Building2
} from 'lucide-react';

const categories = [
  { name: 'Development Boards', count: 'Arduino, ESP32, Raspberry Pi', icon: Cpu },
  { name: 'Sensors', count: 'Temperature, Motion, Distance', icon: Microchip },
  { name: 'Test Equipment', count: 'Oscilloscopes, Multimeters', icon: BarChart3 },
  { name: 'Components', count: 'Resistors, Capacitors, ICs', icon: Wrench },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-slate-100 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-slate-950/20" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Institution Badge */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <a 
              href="https://vnit.ac.in/engineering/cvlsi/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Centre for VLSI & Embedded Systems
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <Badge variant="outline" className="px-4 py-1.5 text-sm border-orange-200 bg-orange-50 dark:bg-orange-950/50 dark:border-orange-800">
              <MapPin className="h-3.5 w-3.5 mr-2 text-orange-500" />
              Visvesvaraya National Institute of Technology, Nagpur
            </Badge>
          </div>

          {/* Main Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-orange-500">VNIT</span> Embedded Systems Lab
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Materials tracking and inventory management for the Embedded Systems Laboratory at VNIT Nagpur.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#inventory">
                <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600">
                  <Microchip className="h-5 w-5" />
                  View Inventory
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/#dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="group relative bg-card/50 backdrop-blur-sm border rounded-xl p-4 hover:bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10 group-hover:from-orange-500/20 group-hover:to-amber-500/20 transition-colors">
                    <category.icon className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="border-t bg-background/50">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lab Info */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">About the Lab</h3>
                <p className="text-sm text-muted-foreground">
                  The Embedded Systems Lab at VNIT Nagpur provides facilities for hardware design, 
                  firmware development, and system integration projects.
                </p>
              </div>
              
              {/* Access Info */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">Access Control</h3>
                <p className="text-sm text-muted-foreground">
                  Admin has full access to all features. Teachers can manage inventory and transactions. 
                  Students can view inventory and dashboard.
                </p>
              </div>
              
              {/* Contact */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-sm text-muted-foreground">
                  Centre for VLSI & Embedded Systems<br />
                  VNIT Nagpur, Maharashtra 440010<br />
                  <a 
                    href="https://vnit.ac.in/engineering/cvlsi/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    vnit.ac.in/engineering/cvlsi
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
