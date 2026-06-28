import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavLinkProps {
  href: string;
  label: string;
  isActive?: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "text-sm font-semibold tracking-wide transition-all duration-300 hover:text-primary",
        isActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant"
      )}
    >
      {label}
    </a>
  );
}

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-[0_20px_40px_rgba(45,91,255,0.05)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-manrope font-bold text-primary tracking-tight italic">Scifer</span>
        </div>
        
        <nav className="hidden md:flex gap-8 items-center">
          <NavLink href="#" label="Services" isActive />
          <NavLink href="#" label="About" />
          <NavLink href="#" label="Projects" />
          <NavLink href="#" label="Contact" />
          <NavLink href="#" label="Blog" />
        </nav>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary hidden md:block"
        >
          Get Started
        </motion.button>
      </div>
    </header>
  );
}
