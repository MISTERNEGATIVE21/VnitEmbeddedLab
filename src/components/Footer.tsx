'use client';

import Link from 'next/link';
import { Cpu, Mail, MapPin, Phone, ExternalLink, Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">VNIT Embedded Lab</span>
                <p className="text-xs text-muted-foreground">Materials Tracking System</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Visvesvaraya National Institute of Technology, Nagpur
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/#inventory" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Inventory
              </Link>
              <Link href="/#transactions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Transactions
              </Link>
              <Link href="/#dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>

          {/* VNIT Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">VNIT Links</h3>
            <nav className="flex flex-col space-y-2">
              <a 
                href="https://vnit.ac.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                VNIT Official Website
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://vnit.ac.in/engineering/cvlsi/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Centre for VLSI & Embedded Systems
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://vnit.ac.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Electronics Department
                <ExternalLink className="h-3 w-3" />
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <nav className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                VNIT Nagpur
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                South Ambazari Road, Nagpur 440010
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91-712-222-3341
              </span>
            </nav>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Visvesvaraya National Institute of Technology, Nagpur. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Materials Tracking System</span>
            <span className="text-muted-foreground/50">|</span>
            <span>Centre for VLSI & Embedded Systems</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
