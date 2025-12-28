import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { requestsAPI } from '../services/api';

const Kanban = ({ requests, equipment, teams, onRefresh, onEdit, onDelete, searchTerm, setSearchTerm, filterTeam, setFilterTeam }) => {
  const [draggedRequest, setDraggedRequest] = useState(null);

  const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];

  const handleDragStart = (e, request) => {
    setDraggedRequest(request);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (draggedRequest && draggedRequest.stage !== newStage) {
      try {
        const equipmentId = draggedRequest.equipment_id || draggedRequest.equipmentId;
        await requestsAPI.updateStage(draggedRequest.id, newStage, equipmentId);
        onRefresh();
      } catch (error) {
        console.error('Error updating request stage:', error);
        alert('Failed to update request stage');
      }
      setDraggedRequest(null);
    }
  };

  const getRequestsByStage = (stage) => {
    return requests.filter(r => {
      const matchesStage = r.stage === stage;
      const matchesSearch = r.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const teamId = r.team_id || r.teamId;
      const matchesTeam = filterTeam === 'all' || teamId === parseInt(filterTeam);
      return matchesStage && matchesSearch && matchesTeam;
    });
  };

  const getTeamColor = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.color || '#6b7280';
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'text-red-400',
      Medium: 'text-yellow-400',
      Low: 'text-green-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  const stageColors = {
    'New': 'border-blue-500',
    'In Progress': 'border-yellow-500',
    'Repaired': 'border-green-500',
    'Scrap': 'border-red-500'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          />
        </div>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
        >
          <option value="all">All Teams</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map(stage => {
          const stageRequests = getRequestsByStage(stage);
          
          return (
            <div
              key={stage}
              className={`bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border-t-4 ${stageColors[stage]} min-h-96`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{stage}</h3>
                <span className="px-2 py-1 bg-gray-700 rounded-full text-xs font-medium">
                  {stageRequests.length}
                </span>
              </div>
              <div className="space-y-3">
                {stageRequests.map(req => {
                  const equip = equipment.find(e => e.id === (req.equipment_id || req.equipmentId));
                  const team = teams.find(t => t.id === (req.team_id || req.teamId));
                  const scheduledDate = req.scheduled_date || req.scheduledDate;
                  
                  return (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, req)}
                      className="bg-gray-700/50 rounded-lg p-4 cursor-move hover:bg-gray-700 transition-all border border-gray-600 hover:border-gray-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{req.subject}</h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEdit(req)}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDelete(req.id)}
                            className="p-1 hover:bg-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{equip?.name}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                        <span className={isOverdue(scheduledDate) ? 'text-red-400 font-semibold' : 'text-gray-400'}>
                          {scheduledDate || 'No date'}
                        </span>
                      </div>
                      {team && (
                        <div className="mt-2 flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-xs text-gray-400">{team.name}</span>
                        </div>
                      )}
                      {req.assigned_to || req.assignedTo ? (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                            {(req.assigned_to || req.assignedTo).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-400">{req.assigned_to || req.assignedTo}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Kanban;

