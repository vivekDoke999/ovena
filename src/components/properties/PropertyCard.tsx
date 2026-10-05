import Link from 'next/link';
import { Database } from '@/types/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  imageUrl?: string;
}

export default function PropertyCard({ property, imageUrl }: PropertyCardProps) {
  return (
    <div className="relative group rounded-xl border border-transparent hover:border-border hover:shadow-sm transition-all duration-200 p-2 -m-2 bg-surface">
      <Link href={`/property/${property.id}`} className="block cursor-pointer">
        <div className="flex flex-col gap-3">
          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full bg-section-alt rounded-[12px] overflow-hidden">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={imageUrl} 
                alt={property.title}
                className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-250 ease-out"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-text-muted">
                <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
            
            {/* Top Left: Verified Badge */}
            {property.verification_status === 'VERIFIED' && (
              <div className="absolute top-3 left-3 bg-surface/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-success shadow-sm flex items-center gap-1 uppercase tracking-wider">
                ✓ Verified
              </div>
            )}
            
            {/* Top Right: Save Button (Visual Only for now as per design spec, standard behavior) */}
            <button 
              type="button" 
              className="absolute top-3 right-3 p-1.5 rounded-full bg-surface/95 hover:bg-surface text-text-secondary hover:text-error shadow-sm transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // To be wired up to actual save logic
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col mt-0.5 px-1">
            <h3 className="font-medium text-[15px] text-foreground truncate">
              {property.title}
            </h3>
            
            <p className="text-[14px] text-text-secondary truncate mt-0.5">{property.locality}, {property.city}</p>

            <div className="flex items-center gap-1.5 text-[13px] text-text-muted mt-1.5">
              {property.bedrooms !== null && <span>{property.bedrooms} BHK</span>}
              {property.bedrooms !== null && <span>·</span>}
              <span className="capitalize">{property.furnishing_status?.toLowerCase().replace('_', ' ') || 'Unfurnished'}</span>
              <span>·</span>
              <span className="capitalize">{property.property_type.toLowerCase()}</span>
            </div>

            <div className="mt-2 text-[15px] font-medium text-foreground">
              ₹{property.rent_amount.toLocaleString('en-IN')} <span className="text-[14px] font-normal text-text-secondary">/ month</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
