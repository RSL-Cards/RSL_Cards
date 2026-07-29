import React from 'react';
import { notFound } from 'next/navigation';
import ShowcaseGrid from '@/components/showcase/ShowcaseGrid';
import { Award, CalendarDays, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import ShowcaseShareButton from '@/components/showcase/ShowcaseShareButton';

async function getDealerData(handle: string) {
  const res = await fetch(`http://localhost:8080/v1/showcase/${handle}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch dealer data');
  }
  return res.json();
}

async function getDealerInventory(handle: string) {
  const res = await fetch(`http://localhost:8080/v1/showcase/${handle}/inventory?page=1&limit=30`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export default async function ShowcasePage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const [profileData, inventoryData] = await Promise.all([
    getDealerData(resolvedParams.handle).catch(() => null),
    getDealerInventory(resolvedParams.handle).catch(() => null)
  ]);

  if (!profileData || !profileData.id) {
    notFound();
  }

  const profile = profileData;
  const initialCards = inventoryData?.data || [];
  const totalCount = inventoryData?.total || initialCards.length;
  const hasMore = inventoryData?.hasMore || false;

  return (
    <div className="min-h-screen flex flex-col gap-8 pb-16 pt-2">
      {/* Premium Hero Showcase Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#262626] bg-[#09090B] p-6 sm:p-10 shadow-2xl">
        {/* Glowing background ambient lights */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-[#E8001C]/25 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          
          {/* Left Column: Avatar + Bio Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1">
            {/* Avatar with Halo Ring */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#E8001C] via-amber-500 to-red-600 blur opacity-60"></div>
              {profile.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt={profile.displayName} 
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-[#18181B] bg-[#18181B] shadow-xl"
                />
              ) : (
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#E8001C] to-red-900 flex items-center justify-center text-4xl font-black text-white border-2 border-[#18181B] shadow-xl">
                  {profile.displayName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Dealer Details */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                  {profile.displayName}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8001C]/40 bg-[#E8001C]/15 px-3 py-1 text-xs font-extrabold text-[#E8001C] uppercase tracking-wider shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Dealer
                </span>
              </div>

              <p className="text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed">
                {profile.bio || "Welcome to my digital showcase. Explore my curated inventory of authenticated sports cards."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400 pt-1">
                {profile.sports && profile.sports.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-xl">
                    <Award className="w-3.5 h-3.5 text-[#E8001C]" />
                    <span>{profile.sports.join(' • ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-xl">
                  <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Official RSL Showcase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Action Bar */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 border-t md:border-t-0 border-[#27272A] pt-6 md:pt-0">
            {/* Quick Showcase Stats */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center md:items-end bg-[#141417]/80 backdrop-blur-md border border-[#27272A] px-4 py-2.5 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#E8001C]" /> Showcase Items
                </span>
                <span className="text-xl font-extrabold text-white font-mono">{totalCount}</span>
              </div>
            </div>

            {/* Share Showcase Button Component */}
            <ShowcaseShareButton dealerName={profile.displayName} />
          </div>

        </div>
      </div>

      {/* Main Interactive Inventory Showcase Grid */}
      <ShowcaseGrid 
        initialCards={initialCards} 
        handle={resolvedParams.handle} 
        hasMoreInitial={hasMore} 
      />
    </div>
  );
}
