import React from 'react';
import { notFound } from 'next/navigation';
import ShowcaseGrid from '@/components/showcase/ShowcaseGrid';
import { MapPin, Link as LinkIcon, CalendarDays, Award } from 'lucide-react';

async function getDealerData(handle: string) {
  // We use the internal docker/localhost network for server-side fetches.
  // In a real env, this would be process.env.API_URL
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
  const res = await fetch(`http://localhost:8080/v1/showcase/${handle}/inventory?page=1&limit=20`, {
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
  const hasMore = inventoryData?.hasMore || false;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Dealer Profile Header */}
      <div className="bg-[#0D0D0D] rounded-3xl p-6 sm:p-10 shadow-sm border border-[#252525] flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#E8001C]/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative">
          {profile.photoUrl ? (
            <img 
              src={profile.photoUrl} 
              alt={profile.displayName} 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border-4 border-[#141414] z-10 relative"
            />
          ) : (
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#E8001C] flex items-center justify-center text-4xl font-bold text-white shadow-md border-4 border-[#141414] z-10 relative">
              {profile.displayName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {profile.displayName}
            </h1>
            <span className="bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Verified Dealer
            </span>
          </div>
          
          {profile.bio ? (
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
              {profile.bio}
            </p>
          ) : (
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
              Welcome to my digital showcase. Browse my available inventory below.
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-400">
            {profile.sports && profile.sports.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-zinc-500" />
                <span>{profile.sports.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-zinc-500" />
              <span>Active on RSL Cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <ShowcaseGrid 
        initialCards={initialCards} 
        handle={resolvedParams.handle} 
        hasMoreInitial={hasMore} 
      />
    </div>
  );
}
