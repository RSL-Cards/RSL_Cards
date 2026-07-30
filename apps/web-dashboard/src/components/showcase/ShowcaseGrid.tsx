/* eslint-disable @next/next/no-img-element */
'use client';


import { useState } from 'react';
import { Loader2, Search, Sparkles, Filter, X, ExternalLink, Mail, Tag, Award, Layers, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { API_BASE_URL } from '@/config/api';

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
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedGradeType, setSelectedGradeType] = useState<'all' | 'graded' | 'raw'>('all');
  const [selectedCard, setSelectedCard] = useState<ShowcaseCard | null>(null);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    try {
      const nextPage = page + 1;
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

  // Filter cards by search query, sport, and grade filter
  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase().trim();
    
    // Sport filter
    if (selectedSport !== 'all') {
      const cardSport = (card.sport || '').toLowerCase();
      if (cardSport !== selectedSport.toLowerCase()) return false;
    }

    // Grade filter
    const isGraded = card.gradeCompany && card.gradeCompany.toUpperCase() !== 'RAW';
    if (selectedGradeType === 'graded' && !isGraded) return false;
    if (selectedGradeType === 'raw' && isGraded) return false;

    // Search query filter
    if (query) {
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

      return searchableFields.some(field => field?.includes(query));
    }

    return true;
  });

  // Extract unique sports from cards for dynamic filter pills
  const sports = Array.from(new Set(cards.map(c => c.sport).filter(Boolean))) as string[];

  // Helper function for grade badge styling
  const getGradeBadgeStyle = (company: string | null, grade: string | null) => {
    if (!company || company.toUpperCase() === 'RAW') return null;
    const c = company.toUpperCase();
    
    if (c === 'PSA') {
      return {
        bg: 'bg-red-950/90 border-red-600/60 text-red-100',
        label: 'PSA',
        valClass: 'text-[#FF3344] font-black',
      };
    }
    if (c === 'BGS') {
      return {
        bg: 'bg-amber-950/90 border-amber-500/60 text-amber-100',
        label: 'BGS',
        valClass: 'text-[#FFD700] font-black',
      };
    }
    if (c === 'SGC') {
      return {
        bg: 'bg-zinc-950/90 border-zinc-500/60 text-zinc-100',
        label: 'SGC',
        valClass: 'text-white font-black',
      };
    }
    return {
      bg: 'bg-black/80 border-white/20 text-zinc-300',
      label: c,
      valClass: 'text-white font-bold',
    };
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#262626] bg-[#09090B] p-5 shadow-lg">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E8001C]" />
              Showcase Inventory
            </h2>
            <span className="rounded-full bg-[#18181B] border border-[#27272A] px-2.5 py-0.5 text-xs font-mono font-bold text-zinc-400">
              {filteredCards.length} {filteredCards.length === 1 ? 'Card' : 'Cards'}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search player, year, set, PSA grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-[#27272A] rounded-2xl leading-5 bg-[#141417] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E8001C] focus:ring-1 focus:ring-[#E8001C] text-sm transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#27272A] pt-4">
          
          {/* Sports Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSport('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedSport === 'all'
                  ? 'bg-[#E8001C] text-white shadow-md shadow-red-950/40'
                  : 'bg-[#141417] border border-[#27272A] text-zinc-400 hover:bg-[#1C1C20] hover:text-white'
              }`}
            >
              All Sports
            </button>
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedSport.toLowerCase() === sport.toLowerCase()
                    ? 'bg-[#E8001C] text-white shadow-md shadow-red-950/40'
                    : 'bg-[#141417] border border-[#27272A] text-zinc-400 hover:bg-[#1C1C20] hover:text-white'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Grade Type Filter (All / Graded / Raw) */}
          <div className="flex items-center gap-1 rounded-xl bg-[#141417] border border-[#27272A] p-1">
            <button
              onClick={() => setSelectedGradeType('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                selectedGradeType === 'all'
                  ? 'bg-[#27272A] text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedGradeType('graded')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                selectedGradeType === 'graded'
                  ? 'bg-[#E8001C]/20 text-[#E8001C] font-bold border border-[#E8001C]/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Graded Only
            </button>
            <button
              onClick={() => setSelectedGradeType('raw')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                selectedGradeType === 'raw'
                  ? 'bg-[#27272A] text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Raw
            </button>
          </div>

        </div>

      </div>

      {/* Showcase Grid Layout */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-[#09090B] rounded-3xl border border-[#262626] shadow-sm text-center">
          <div className="w-16 h-16 bg-[#141417] rounded-2xl flex items-center justify-center mb-4 border border-[#27272A]">
            <Search className="h-7 w-7 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Cards Match Filters</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            {searchQuery
              ? `No cards found matching "${searchQuery}". Try clearing filters or searching another keyword.`
              : 'This showcase currently has no cards in the selected category.'}
          </p>
          {(searchQuery || selectedSport !== 'all' || selectedGradeType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSport('all');
                setSelectedGradeType('all');
              }}
              className="mt-6 rounded-xl border border-[#27272A] bg-[#141417] px-4 py-2 text-xs font-bold text-white hover:bg-[#1C1C20] transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredCards.map((card) => {
            const gradeBadge = getGradeBadgeStyle(card.gradeCompany, card.gradeValue);
            const imageUrl = card.photos && card.photos.length > 0 
              ? card.photos[0] 
              : 'https://placehold.co/400x560/141414/666666?text=No+Image';

            return (
              <div 
                key={card.id} 
                onClick={() => setSelectedCard(card)}
                className="group flex flex-col bg-[#09090B] rounded-2xl overflow-hidden border border-[#262626] shadow-md hover:border-[#E8001C]/60 hover:shadow-xl hover:shadow-[#E8001C]/10 hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer relative"
              >
                {/* Card Image Container with Trading Card Aspect Ratio */}
                <div className="relative w-full aspect-[2.5/3.5] bg-[#121214] overflow-hidden flex items-center justify-center">
                  <img 
                    src={imageUrl} 
                    alt={card.playerName || card.cardName || 'Trading Card'} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Grade Badge Overlay */}
                  {gradeBadge && (
                    <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl border shadow-xl backdrop-blur-md flex items-center gap-1.5 ${gradeBadge.bg}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">{gradeBadge.label}</span>
                      <span className={`text-xs ${gradeBadge.valClass}`}>{card.gradeValue}</span>
                    </div>
                  )}

                  {/* Sport Badge */}
                  {card.sport && (
                    <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-300">
                        {card.sport}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Card Details Panel */}
                <div className="p-4 flex flex-col flex-1 bg-[#09090B] group-hover:bg-[#0D0D10] transition-colors">
                  
                  {/* Year Tag */}
                  <div className="flex items-center gap-2 mb-1.5">
                    {card.cardYear && (
                      <span className="text-[10px] font-extrabold text-[#E8001C] bg-[#E8001C]/15 border border-[#E8001C]/30 px-2 py-0.5 rounded-md">
                        {card.cardYear}
                      </span>
                    )}
                    {card.variation && (
                      <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[120px]">
                        {card.variation}
                      </span>
                    )}
                  </div>
                  
                  {/* Player Name */}
                  <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug mb-1 line-clamp-2 group-hover:text-[#E8001C] transition-colors">
                    {card.playerName || card.cardName || 'Card Entry'}
                  </h3>
                  
                  {/* Set Name */}
                  <p className="text-xs text-zinc-400 font-medium line-clamp-1">
                    {card.cardSetName || 'Trading Card'}
                  </p>
                  
                  {/* Card Number */}
                  {card.cardNumber && (
                    <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-[#262626]/80 text-[10px] text-zinc-500 font-mono">
                      <span>#{card.cardNumber}</span>
                      <span className="text-zinc-400 group-hover:text-[#E8001C] font-semibold transition-colors flex items-center gap-0.5">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Load More Button */}
      {hasMore && !searchQuery && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-8 py-3 bg-[#141417] border border-[#27272A] rounded-2xl text-sm font-bold text-white hover:bg-[#1C1C20] hover:border-[#E8001C]/50 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#E8001C]" />}
            {isLoading ? 'Loading Showcase...' : 'Load More Cards'}
          </button>
        </div>
      )}

      {/* Showcase Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#262626] bg-[#09090B] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 z-10 rounded-full p-2 text-zinc-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left Image View */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-[#121214] rounded-2xl overflow-hidden border border-[#262626] aspect-[2.5/3.5]">
              <img
                src={selectedCard.photos && selectedCard.photos.length > 0 ? selectedCard.photos[0] : 'https://placehold.co/400x560/141414/666666?text=No+Image'}
                alt={selectedCard.playerName || 'Card'}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Right Card Breakdown */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                
                {/* Year & Sport Badges */}
                <div className="flex items-center gap-2">
                  {selectedCard.cardYear && (
                    <span className="text-xs font-bold text-[#E8001C] bg-[#E8001C]/15 border border-[#E8001C]/30 px-3 py-1 rounded-xl">
                      {selectedCard.cardYear}
                    </span>
                  )}
                  {selectedCard.sport && (
                    <span className="text-xs font-bold text-zinc-400 bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-xl uppercase">
                      {selectedCard.sport}
                    </span>
                  )}
                  {selectedCard.gradeCompany && selectedCard.gradeCompany.toUpperCase() !== 'RAW' && (
                    <span className="text-xs font-extrabold text-white bg-black/80 border border-white/20 px-3 py-1 rounded-xl uppercase">
                      {selectedCard.gradeCompany} {selectedCard.gradeValue}
                    </span>
                  )}
                </div>

                {/* Player Name */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {selectedCard.playerName || selectedCard.cardName || 'Trading Card'}
                </h2>

                {/* Card Spec Table */}
                <div className="flex flex-col gap-2.5 rounded-2xl border border-[#27272A] bg-[#141417] p-4 text-xs">
                  <div className="flex justify-between border-b border-[#27272A] pb-2">
                    <span className="text-zinc-400 font-semibold">Set Name</span>
                    <span className="text-white font-bold">{selectedCard.cardSetName || 'N/A'}</span>
                  </div>
                  {selectedCard.variation && (
                    <div className="flex justify-between border-b border-[#27272A] pb-2">
                      <span className="text-zinc-400 font-semibold">Variation / Parallel</span>
                      <span className="text-amber-400 font-bold">{selectedCard.variation}</span>
                    </div>
                  )}
                  {selectedCard.cardNumber && (
                    <div className="flex justify-between border-b border-[#27272A] pb-2">
                      <span className="text-zinc-400 font-semibold">Card #</span>
                      <span className="text-white font-mono font-bold">#{selectedCard.cardNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-semibold">Grading Status</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedCard.gradeCompany && selectedCard.gradeCompany.toUpperCase() !== 'RAW' 
                        ? `${selectedCard.gradeCompany} ${selectedCard.gradeValue}`
                        : 'Ungraded (RAW)'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <a
                  href={`mailto:support@rslcards.com?subject=Inquiry regarding ${encodeURIComponent(selectedCard.playerName || 'Card')} (${selectedCard.cardYear} ${selectedCard.cardSetName})`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E8001C] hover:bg-[#CC0018] px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-red-950/40 transition-all border border-[#E8001C]/50"
                >
                  <Mail className="h-4 w-4" />
                  <span>Inquire About This Card</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="w-full rounded-2xl border border-[#27272A] bg-[#141417] px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-[#1C1C20] transition-colors"
                >
                  Close Modal
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
