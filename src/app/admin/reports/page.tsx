import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui';
import { resolveReport } from '@/app/admin/actions';
import { Database } from '@/types/database.types';

type Report = Database['public']['Tables']['reports']['Row'];

export default async function AdminReports() {
  const supabase = await createClient();

  
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['OPEN', 'INVESTIGATING'])
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Active Reports</h1>

      <div className="grid gap-4">
        {(!reports || reports.length === 0) ? (
          <div className="py-12 text-center text-gray-500">
            No active reports.
          </div>
        ) : (
          reports.map((report: Report) => (
            <Card key={report.id}>
              <CardContent className="p-4 flex items-start justify-between flex-col sm:flex-row gap-4">
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-1 rounded">
                      {report.reason}
                    </span>
                    <span className="text-xs text-gray-500">Status: {report.status}</span>
                  </div>
                  <p className="text-sm mt-2">{report.description || 'No description provided.'}</p>
                  <p className="text-xs text-gray-400 mt-2">Target ID: {report.property_id || 'N/A'}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <form action={resolveReport} className="flex-1">
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="status" value="RESOLVED" />
                    <button type="submit" className="w-full sm:w-auto bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-green-200">
                      Resolve
                    </button>
                  </form>
                  <form action={resolveReport} className="flex-1">
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <button type="submit" className="w-full sm:w-auto bg-gray-100 text-gray-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-200">
                      Dismiss
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
