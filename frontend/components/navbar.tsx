"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Layers, LayoutDashboard, Bell, Search, UserCircle } from "lucide-react";
import WalletButton from "./wallet-button";
import { motion } from "framer-motion";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/6"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 -ml-2">
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#db74cf] p-[2px]">
                <div className="bg-black/90 w-full h-full rounded-lg flex items-center justify-center">
                  {/* Replace with Image src when ready */}
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
              </div>
            </Link>

            {/* Brand name - subtle */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-white font-semibold text-sm">Zentro</span>
              <span className="text-xs text-white/40">Crypto Dashboard</span>
            </div>
          </div>

          {/* Search - desktop */}
          <div className="hidden md:flex items-center gap-3 ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search markets, news or symbols..."
                className="w-64 bg-white/5 placeholder:text-white/40 text-white text-sm rounded-xl pl-10 pr-4 py-2 border border-white/6 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]/30 transition"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 ml-auto mr-4">
            <Link
              href="/news"
              className="px-3 py-2 text-sm font-medium text-white hover:text-white transition-all flex items-center gap-2 group relative"
            >
              <Layers className="w-4 h-4 text-[#7c3aed] group-hover:text-white transition-colors" />
              <span className="group-hover:translate-x-0.5 transition-transform">Explore</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db74cf] transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 shadow-[0_0_16px_#db74cf40]"></span>
            </Link>

            <Link
              href="/dashboard"
              className="px-3 py-2 text-sm font-medium text-white hover:text-white transition-all flex items-center gap-2 group relative"
            >
              <LayoutDashboard className="w-4 h-4 text-[#4f46e5] group-hover:text-white transition-colors" />
              <span className="group-hover:translate-x-0.5 transition-transform">Dashboard</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db74cf] transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 shadow-[0_0_16px_#db74cf40]"></span>
            </Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              aria-label="notifications"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-white/80" />
              {/* small dot */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-black/80" />
            </button>

            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/6 hover:bg-white/6 transition">
              <UserCircle className="w-5 h-5 text-white/90" />
              <span className="text-sm text-white/90">Nat</span>
            </button>

            <WalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/6 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <div className="flex items-center gap-3 p-2">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#db74cf] p-[2px]">
                <div className="bg-black/90 w-full h-full rounded-sm flex items-center justify-center text-white font-bold">Z</div>
              </div>
              <div>
                <div className="text-white font-semibold">Zentro</div>
                <div className="text-xs text-white/40">Crypto Dashboard</div>
              </div>
            </div>

            <Link
              href="/news"
              className="flex items-center gap-3 p-3 rounded-lg text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <Layers className="w-5 h-5 text-[#7c3aed]" />
              <span>Explore</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-3 rounded-lg text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5 text-[#4f46e5]" />
              <span>Dashboard</span>
            </Link>

            <div className="w-full mt-2">
              <WalletButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
