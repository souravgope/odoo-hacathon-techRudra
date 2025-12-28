import React from 'react';
import { X, Wrench } from 'lucide-react';

const EquipmentRequests = ({ equipment, requests, onClose }) => {
  const equipRequests = requests.filter(r => {
    const reqEquipId = r.equipment_id || r.equipmentId;
    return reqEquipId === equipment.id;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold">Maintenance Requests</h2>
              <p className="text-sm text-gray-400">{equipment.name} - {equipment.serial_number || equipment.serialNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {equipRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No maintenance requests for this equipment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {equipRequests.map(req => (
              <div key={req.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{req.subject}</h3>
                    <p className="text-sm text-gray-400 mt-1">{req.description || 'No description'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.stage === 'New' ? 'bg-blue-500/20 text-blue-400' :
                    req.stage === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    req.stage === 'Repaired' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {req.stage}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 font-medium">{req.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Priority:</span>
                    <span className={`ml-2 font-medium ${
                      req.priority === 'High' ? 'text-red-400' :
                      req.priority === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Scheduled:</span>
                    <span className="ml-2 font-medium">{req.scheduled_date || req.scheduledDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="ml-2 font-medium">{req.duration || 0}h</span>
                  </div>
                </div>
                {req.assigned_to || req.assignedTo ? (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                      {(req.assigned_to || req.assignedTo).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300">{req.assigned_to || req.assignedTo}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentRequests;

