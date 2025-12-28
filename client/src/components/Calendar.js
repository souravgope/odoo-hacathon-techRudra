import React from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const Calendar = ({ requests, equipment, teams, onEdit, onDelete }) => {
  const preventiveRequests = requests.filter(r => r.type === 'Preventive');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Preventive Maintenance Schedule</h2>
      </div>

      {preventiveRequests.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No preventive maintenance scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preventiveRequests.map(req => {
            const equip = equipment.find(e => e.id === (req.equipment_id || req.equipmentId));
            const team = teams.find(t => t.id === (req.team_id || req.teamId));
            const scheduledDate = req.scheduled_date || req.scheduledDate;
            
            return (
              <div key={req.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{req.subject}</h3>
                    <p className="text-sm text-gray-400">{equip?.name}</p>
                  </div>
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scheduled:</span>
                    <span className="font-medium">{scheduledDate || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stage:</span>
                    <span className={`font-medium ${req.stage === 'Repaired' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {req.stage}
                    </span>
                  </div>
                  {team && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Team:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </div>
                  )}
                  {req.assigned_to || req.assignedTo ? (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assigned:</span>
                      <span className="font-medium">{req.assigned_to || req.assignedTo}</span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onEdit(req)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(req.id)}
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

export default Calendar;

