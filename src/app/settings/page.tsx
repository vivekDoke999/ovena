import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Settings | OVENA',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-[28px] font-semibold text-foreground mb-8 tracking-tight">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="flex flex-col gap-1">
            <button className="text-left px-4 py-2.5 rounded-lg bg-surface text-foreground font-medium shadow-sm border border-border">Account</button>
            <button className="text-left px-4 py-2.5 rounded-lg text-text-secondary hover:bg-secondary-hover hover:text-foreground font-medium transition-colors">Appearance</button>
            <button className="text-left px-4 py-2.5 rounded-lg text-text-secondary hover:bg-secondary-hover hover:text-foreground font-medium transition-colors">Security</button>
          </div>

          {/* Content */}
          <div className="md:col-span-2 flex flex-col gap-8">
            
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-[18px] font-semibold text-foreground mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Name</label>
                  <p className="text-[15px] text-foreground">{profile?.first_name} {profile?.last_name}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Email</label>
                  <p className="text-[15px] text-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Role</label>
                  <p className="text-[15px] text-foreground capitalize">{profile?.role?.toLowerCase()}</p>
                </div>
              </div>
            </section>

            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-[18px] font-semibold text-foreground mb-2">Danger Zone</h2>
              <p className="text-[14px] text-text-secondary mb-4">Permanently delete your account and all associated data.</p>
              <button className="px-4 py-2 rounded-lg border border-error text-error hover:bg-error/5 text-[14px] font-medium transition-colors">
                Delete Account
              </button>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
