'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NearMeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', latitude.toString());
        params.set('lng', longitude.toString());
        // Remove city/locality if using near me to avoid conflicts
        params.delete('city');
        router.push(`/search?${params.toString()}`);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert('Could not get your location. Please ensure location permissions are granted.');
        setLoading(false);
      }
    );
  };

  return (
    <button 
      type="button" 
      onClick={handleNearMe}
      disabled={loading}
      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? 'Finding...' : '📍 Near Me'}
    </button>
  );
}
