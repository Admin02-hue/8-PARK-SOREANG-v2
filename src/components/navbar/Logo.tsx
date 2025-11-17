/**
 * Logo Component
 * ==============
 * Logo premium untuk 8 Park Soreang - bisa scale besar tanpa mempengaruhi navbar height
 */

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function Logo() {
  return (
    <Link href="/">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 cursor-pointer h-full overflow-hidden"
      >
        <Image
          src="/logo-navbar.png"
          alt="8 Park Soreang Logo"
          width={145}
          height={145}
          className="object-contain"
          priority
        />
      </motion.div>
    </Link>
  )
}
