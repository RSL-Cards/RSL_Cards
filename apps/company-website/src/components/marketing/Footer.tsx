'use client'

import { motion } from 'framer-motion'
import { Twitter, Instagram, Youtube, Video } from 'lucide-react'

const footerLinks = {
  products: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'AI Insights', href: '#ai-insights' },
    { name: 'Mobile App', href: '#mobile' },
    { name: 'Chrome Extension', href: '#chrome' },
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Blog', href: '#blog' },
    { name: 'Careers', href: '#careers' },
    { name: 'Press', href: '#press' },
    { name: 'Contact', href: '#contact' },
  ],
  resources: [
    { name: 'Documentation', href: '#docs' },
    { name: 'API', href: '#api' },
    { name: 'Help Center', href: '#help' },
    { name: 'Status', href: '#status' },
  ],
  legal: [
    { name: 'Privacy', href: '#privacy' },
    { name: 'Terms', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
  ]
}

const socialLinks = [
  { icon: Twitter, href: '#twitter', label: 'Twitter/X' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Youtube, href: '#youtube', label: 'YouTube' },
  { icon: Video, href: '#tiktok', label: 'TikTok' },
]

export default function Footer() {
  return (
    <footer className="bg-rsl-black border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo + Tagline */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="border border-white rounded p-2">
                <div className="flex items-center gap-1">
                  <span className="text-white font-black italic text-xl">RSL</span>
                  <span className="text-rsl-red font-bold text-xs tracking-widest">CARDS</span>
                </div>
              </div>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              The Operating System for Sports Card Dealers
            </p>
            <p className="text-text-muted text-xs">
              Run. Sell. Log.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-text-secondary hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-text-secondary hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-text-secondary hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-text-secondary hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-text-muted text-sm">
              © 2026 Reddy Sherrer Lane LLC. Run. Sell. Log.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-text-secondary hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
