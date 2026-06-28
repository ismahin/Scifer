import { motion } from 'motion/react';
import { 
  Bot, 
  Workflow, 
  Component,
  Microchip
} from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ServiceCard from './components/ServiceCard';

const SERVICES = [
  {
    title: "Agentic AI",
    description: "Deploy autonomous digital workers capable of complex reasoning, multi-step planning, and autonomous execution. Move beyond conversational interfaces to true systemic intelligence.",
    icon: Bot,
    variant: 'primary' as const,
    span: 'md:col-span-8',
    badge: 'Flagship',
    capabilities: ['Multi-agent coordination', 'Long-horizon planning'],
    useCases: ['Enterprise resource allocation', 'Predictive market modeling'],
    ctaLabel: 'Explore Agentic Systems'
  },
  {
    title: "Automation",
    description: "Intelligent workflow orchestration. Eliminate friction from your operational pipelines with hyper-automated integrations.",
    icon: Workflow,
    variant: 'tertiary' as const,
    span: 'md:col-span-4',
    ctaLabel: 'View Workflows'
  },
  {
    title: "Robotics",
    description: "Kinematic systems designed for precision and resilience. We bridge the gap between digital intelligence and physical execution.",
    icon: Component,
    variant: 'secondary' as const,
    span: 'md:col-span-6',
    ctaLabel: 'Discover Robotics'
  },
  {
    title: "Embedded Systems",
    description: "Bare-metal engineering for constrained environments. High-performance, low-latency firmware and hardware abstraction.",
    icon: Microchip,
    variant: 'neutral' as const,
    span: 'md:col-span-6',
    ctaLabel: 'Explore Embedded'
  }
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="hero-gradient overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="hero-mesh" />
          
          {/* Animated Blobs */}
          <motion.div 
            animate={{ 
              x: [0, 50, 0], 
              y: [0, -30, 0],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" 
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0], 
              y: [0, 60, 0],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none z-0" 
          />

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-12"
            >
              <img 
                alt="Scifer Logo" 
                className="h-20 w-auto object-contain drop-shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida/ADBb0uiVQv_hyvH57CsKXPSK2AOpyWd-FRnkLIbl5wzxUpMBAgkOvJSjfBNmpcWcHd3rJOEXOlfKYI7VJRUnN_IbIrP9X7dPadlYOe14Aq76qChT5euPAnQnUR8scAWyRG9X-I5DxUMPoH7UOn15sAB9ejTluBcDD5pqRAytyFTkCYzOLpmmP9CpcKn_kO4PU9ev-Qr51Y098vtd80w99hKXoS9T_-w4u7QNsHGOh_vBK0KJFq4OREr7xcdbgHNPxasY9M266dEfXxhYF9E"
              />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-manrope text-5xl md:text-7xl font-extrabold text-on-surface mb-8 max-w-5xl mx-auto tracking-tight leading-[1.1]"
            >
              Future-Ready Tech Solutions for <span className="gradient-text">AI, Automation & Digital Innovation</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-on-surface-variant mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Scifer builds intelligent technology solutions across Agentic AI, automation, robotics, embedded systems, web, mobile, blockchain, and custom software.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Explore Solutions
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                Contact Us
              </motion.button>
            </motion.div>
          </div>
          
          {/* Wave Lines */}
          <div className="absolute bottom-10 left-0 w-full overflow-hidden opacity-20 pointer-events-none">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="wave-line mb-4" 
            />
            <motion.div 
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="wave-line opacity-5" 
            />
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-manrope text-4xl md:text-5xl font-bold text-on-surface mb-4"
              >
                Core Capabilities
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-on-surface-variant max-w-2xl mx-auto"
              >
                Comprehensive technology solutions designed to accelerate your digital transformation journey.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {SERVICES.map((service, index) => (
                <ServiceCard 
                  key={index} 
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  variant={service.variant}
                  span={service.span}
                  badge={service.badge}
                  capabilities={service.capabilities}
                  useCases={service.useCases}
                  ctaLabel={service.ctaLabel}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Additional Branding Section (From Page 2) */}
        <section className="py-32 bg-white flex items-center justify-center border-t border-surface-container">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
             <motion.h2 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="font-manrope text-5xl md:text-8xl font-black text-on-surface leading-tight"
              >
                Pioneering <span className="gradient-text">Tomorrow's</span> Architecture
              </motion.h2>
              <p className="mt-8 text-on-surface-variant text-lg max-w-3xl mx-auto">
                We engineer high-frontier technology solutions. From autonomous agents to distributed ledgers, our services are built for luminous clarity, speed, and global trust.
              </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
