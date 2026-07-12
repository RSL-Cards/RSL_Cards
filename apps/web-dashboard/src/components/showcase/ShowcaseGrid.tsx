'use client';

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import Image from 'next/image';

interface ShowcaseCard {
  id: string;
  photos: string[];
  gradeCompany: string | null;
  gradeValue: string | null;
  cardName: string | null;
  cardYear: number | null;
  cardSetName: string | null;
  cardNumber: string | null;
  playerName: string | null;
  sport: string | null;
  variation: string | null;
}

interface ShowcaseGridProps {
  initialCards: ShowcaseCard[];
  handle: string;
  hasMoreInitial: boolean;
}

export default function ShowcaseGrid({ initialCards, handle, hasMoreInitial }: ShowcaseGridProps) {
  const [cards, setCards] = useState<ShowcaseCard[]>(initialCards);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    try {
      const nextPage = page + 1;
      // Normally we would use NEXT_PUBLIC_API_URL here.
      // But we can just use the absolute path if both are on the same domain or configure a relative fetch if possible.
      // Since web-dashboard hits the API via CORS, we need the API URL.
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/v1/showcase/${encodeURIComponent(handle)}/inventory?page=${nextPage}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch cards');
      
      const json = await res.json();
      if (json && json.data) {
        setCards((prev) => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(json.hasMore);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase();
    const searchableFields = [
      card.playerName,
      card.cardName,
      card.cardSetName,
      card.sport,
      card.gradeCompany,
      card.gradeValue,
      card.variation,
      card.cardYear?.toString()
    ].filter(Boolean).map(s => s?.toLowerCase());
    
    return !query || searchableFields.some(field => field?.includes(query));
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Available Inventory</h2>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search cards, players, sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No cards found</h3>
          <p className="text-gray-500">
            {searchQuery ? "Try adjusting your search criteria." : "This dealer hasn't added any public cards yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredCards.map((card) => {
            const hasGrade = card.gradeCompany && card.gradeCompany !== 'RAW';
            const imageUrl = card.photos && card.photos.length > 0 
              ? card.photos[0] 
              : 'https://placehold.co/400x560/e2e8f0/94a3b8?text=No+Image';

            return (
              <div 
                key={card.id} 
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer"
              >
                {/* Image Container with 2.5:3.5 standard trading card aspect ratio */}
                <div className="relative w-full aspect-[2.5/3.5] bg-gray-50 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={card.cardName || 'Card'} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Grading Badge overlay */}
                  {hasGrade && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-lg flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{card.gradeCompany}</span>
                      <span className="text-xs font-bold text-white">{card.gradeValue}</span>
                    </div>
                  )}
                </div>
                
                {/* Card Info Details */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {card.cardYear && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {card.cardYear}
                      </span>
                    )}
                    {card.sport && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {card.sport}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {card.playerName || card.cardName || 'Unknown Player'}
                  </h3>
                  
                  <p className="text-xs text-gray-500 font-medium line-clamp-1">
                    {card.cardSetName} {card.variation ? `- ${card.variation}` : ''}
                  </p>
                  
                  {card.cardNumber && (
                    <p className="text-[10px] text-gray-400 font-mono mt-auto pt-2">
                      #{card.cardNumber}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !searchQuery && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Loading...' : 'Load More Cards'}
          </button>
        </div>
      )}
    </div>
  );
}
