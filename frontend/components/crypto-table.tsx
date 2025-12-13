"use client";

import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { CryptoApiService, transformCryptoData } from "@/lib/api-services";
import { motion } from "framer-motion";

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  icon?: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
}

interface CryptoTableProps {
  formatNumberAction: (num: number) => string;
}

type SortKey = "id" | "price" | "marketCap" | "change24h" | "name";

export function CryptoTable({ formatNumberAction }: CryptoTableProps) {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDesc, setSortDesc] = useState<boolean>(false);

  useEffect(() => {
    const fetchCryptoData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiData = await CryptoApiService.getTopCryptocurrencies(50);
        const transformedData: CryptoData[] = apiData.map(transformCryptoData);
        setCryptoData(transformedData);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
        setError("Using cached/mock data");
        // fallback sample
        setCryptoData((prev) =>
          prev.length ? prev : [
            {
              id: 1,
              name: "Bitcoin",
              symbol: "BTC",
              icon: "/crypto-icons/btc.png",
              price: 84127.12,
              change1h: 0.0,
              change24h: 3.8,
              change7d: -2.9,
              volume24h: 29483607871,
              marketCap: 1669278945761,
              sparkline: [65, 59, 80, 81, 56, 55, 40, 60, 70, 45, 50, 55, 70, 75, 65],
            },
            {
              id: 2,
              name: "Ethereum",
              symbol: "ETH",
              icon: "/crypto-icons/eth.png",
              price: 1913.53,
              change1h: -0.3,
              change24h: 2.5,
              change7d: -10.5,
              volume24h: 12779703866,
              marketCap: 230861090232,
              sparkline: [70, 65, 60, 65, 55, 40, 45, 60, 75, 60, 50, 55, 65, 70, 60],
            },
          ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };

  const sortedFiltered = useMemo(() => {
    let list = [...cryptoData];
    if (showFavOnly) list = list.filter((c) => favorites.includes(c.id));
    list.sort((a, b) => {
      const dir = sortDesc ? -1 : 1;
      switch (sortKey) {
        case "price": return dir * (a.price - b.price);
        case "marketCap": return dir * (a.marketCap - b.marketCap);
        case "change24h": return dir * (a.change24h - b.change24h);
        case "name": return dir * a.name.localeCompare(b.name);
        case "id":
        default: return dir * (a.id - b.id);
      }
    });
    return list;
  }, [cryptoData, favorites, showFavOnly, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDesc(!sortDesc);
    else { setSortKey(key); setSortDesc(false); }
  };

  const renderSparkline = (data: number[], isPositive: boolean) => {
    const height = 36;
    const width = 120;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    const stroke = isPositive ? "url(#gradGreen)" : "url(#gradRed)";

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="gPos" x1="0" x2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="gNeg" x1="0" x2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))" }}
        />
      </svg>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#db74cf] rounded-sm inline-block"></span>
          Cryptocurrency Market Cap
          {error && <span className="text-sm text-yellow-400 ml-2 font-normal">({error})</span>}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowFavOnly(!showFavOnly); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${showFavOnly ? "bg-gradient-to-r from-[#4f46e5]/10 to-[#db74cf]/10 border-transparent" : "bg-white/3 border-white/6"} text-white text-sm`}
          >
            <Star className="w-4 h-4" />
            Favorites
          </button>

          <div className="flex items-center gap-2 text-sm text-white/80">
            <button onClick={() => toggleSort("price")} className="px-3 py-1 rounded-lg hover:bg-white/5 transition">Price</button>
            <button onClick={() => toggleSort("marketCap")} className="px-3 py-1 rounded-lg hover:bg-white/5 transition">Market Cap</button>
            <button onClick={() => toggleSort("change24h")} className="px-3 py-1 rounded-lg hover:bg-white/5 transition">24h%</button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-white/10 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>

          <table className="w-full">
            <thead className="sticky top-0 bg-black/90 backdrop-blur-md z-10">
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 pl-2 w-10"></th>
                <th className="pb-3 pl-2 w-10">#</th>
                <th className="pb-3">Coin</th>
                <th className="pb-3 text-right cursor-pointer" onClick={() => toggleSort("price")}>Price</th>
                <th className="pb-3 text-right hidden sm:table-cell">1h</th>
                <th className="pb-3 text-right cursor-pointer" onClick={() => toggleSort("change24h")}>24h</th>
                <th className="pb-3 text-right">7d</th>
                <th className="pb-3 text-right">24h Volume</th>
                <th className="pb-3 text-right cursor-pointer" onClick={() => toggleSort("marketCap")}>Market Cap</th>
                <th className="pb-3 text-right pr-4">Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.map((crypto) => (
                <motion.tr
                  key={crypto.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="border-b border-white/6 hover:bg-gradient-to-r hover:from-[#4f46e5]/8 hover:to-[#db74cf]/8 transition-all duration-200"
                >
                  <td className="py-4 pl-2">
                    <button onClick={() => toggleFavorite(crypto.id)} className="focus:outline-none p-1 rounded">
                      <Star size={16}
                        className={favorites.includes(crypto.id) ? "text-yellow-400 fill-yellow-400" : "text-white/40 hover:text-yellow-400 transition-colors"} />
                    </button>
                  </td>

                  <td className="py-4 pl-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${crypto.id <= 3 ? (crypto.id === 1 ? "bg-yellow-400/10 text-yellow-300" : "bg-white/6 text-white") : "bg-white/4 text-white/80"}`}>
                      {crypto.id}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#4f46e5]/10 to-[#db74cf]/10 p-[2px] flex items-center justify-center">
                        {crypto.icon ? (
                          <Image src={crypto.icon} alt={crypto.name} width={28} height={28} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white/90 bg-white/3">{crypto.symbol.slice(0,2)}</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{crypto.name}</div>
                        <div className="text-xs text-white/50">{crypto.symbol}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 text-right">
                    <span
                      className={`px-2 py-1 rounded-md ${
                        crypto.change1h >= 0
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {crypto.change1h >= 0 ? "+" : ""}
                      {crypto.change1h.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-4 text-right hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-md text-xs ${crypto.change1h >= 0 ? "bg-emerald-600/10 text-emerald-300" : "bg-rose-600/10 text-rose-300"}`}>
                      {crypto.change1h >= 0 ? "+" : ""}{crypto.change1h.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs ${crypto.change24h >= 0 ? "bg-emerald-600/10 text-emerald-300" : "bg-rose-600/10 text-rose-300"}`}>
                      {crypto.change24h >= 0 ? "+" : ""}{crypto.change24h.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs ${crypto.change7d >= 0 ? "bg-emerald-600/10 text-emerald-300" : "bg-rose-600/10 text-rose-300"}`}>
                      {crypto.change7d >= 0 ? "+" : ""}{crypto.change7d.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-4 text-right font-mono">
                    ${formatNumberAction(crypto.volume24h)}
                  </td>

                  <td className="py-4 text-right font-mono">
                    ${formatNumberAction(crypto.marketCap)}
                  </td>

                  <td className="py-4 text-right pr-4">
                    <div className="flex justify-end">
                      {renderSparkline(crypto.sparkline, crypto.change7d >= 0)}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
