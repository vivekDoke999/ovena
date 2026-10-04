import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/types/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  imageUrl?: string;
}

export default function PropertyCard({ property, imageUrl }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg border-transparent hover:border-gray-200">
        <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageUrl} 
              alt={property.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No Image
            </div>
          )}
          {property.verification_status === 'VERIFIED' && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-green-700 shadow-sm flex items-center gap-1">
              ✓ Verified
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg truncate pr-4 text-gray-900 group-hover:text-primary transition-colors">
              ₹{property.rent_amount.toLocaleString('en-IN')}<span className="text-sm font-normal text-gray-500">/mo</span>
            </h3>
          </div>
          <p className="text-sm font-medium text-gray-800 truncate">{property.title}</p>
          <p className="text-sm text-gray-500 truncate mb-3">{property.locality}, {property.city}</p>
          
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {property.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-gray-900">{property.bedrooms}</span> Beds
              </span>
            )}
            {property.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-gray-900">{property.bathrooms}</span> Baths
              </span>
            )}
            {property.area_sqft !== null && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-gray-900">{property.area_sqft}</span> sqft
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
