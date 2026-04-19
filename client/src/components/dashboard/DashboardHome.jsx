import { 
  FolderOpen, Users, Calendar, FileText
} from 'lucide-react';

const DashboardHome = () => {
  // Mock data - will be replaced with API calls
  const stats = [
    {
      title: 'Total Cases',
      value: '156',
      icon: FolderOpen,
      color: 'from-gold to-gold-dark',
      bgColor: 'bg-gold/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Clients',
      value: '89',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Upcoming Hearings',
      value: '23',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Documents Filed',
      value: '342',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      change: '+24%',
      changeType: 'positive'
    }
  ];

  const recentCases = [
    {
      id: 'CASE-001',
      title: 'Smith vs Johnson Corp',
      client: 'John Smith',
      type: 'Civil Litigation',
      status: 'Active',
      nextHearing: '2026-04-25',
      priority: 'High'
    },
    {
      id: 'CASE-002',
      title: 'Estate Planning - Williams',
      client: 'Sarah Williams',
      type: 'Estate Planning',
      status: 'In Progress',
      nextHearing: '2026-05-02',
      priority: 'Medium'
    },
    {
      id: 'CASE-003',
      title: 'Contract Dispute - TechCorp',
      client: 'TechCorp Industries',
      type: 'Corporate Law',
      status: 'Pending Review',
      nextHearing: '2026-04-30',
      priority: 'High'
    },
    {
      id: 'CASE-004',
      title: 'Family Matter - Davis',
      client: 'Michael Davis',
      type: 'Family Law',
      status: 'Active',
      nextHearing: '2026-05-10',
      priority: 'Low'
    }
  ];

  const upcomingHearings = [
    {
      case: 'Smith vs Johnson Corp',
      date: '2026-04-25',
      time: '10:00 AM',
      court: 'Court Room 3A'
    },
    {
      case: 'Contract Dispute - TechCorp',
      date: '2026-04-30',
      time: '2:00 PM',
      court: 'Court Room 1B'
    },
    {
      case: 'Estate Planning - Williams',
      date: '2026-05-02',
      time: '11:30 AM',
      court: 'Court Room 2C'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'Low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-500';
      case 'In Progress': return 'text-blue-500';
      case 'Pending Review': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Welcome back! Here's what's happening with your cases.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 lg:p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' 
                    ? 'text-green-500 bg-green-500/10' 
                    : 'text-red-500 bg-red-500/10'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </h3>
              <p className="text-xs lg:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {stat.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 rounded-xl border" style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)'
        }}>
          <div className="p-4 lg:p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Recent Cases
              </h2>
              <button className="text-sm text-gold hover:text-gold-light transition-colors cursor-pointer">
                View All
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-primary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Case ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {recentCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gold/5 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-medium text-gold">
                      {caseItem.id}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {caseItem.title}
                    </td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {caseItem.client}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Hearings */}
        <div className="rounded-xl border" style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)'
        }}>
          <div className="p-4 lg:p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg lg:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Upcoming Hearings
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            {upcomingHearings.map((hearing, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    <Calendar className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {hearing.case}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {hearing.date} at {hearing.time}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {hearing.court}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FolderOpen, label: 'New Case', color: 'bg-gold/10 hover:bg-gold/20' },
          { icon: Users, label: 'Add Client', color: 'bg-blue-500/10 hover:bg-blue-500/20' },
          { icon: Calendar, label: 'Schedule Hearing', color: 'bg-purple-500/10 hover:bg-purple-500/20' },
          { icon: FileText, label: 'Upload Document', color: 'bg-green-500/10 hover:bg-green-500/20' },
        ].map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-4 lg:p-6 rounded-xl border transition-all duration-300 transform hover:scale-105 cursor-pointer ${action.color}`}
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Icon className="w-8 h-8 mb-2 text-gold" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHome;
