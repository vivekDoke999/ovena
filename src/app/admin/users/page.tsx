import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui';
import { suspendUser } from '@/app/admin/actions';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default async function AdminUsers() {
  const supabase = await createClient();

  
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

      <div className="grid gap-4">
        {(!users || users.length === 0) ? (
          <div className="py-12 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          users.map((profile: Profile) => (
            <Card key={profile.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{profile.first_name} {profile.last_name}</h3>
                  <p className="text-sm text-gray-500">Role: {profile.role} | ID: {profile.id}</p>
                </div>
                <div>
                  <form action={suspendUser}>
                    <input type="hidden" name="user_id" value={profile.id} />
                    <input type="hidden" name="is_suspended" value={profile.is_suspended ? 'false' : 'true'} />
                    <button 
                      type="submit" 
                      className={`text-sm font-medium px-4 py-2 rounded-md ${
                        profile.is_suspended 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {profile.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
