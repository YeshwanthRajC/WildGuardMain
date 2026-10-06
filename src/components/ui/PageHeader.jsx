import React from 'react';
import { motion } from 'framer-motion';

/**
 * Gradient hero banner used at the top of each page.
 * Props: icon (lucide component), title, description, stats [{label, value}], children (actions).
 */
const PageHeader = ({ icon: Icon, title, description, stats = [], children }) => (
  <motion.header
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="relative mb-6 overflow-hidden rounded-2xl border bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-700 p-6 text-white shadow-lg"
  >
    {/* Decorative blobs */}
    <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

    <div className="relative flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Icon className="h-7 w-7" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-xl text-sm text-emerald-100/90">{description}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>

    {stats.length > 0 && (
      <div className="relative mt-5 flex flex-wrap gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/15 backdrop-blur">
            <div className="text-xl font-semibold leading-none">{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-emerald-100/80">{s.label}</div>
          </div>
        ))}
      </div>
    )}
  </motion.header>
);

export default PageHeader;
