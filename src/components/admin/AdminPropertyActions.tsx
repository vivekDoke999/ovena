'use client';

import * as React from 'react';
import { verifyProperty, rejectProperty, pauseProperty, removeProperty } from '@/app/admin/actions';
import { Database } from '@/types/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

export default function AdminPropertyActions({ property }: { property: Property }) {
  return (
    <div className="mt-auto pt-4 flex gap-2 border-t">
      {property.verification_status === 'PENDING' && (
        <>
          <form action={verifyProperty} className="flex-1">
            <input type="hidden" name="property_id" value={property.id} />
            <button type="submit" className="w-full bg-green-600 text-white text-sm font-medium py-2 rounded-md hover:bg-green-700">
              Verify
            </button>
          </form>
          <form action={rejectProperty} className="flex-1">
            <input type="hidden" name="property_id" value={property.id} />
            <button type="submit" className="w-full bg-red-600 text-white text-sm font-medium py-2 rounded-md hover:bg-red-700">
              Reject
            </button>
          </form>
        </>
      )}
      {property.verification_status === 'VERIFIED' && property.status !== 'PAUSED' && (
        <form action={pauseProperty} className="flex-1">
          <input type="hidden" name="property_id" value={property.id} />
          <button type="submit" className="w-full bg-amber-500 text-white text-sm font-medium py-2 rounded-md hover:bg-amber-600">
            Pause
          </button>
        </form>
      )}
      <form 
        action={removeProperty} 
        className="flex-1" 
        onSubmit={(e) => {
          if (!window.confirm('Are you sure you want to remove this property?')) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="property_id" value={property.id} />
        <button type="submit" className="w-full bg-red-800 text-white text-sm font-medium py-2 rounded-md hover:bg-red-900">
          Remove
        </button>
      </form>
    </div>
  );
}
