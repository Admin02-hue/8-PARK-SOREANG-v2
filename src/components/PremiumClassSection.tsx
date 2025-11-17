'use client'

'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { CheckCircle2, Zap, Crown, Globe } from 'lucide-react'

export function PremiumClassSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Parallax effect untuk background
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  // Fade + Slide animation untuk elemen masuk
  const fadeSlideVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  }

  // Scale-up animation untuk detail card
  const scaleUpVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  }

  // Hover effect untuk card
  const cardHoverVariants = {
    initial: { y: 0 },
    hover: { y: -8 },
  }

  const premiumFeatures = [
    {
      icon: Crown,
      title: 'Standar Internasional',
      description: 'Desain dan konstruksi mengikuti standar kelas dunia',
    },
    {
      icon: Zap,
      title: 'Smart Home Ready',
      description: 'Infrastruktur siap untuk teknologi smart home modern',
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Bergabung dengan komunitas investor internasional',
    },
    {
      icon: CheckCircle2,
      title: 'Sertifikasi Lengkap',
      description: 'Seluruh fasilitas bersertifikat dan teruji',
    },
  ]

  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-slate-900 via-slate-800 to-slate-900"
    >
      {/* PARALLAX BACKGROUND */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        {/* Gradient overlay dengan mesh pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(219,179,112,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_50%,rgba(34,197,94,0.1)_0%,transparent_50%)]" />

        {/* Animated background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      </motion.div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        {/* Header dengan fade + slide */}
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            custom={0}
            variants={fadeSlideVariants}
            className="inline-block"
          >
            <span className="inline-block px-4 py-2 mb-6 rounded-full bg-gold-500/20 text-gold-400 text-sm font-semibold border border-gold-500/30">
              Kelas Internasional
            </span>
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeSlideVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Investasi{' '}
            <span className="bg-linear-to-r from-gold-400 via-gold-300 to-emerald-400 bg-clip-text text-transparent">
              Premium
            </span>
            {' '}untuk Masa Depan
          </motion.h2>

          <motion.p
            custom={2}
            variants={fadeSlideVariants}
            className="text-xl text-slate-300 max-w-2xl mx-auto"
          >
            Rasakan pengalaman hunian dengan standar internasional, infrastruktur
            canggih, dan investasi yang menguntungkan.
          </motion.p>
        </motion.div>

        {/* Features grid dengan scale-up animation */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                custom={index}
                variants={scaleUpVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              >
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  className="group relative h-full p-6 rounded-xl border border-gold-500/20 bg-linear-to-br from-gold-500/5 via-slate-800/50 to-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-gold-400/50 hover:shadow-[0_0_30px_rgba(219,179,112,0.2)]"
                >
                  {/* Icon dengan glow effect */}
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-linear-to-br from-gold-500/20 to-emerald-500/20 group-hover:from-gold-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                    <Icon className="w-6 h-6 text-gold-400 group-hover:text-emerald-400 transition-colors" />
                  </div>

                  {/* Text content */}
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative line */}
                  <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Highlight stats dengan kombinasi semua animasi */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {[
            { value: '98%', label: 'Kepuasan Investor' },
            { value: '5.0★', label: 'Rating Berkualitas' },
            { value: '10yr+', label: 'Track Record' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: (i: number) => ({
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: i * 0.15,
                    duration: 0.6,
                    ease: 'easeOut',
                  },
                }),
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative p-8 rounded-2xl border border-gold-500/30 bg-linear-to-br from-gold-500/10 via-transparent to-emerald-500/10 backdrop-blur-sm hover:border-gold-400/50 transition-all duration-300 group"
            >
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-gold-500/0 via-gold-500/0 to-emerald-500/0 group-hover:from-gold-500/5 group-hover:via-gold-500/5 group-hover:to-emerald-500/5 transition-all duration-300" />

              <div className="relative text-center">
                <p className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gold-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-20 h-20 border-2 border-gold-500/20 rounded-lg opacity-30 hidden lg:block" />
      <div className="absolute bottom-32 left-10 w-32 h-32 border-2 border-emerald-500/20 rounded-full opacity-20 hidden lg:block" />
    </div>
  )
}
