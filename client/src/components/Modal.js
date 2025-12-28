import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const Modal = ({ show, onClose, type, editingItem, onSubmit, equipment = [], teams = [], onNavigateToTeams }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({});
    }
  }, [editingItem, show]);

  // Debug: Log data when modal opens
  useEffect(() => {
    if (show) {
      if (type === 'request') {
        console.log('Modal opened for request, equipment count:', equipment?.length || 0);
        console.log('Equipment data:', equipment);
      }
      if (type === 'equipment') {
        console.log('Modal opened for equipment, teams count:', teams?.length || 0);
        console.log('Teams data:', teams);
      }
    }
  }, [show, type, equipment, teams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (e) => {
    const equipmentId = e.target.value;
    if (!equipmentId) return;

    // If selecting a 'new' equipment placeholder, set a marker value and clear team/category fallback
    if (typeof equipmentId === 'string' && equipmentId.startsWith('newEquip:')) {
      setFormData(prev => ({
        ...prev,
        equipmentId: equipmentId,
        equipment_name_placeholder: equipmentId.replace('newEquip:', ''),
        teamId: prev.teamId || '',
        category: prev.category || ''
      }));
      return;
    }

    const selectedEquip = equipment.find(e => {
      const equipId = typeof e.id === 'string' ? parseInt(e.id) : e.id;
      const targetId = typeof equipmentId === 'string' ? parseInt(equipmentId) : equipmentId;
      return equipId === targetId;
    });

    if (selectedEquip) {
      setFormData(prev => ({
        ...prev,
        equipmentId: equipmentId,
        teamId: selectedEquip.team_id || selectedEquip.teamId || prev.teamId || '',
        category: selectedEquip.category || prev.category || ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = { ...formData };
    
    if (type === 'team' && formData.members) {
      submitData.members = typeof formData.members === 'string' 
        ? formData.members.split(',').map(m => m.trim()).filter(m => m)
        : formData.members;
    }

    onSubmit(submitData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingItem ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'equipment' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Equipment Name *</label>
                  <input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Serial Number *</label>
                  <input
                    name="serialNumber"
                    value={formData.serial_number || formData.serialNumber || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Department *</label>
                  <input
                    name="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <input
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assigned To</label>
                <input
                  name="assignedTo"
                  value={formData.assigned_to || formData.assignedTo || ''}
                  onChange={handleChange}
                  placeholder="Department or Person"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Date</label>
                  <input
                    name="purchaseDate"
                    type="date"
                    value={formData.purchase_date || formData.purchaseDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Warranty Until</label>
                  <input
                    name="warrantyDate"
                    type="date"
                    value={formData.warranty_date || formData.warrantyDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Team *</label>
                <select
                  name="teamId"
                  value={formData.team_id || formData.teamId || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Select Team</option>
                  {Array.isArray(teams) && teams.length > 0 ? (
                    teams.map(team => {
                      if (!team || !team.id) return null;
                      return (
                        <option key={team.id} value={team.id}>
                          {team.name || 'Unnamed Team'}
                        </option>
                      );
                    })
                  ) : (
                    // Provide quick sample teams when none exist so user can pick a name
                    ['Mechanics','Electricians','IT Support','Facilities','Vehicle Maintenance'].map(name => (
                      <option key={name} value={`new:${name}`}>
                        {name} (will be created)
                      </option>
                    ))
                  )}
                </select>
                {(!teams || teams.length === 0) && (
                  <div className="text-xs text-yellow-400 mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                    <p className="mb-2">⚠️ No teams found. You need to create teams first.</p>
                    {onNavigateToTeams && (
                      <button
                        type="button"
                        onClick={onNavigateToTeams}
                        className="text-xs text-blue-400 hover:text-blue-300 underline mt-1"
                      >
                        → Go to Teams page to create teams
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {type === 'team' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Team Name *</label>
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team Members (comma-separated) *</label>
                <input
                  name="members"
                  value={Array.isArray(formData.members) ? formData.members.join(', ') : (formData.members || '')}
                  onChange={handleChange}
                  required
                  placeholder="John Doe, Jane Smith"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team Color</label>
                <input
                  name="color"
                  type="color"
                  value={formData.color || '#3b82f6'}
                  onChange={handleChange}
                  className="w-full h-12 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {type === 'request' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  name="subject"
                  value={formData.subject || ''}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Oil Leaking Issue"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Equipment *</label>
                <select
                  name="equipmentId"
                  value={formData.equipment_id || formData.equipmentId || ''}
                  onChange={handleEquipmentChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Select Equipment</option>
                  {Array.isArray(equipment) && equipment.length > 0 ? (
                    equipment.map(equip => {
                      if (!equip || !equip.id) return null;
                      return (
                        <option key={equip.id} value={equip.id}>
                          {equip.name || 'Unnamed'} - {equip.serial_number || equip.serialNumber || 'N/A'}
                        </option>
                      );
                    })
                  ) : (
                    // Provide quick sample equipment names when none exist so user can pick a name
                    ['Sample Machine A','Sample Laptop 01','Sample Vehicle 01'].map(name => (
                      <option key={name} value={`newEquip:${name}`}>
                        {name} (will be created)
                      </option>
                    ))
                  )}
                </select>
                {(!equipment || equipment.length === 0) && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ No equipment found. Please create equipment from the Equipment page first.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Request Type *</label>
                  <select
                    name="type"
                    value={formData.type || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="Corrective">Corrective (Breakdown)</option>
                    <option value="Preventive">Preventive (Routine)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority || 'Medium'}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                  <input
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduled_date || formData.scheduledDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <input
                    name="duration"
                    type="number"
                    step="0.5"
                    value={formData.duration || 0}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assigned To</label>
                <input
                  name="assignedTo"
                  value={formData.assigned_to || formData.assignedTo || ''}
                  onChange={handleChange}
                  placeholder="Technician name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Detailed description of the issue..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-white"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;

