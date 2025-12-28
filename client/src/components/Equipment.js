import React, { useState } from 'react';
import { Settings, Wrench, Plus } from 'lucide-react';
import { equipmentAPI } from '../services/api';

const Equipment = ({ equipment, teams, requests, onEdit, onDelete, onViewRequests }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Equipment Management</h2>
      </div>

      {equipment.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center">
          <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No equipment registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map(equip => {
            const team = teams.find(t => t.id === equip.team_id || t.id === equip.teamId);
            const equipRequests = requests.filter(r => {
              const reqEquipId = r.equipment_id || r.equipmentId;
              return reqEquipId === equip.id;
            });
            const openRequests = equipRequests.filter(r => r.stage !== 'Repaired' && r.stage !== 'Scrap');
            
            return (
              <div key={equip.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{equip.name}</h3>
                    <p className="text-xs text-gray-400">{equip.serial_number || equip.serialNumber}</p>
                  </div>
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="font-medium">{equip.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="font-medium">{equip.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="font-medium">{equip.location}</span>
                  </div>
                  {team && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Maintenance Team:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </div>
                  )}
                  {equip.is_scrapped && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="font-medium text-red-400">Scrapped</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => onViewRequests(equip.id)}
                    className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Maintenance
                    {openRequests.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-semibold">
                        {openRequests.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(equip)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(equip.id)}
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

export default Equipment;

