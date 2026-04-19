import { MessageSquare, Send } from 'lucide-react';

const MessagesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Messages
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Communicate with team and clients
          </p>
        </div>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gold/50" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Messaging System
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Messages and conversations will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
