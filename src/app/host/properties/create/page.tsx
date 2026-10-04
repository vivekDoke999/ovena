import { createClient } from '@/lib/supabase/server';
import PropertyForm from '@/components/properties/PropertyForm';
import { redirect } from 'next/navigation';

export default async function CreatePropertyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PropertyForm hostId={user.id} />
    </div>
  );
}
