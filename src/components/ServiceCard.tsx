import { motion } from 'motion/react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: any;
  variant?: 'primary' | 'tertiary' | 'secondary' | 'neutral';
  span?: string;
  capabilities?: string[];
  useCases?: string[];
  ctaLabel?: string;
  badge?: string;
  key?: any;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  variant = 'neutral',
  span = 'col-span-1',
  capabilities,
  useCases,
  ctaLabel,
  badge
}: ServiceCardProps) {
  const glowClass = variant === 'primary' ? 'chromatic-glow-primary' : variant === 'tertiary' ? 'chromatic-glow-tertiary' : '';
  const iconBg = variant === 'primary' ? 'bg-primary/10 text-primary' : variant === 'tertiary' ? 'bg-tertiary/10 text-tertiary' : variant === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant/50 text-on-surface-variant';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "glass-card rounded-xl p-8 flex flex-col justify-between group relative overflow-hidden",
        glowClass,
        span
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed-dim/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-1.5 bg-primary-fixed/50 text-on-primary-fixed px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-primary-fixed-dim/30">
            <Icon size={14} />
            {badge}
          </div>
        )}

        {!badge && (
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-6 shrink-0 transition-colors duration-300", iconBg)}>
            <Icon size={28} />
          </div>
        )}

        <h2 className={cn(
          "font-manrope font-bold text-on-surface mb-3",
          span.includes('col-span-1') ? "text-2xl" : "text-3xl"
        )}>
          {title}
        </h2>
        
        <p className="text-on-surface-variant mb-6 leading-relaxed">
          {description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {capabilities && (
            <div>
              <h4 className="text-[11px] font-bold text-on-surface mb-3 uppercase tracking-widest opacity-50">Capabilities</h4>
              <ul className="text-sm text-on-surface-variant space-y-2">
                {capabilities.map(cap => (
                  <li key={cap} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {useCases && (
            <div>
              <h4 className="text-[11px] font-bold text-on-surface mb-3 uppercase tracking-widest opacity-50">Use Cases</h4>
              <ul className="text-sm text-on-surface-variant space-y-2">
                {useCases.map(uc => (
                  <li key={uc} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto relative z-10 flex flex-wrap gap-2 mb-6">
        {!capabilities && !useCases && description.length < 150 && (
          <div className="flex flex-wrap gap-2">
             {variant === 'secondary' && ['Computer Vision', 'Kinematics', 'IoT Telemetry'].map(t => (
               <span key={t} className="bg-surface-container-high px-3 py-1 rounded-full text-[11px] font-semibold text-on-surface-variant">{t}</span>
             ))}
             {variant === 'neutral' && ['RTOS', 'Edge Compute', 'Signal Processing'].map(t => (
               <span key={t} className="bg-surface-container-high px-3 py-1 rounded-full text-[11px] font-semibold text-on-surface-variant">{t}</span>
             ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex justify-start">
        <button className={cn(
          "text-sm font-bold flex items-center gap-1.5 transition-all",
          variant === 'tertiary' ? "text-tertiary hover:underline" : "text-primary hover:gap-2"
        )}>
          {ctaLabel || 'Learn More'}
          <motion.span animate={{ x: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            →
          </motion.span>
        </button>
      </div>
    </motion.article>
  );
}
