import React from 'react';
import { Users, Plus } from 'lucide-react';

const Teams = ({ teams, requests, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance Teams</h2>
      </div>

      {teams.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No teams created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => {
            const teamRequests = requests.filter(r => {
              const teamId = r.team_id || r.teamId;
              return teamId === team.id;
            });
            const activeRequests = teamRequests.filter(r => r.stage !== 'Repaired' && r.stage !== 'Scrap');
            
            return (
              <div key={team.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: team.color + '20' }}>
                      <Users className="w-6 h-6" style={{ color: team.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      <p className="text-xs text-gray-400">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-400">Team Members:</div>
                  <div className="flex flex-wrap gap-2">
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member, idx) => (
                        <div key={idx} className="px-3 py-1 bg-gray-700 rounded-full text-xs flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                          {member}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No members</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg mb-3">
                  <span className="text-sm text-gray-400">Active Requests</span>
                  <span className="text-lg font-semibold" style={{ color: team.color }}>
                    {activeRequests.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(team)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(team.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Teams;

