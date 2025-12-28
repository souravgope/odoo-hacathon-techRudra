import React from 'react';
import { Settings, Wrench, AlertCircle, Users, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';

const Dashboard = ({ equipment, requests, teams }) => {
  const stats = {
    totalEquipment: equipment.length,
    activeRequests: requests.filter(r => r.stage !== 'Repaired' && r.stage !== 'Scrap').length,
    overdueRequests: requests.filter(r => {
      if (!r.scheduled_date && !r.scheduledDate) return false;
      const date = r.scheduled_date || r.scheduledDate;
      return new Date(date) < new Date() && r.stage !== 'Repaired' && r.stage !== 'Scrap';
    }).length,
    teamsCount: teams.length
  };

  const requestsByTeam = teams.map(team => ({
    name: team.name,
    count: requests.filter(r => {
      const teamId = r.team_id || r.teamId;
      return teamId === team.id;
    }).length,
    color: team.color
  }));

  const getStageIcon = (stage) => {
    const icons = {
      'New': AlertCircle,
      'In Progress': TrendingUp,
      'Repaired': Settings,
      'Scrap': AlertCircle
    };
    return icons[stage] || AlertCircle;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Settings} title="Total Equipment" value={stats.totalEquipment} color="blue" />
        <StatCard icon={Wrench} title="Active Requests" value={stats.activeRequests} color="yellow" />
        <StatCard icon={AlertCircle} title="Overdue" value={stats.overdueRequests} color="red" />
        <StatCard icon={Users} title="Teams" value={stats.teamsCount} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Requests by Team
          </h3>
          <div className="space-y-3">
            {requestsByTeam.map((team, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-300">{team.name}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(team.count / Math.max(...requestsByTeam.map(t => t.count), 1)) * 100}%`,
                      backgroundColor: team.color
                    }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-semibold" style={{ color: team.color }}>
                  {team.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {requests.slice(0, 5).map((req) => {
              const equip = equipment.find(e => e.id === (req.equipment_id || req.equipmentId));
              const Icon = getStageIcon(req.stage);
              return (
                <div key={req.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                  <Icon className="w-5 h-5 mt-0.5 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{req.subject}</div>
                    <div className="text-xs text-gray-400">{equip?.name || 'Unknown Equipment'}</div>
                  </div>
                  <div className="text-xs text-gray-500">{req.created_date || req.createdDate}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

