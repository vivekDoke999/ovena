import Link from 'next/link';
import { Database } from '@/types/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  imageUrl?: string;
}

export default function PropertyCard({ property, imageUrl }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`} className="block group cursor-pointer">
      <div className="flex flex-col gap-3">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageUrl} 
              alt={property.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-text-muted bg-gray-100">
              <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          {property.verification_status === 'VERIFIED' && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-success shadow-sm flex items-center gap-1 uppercase tracking-wider">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-semibold text-base text-foreground truncate pr-4">
              ₹{property.rent_amount.toLocaleString('en-IN')}<span className="text-sm font-normal text-text-secondary"> / month</span>
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-foreground mb-0.5">
            {property.bedrooms !== null && <span className="font-medium">{property.bedrooms} BHK</span>}
            {property.bedrooms !== null && <span className="text-text-muted">•</span>}
            <span className="capitalize">{property.furnishing_status?.toLowerCase().replace('_', ' ') || 'Unfurnished'}</span>
            <span className="text-text-muted">•</span>
            <span className="capitalize">{property.property_type.toLowerCase()}</span>
          </div>

          <p className="text-sm text-text-secondary truncate">{property.locality}, {property.city}</p>
        </div>
      </div>
    </Link>
  );
}
