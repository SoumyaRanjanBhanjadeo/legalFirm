import { Calendar, Plus } from 'lucide-react';

const HearingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Hearings
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Track upcoming and past hearings
          </p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Hearing
        </button>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gold/50" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Hearing Schedule
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Hearing calendar and details will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HearingsPage;
