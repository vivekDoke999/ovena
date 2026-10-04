/* eslint-disable react-hooks/incompatible-library */
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { createProperty } from '@/app/host/actions';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';

const propertySchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Title is too short'),
  description: z.string().min(20, 'Description is too short'),
  property_type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'PG', 'HOSTEL', 'VILLA', 'BUNGALOW', 'COMMERCIAL', 'SHOP', 'OFFICE', 'OTHER']),
  rent_amount: z.coerce.number().min(0, 'Must be positive'),
  deposit_amount: z.coerce.number().min(0, 'Must be positive'),
  maintenance_amount: z.coerce.number().min(0).optional(),
  maintenance_included: z.boolean().default(false),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  locality: z.string().min(2, 'Locality is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(4, 'Invalid zip code'),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  area_sqft: z.coerce.number().min(1).optional(),
  furnishing_status: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).optional(),
  available_from: z.string().optional(),
  images: z.array(z.object({
    path: z.string(),
    url: z.string()
  })).optional(),
  amenities: z.array(z.string()).optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function PropertyForm({ hostId }: { hostId: string }) {
  const [step, setStep] = React.useState(1);
  const router = useRouter();
  const [propertyId] = React.useState(() => crypto.randomUUID());
  const [error, setError] = React.useState<string | null>(null);
  
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      id: propertyId,
      property_type: 'APARTMENT',
      maintenance_included: false,
      images: [],
      amenities: [],
    }
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 8));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async (data: PropertyFormValues) => {
    setError(null);
    const result = await createProperty(data);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/host/properties');
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Listing - Step {step} of 8</CardTitle>
        <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${(step / 8) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g. Spacious 2BHK in Downtown" />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  {...register('description')} 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe your property..."
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <select 
                  id="property_type" 
                  {...register('property_type')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
                {errors.property_type && <p className="text-sm text-red-500">{errors.property_type.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent_amount">Rent Amount (₹)</Label>
                  <Input id="rent_amount" type="number" {...register('rent_amount')} />
                  {errors.rent_amount && <p className="text-sm text-red-500">{errors.rent_amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit_amount">Deposit Amount (₹)</Label>
                  <Input id="deposit_amount" type="number" {...register('deposit_amount')} />
                  {errors.deposit_amount && <p className="text-sm text-red-500">{errors.deposit_amount.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="maintenance_amount">Maintenance Amount (₹)</Label>
                  <Input id="maintenance_amount" type="number" {...register('maintenance_amount')} />
                </div>
                <div className="space-y-2 pb-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('maintenance_included')} className="rounded text-primary" />
                    <span className="text-sm">Maintenance included in rent</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" {...register('address')} />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locality">Locality / Area</Label>
                  <Input id="locality" {...register('locality')} />
                  {errors.locality && <p className="text-sm text-red-500">{errors.locality.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register('state')} />
                  {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP / PIN Code</Label>
                  <Input id="zip_code" {...register('zip_code')} />
                  {errors.zip_code && <p className="text-sm text-red-500">{errors.zip_code.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" {...register('bedrooms')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" {...register('bathrooms')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area_sqft">Area (sq.ft)</Label>
                  <Input id="area_sqft" type="number" {...register('area_sqft')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="furnishing_status">Furnishing Status</Label>
                  <select 
                    id="furnishing_status" 
                    {...register('furnishing_status')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select...</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_from">Available From</Label>
                  <Input id="available_from" type="date" {...register('available_from')} />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Amenities</h3>
              <p className="text-sm text-gray-500 mb-4">Feature not fully implemented yet, skipping DB fetch for brevity.</p>
              {/* Checkboxes would go here */}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Images</h3>
              <p className="text-sm text-gray-500 mb-4">Upload up to 5 images. The first image will be the primary image.</p>
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUpload 
                    hostId={hostId} 
                    propertyId={propertyId} 
                    images={field.value || []} 
                    onChange={field.onChange} 
                  />
                )}
              />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review</h3>
              <div className="bg-secondary/50 p-4 rounded-md text-sm space-y-2">
                <p><strong>Title:</strong> {watch('title')}</p>
                <p><strong>Location:</strong> {watch('locality')}, {watch('city')}</p>
                <p><strong>Rent:</strong> ₹{watch('rent_amount')} / month</p>
                <p><strong>Images:</strong> {watch('images')?.length || 0} uploaded</p>
              </div>
              <p className="text-sm text-amber-600 font-medium">
                Your listing will be submitted as DRAFT and require admin verification before going live.
              </p>
            </div>
          )}
          
          {step === 8 && (
            <div className="space-y-4 text-center py-8">
              <h3 className="text-xl font-bold">Ready to Submit?</h3>
              <p className="text-gray-500">Click submit to save your listing.</p>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || isSubmitting}
            >
              Previous
            </Button>
            
            {step < 8 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
