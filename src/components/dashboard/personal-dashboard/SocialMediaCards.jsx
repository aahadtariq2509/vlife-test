'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/Card';
import { useSocialMediaStats } from '@/hooks/useSocialMediaStats';
import Link from 'next/link';

export default function SocialMediaCards() {
  const { stats, loading, error } = useSocialMediaStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-10 mb-8">
        <Card className="flex items-center justify-center !bg-[#1877F2] text-white !rounded-[14.5px] border-[0.5px] border-[#0000001A] shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-h-[150px]">
          <p className="text-white">Loading Facebook stats...</p>
        </Card>
        <Card className="flex items-center justify-center !bg-black text-white !rounded-[14.5px] border-[0.5px] border-[#0000001A] shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-h-[150px]">
          <p className="text-white">Loading Twitter stats...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-10 mb-8">
        <Card className="flex items-center justify-center !bg-red-50 !rounded-[14.5px] border-[0.5px] border-red-200 min-h-[150px]">
          <p className="text-red-600 text-sm">Failed to load social media stats</p>
        </Card>
      </div>
    );
  }

  const facebook = stats?.facebook;
  const twitter = stats?.twitter;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-10 mb-8">
      {/* Facebook Card */}
      <Card className="flex items-start gap-4 !bg-[#1877F2] text-white !rounded-[14.5px] border-[0.5px] border-[#0000001A] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <Icon icon="qlementine-icons:facebook-fill-16" className='text-[#fff]' width="30" height="30" />
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Facebook</h2>
          {facebook ? (
            <>
              <p className='text-sm font-normal mb-2'>Today Post: {facebook.posts || 0}</p>
              <p className='text-sm font-normal mb-2'>Today Comments: {facebook.comments || 0}</p>
              <p className='text-sm font-normal mb-2'>Today Mentions: {facebook.mentions || 0}</p>
            </>
          ) : (
            <div className="text-sm">
              <p className="mb-2">Not connected</p>
              <Link
                href="/personal/settings"
                className="text-white underline hover:text-blue-100 transition"
              >
                Connect Facebook →
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Twitter (X) Card */}
      <Card className="flex items-start gap-4 !bg-black text-white !rounded-[14.5px] border-[0.5px] border-[#0000001A] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <Icon icon="fa7-brands:square-x-twitter" width="30" height="30" className="text-white" />
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Twitter</h2>
          {twitter ? (
            <>
              <p className='text-sm font-normal mb-2'>Today Post: {twitter.posts || 0}</p>
              <p className='text-sm font-normal mb-2'>Today Comments: {twitter.comments || 0}</p>
              <p className='text-sm font-normal mb-2'>Today Mentions: {twitter.mentions || 0}</p>
            </>
          ) : (
            <div className="text-sm">
              <p className="mb-2">Not connected</p>
              <Link
                href="/personal/settings"
                className="text-white underline hover:text-gray-300 transition"
              >
                Connect Twitter →
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
