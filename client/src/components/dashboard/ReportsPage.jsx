import { BarChart3, Download } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reports
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Generate and view analytics reports
          </p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gold/50" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Analytics & Reports
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Reports and analytics will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
