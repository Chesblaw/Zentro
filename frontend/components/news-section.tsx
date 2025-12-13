"use client";

import { Clock, User, ExternalLink, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";
import { NewsCarousel } from "@/components/news-carousel";
import { Web3NewsFallback } from "@/components/web3-news-fallback";
import { useState, useEffect, useMemo } from "react";
import { NewsApiService, transformNewsData } from "@/lib/api-services";
import { motion } from "framer-motion";

interface NewsData {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  url?: string;
  source?: string;
  wordCount?: number;
}

interface NewsSectionProps {
  newsData?: NewsData[];
  isLoading?: boolean;
  error?: string | null;
}

const categoryColorMap: Record<string, string> = {
  Crypto: "bg-blue-600",
  DeFi: "bg-purple-600",
  Web3: "bg-green-600",
  NFT: "bg-pink-600",
  AI: "bg-orange-500",
  default: "bg-primary",
};

function readingTimeFromWords(words = 200) {
  // simple estimate: 200 words/min
  return Math.max(1, Math.round(words / 200));
}

export function NewsSection({ newsData: propNewsData, isLoading: propIsLoading, error: propError }: NewsSectionProps) {
  const [newsData, setNewsData] = useState<NewsData[]>(propNewsData || []);
  const [isLoading, setIsLoading] = useState<boolean>(propIsLoading ?? true);
  const [error, setError] = useState<string | null>(propError || null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    if (propNewsData) {
      setNewsData(propNewsData);
      setIsLoading(propIsLoading ?? false);
      setError(propError || null);
      setIsUsingFallback(false);
      return;
    }

    const fetchNewsData = async () => {
      setIsLoading(true);
      setError(null);
      setIsUsingFallback(false);

      try {
        const apiData = await NewsApiService.getCryptoNews(12);
        if (!apiData || apiData.length === 0) {
          setIsUsingFallback(true);
          setNewsData([]);
        } else {
          const transformed = apiData.map(transformNewsData);
          setNewsData(transformed);
          setIsUsingFallback(false);
        }
      } catch (err) {
        console.error("Error fetching news data:", err);
        setError("Using AI-generated Web3 news");
        setIsUsingFallback(true);
        setNewsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsData();
    const interval = setInterval(fetchNewsData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [propNewsData, propIsLoading, propError]);

  const handleNewsClick = (news: NewsData) => {
    if (news.url && news.url !== "#") {
      window.open(news.url, "_blank", "noopener,noreferrer");
    } else {
      const searchQuery = encodeURIComponent(`${news.title} cryptocurrency news`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank", "noopener,noreferrer");
    }
  };

  const itemsToRender = useMemo(() => newsData.slice(0, 12), [newsData]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}
      className="bg-black/40 border border-white/10 rounded-xl p-4"
    >
      <h2 className="text-2xl font-bold mb-4 font-poppins text-white relative z-10 flex items-center gap-2">
        <span className="w-2 h-6 bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#db74cf] rounded-sm inline-block"></span>
        Latest News
        {isUsingFallback ? (
          <span className="text-sm text-purple-400 ml-2 font-normal flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            (AI Generated)
          </span>
        ) : !error ? (
          <span className="text-sm text-green-400 ml-2 font-normal flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            (Live)
          </span>
        ) : (
          <span className="text-sm text-yellow-400 ml-2 font-normal">
            (Cached)
          </span>
        )}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-black/50 border border-white/10 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5]/6 via-[#7c3aed]/6 to-[#db74cf]/6 animate-pulse pointer-events-none" />
              <div className="relative z-10">
                <div className="h-40 bg-white/6 rounded-lg mb-3 animate-pulse" />
                <div className="h-4 bg-white/6 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-white/6 rounded w-full mb-2 animate-pulse" />
                <div className="h-3 bg-white/6 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : isUsingFallback ? (
        <Web3NewsFallback />
      ) : (
        <NewsCarousel itemsPerView={3} autoplay pauseOnHover>
          {itemsToRender.map((news) => {
            const colorClass = categoryColorMap[news.category] || categoryColorMap.default;
            const words = news.wordCount ?? news.excerpt?.split(/\s+/).length ?? 200;
            const readTime = readingTimeFromWords(words);
            return (
              <div key={news.id} className="h-full">
                <div
                  onClick={() => handleNewsClick(news)}
                  className="bg-black/50 border border-white/10 rounded-lg overflow-hidden h-full flex flex-col hover:bg-black/60 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-48">
                    <Image
                      src={news.imageUrl || `https://picsum.photos/seed/news${news.id}/800/450`}
                      alt={news.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as any).src = 'https://picsum.photos/seed/crypto/800/450'; }}
                    />
                    <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded ${colorClass} text-white/95 shadow-[0_6px_18px_rgba(0,0,0,0.6)]`}>
                      {news.category}
                    </div>
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ExternalLink className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="text-xs text-white/90 bg-black/60 inline-block px-2 py-1 rounded">{news.source ?? "Unknown"}</div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#7c3aed] transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 flex-1 line-clamp-3">
                      {news.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{news.author ?? "Anon"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{news.date}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-white/60 text-[11px]">{readTime} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </NewsCarousel>
      )}
    </motion.div>
  );
}
