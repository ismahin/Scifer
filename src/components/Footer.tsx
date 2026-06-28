import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-12 border-t border-outline-variant/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-manrope font-bold text-primary block mb-4 italic">Scifer</span>
            <p className="text-on-surface-variant max-w-sm mb-6 leading-relaxed">
              Building the intelligent future through advanced engineering and design.
            </p>
            <p className="text-on-surface-variant text-sm opacity-70">
              © 2024 Scifer Technology. All rights reserved.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6 justify-start md:justify-end items-end">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
