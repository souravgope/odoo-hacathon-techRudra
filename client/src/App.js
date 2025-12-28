import React, { useState, useEffect } from 'react';
import { Calendar, Settings, Users, Wrench, TrendingUp, Plus } from 'lucide-react';
import api, { equipmentAPI, teamsAPI, requestsAPI } from './services/api';
import Dashboard from './components/Dashboard';
import Kanban from './components/Kanban';
import CalendarView from './components/Calendar';
import Equipment from './components/Equipment';
import Teams from './components/Teams';
import Modal from './components/Modal';
import EquipmentRequests from './components/EquipmentRequests';
import { seedSampleData, seedTeamsOnly } from './utils/seedEquipment';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showEquipmentRequests, setShowEquipmentRequests] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(true); // health of backend DB

  // Load data on mount
  useEffect(() => {
    loadData();
    // Make seed functions available in console for easy access
    window.seedSampleData = seedSampleData;
    window.seedTeamsOnly = seedTeamsOnly;
  }, []);

  const loadData = async () => {
    try {
      // Check backend health first
      try {
        await api.get('/health');
        setDbAvailable(true);
      } catch (healthErr) {
        console.warn('Backend health check failed:', healthErr.message || healthErr);
        setDbAvailable(false);
      }

      const [equipRes, teamsRes, reqRes] = await Promise.all([
        equipmentAPI.getAll().catch(err => {
          console.error('Error loading equipment:', err);
          return { data: [] };
        }),
        teamsAPI.getAll().catch(err => {
          console.error('Error loading teams:', err);
          return { data: [] };
        }),
        requestsAPI.getAll().catch(err => {
          console.error('Error loading requests:', err);
          return { data: [] };
        })
      ]);
      console.log('Loaded equipment:', equipRes.data);
      console.log('Loaded teams:', teamsRes.data);
      console.log('Loaded requests:', reqRes.data);
      let eq = Array.isArray(equipRes.data) ? equipRes.data : [];
      let ts = Array.isArray(teamsRes.data) ? teamsRes.data : [];
      let rs = Array.isArray(reqRes.data) ? reqRes.data : [];

      // Merge local (unsynced) items saved when DB was unavailable
      try {
        const localEq = JSON.parse(localStorage.getItem('local_equipment') || '[]');
        const localTs = JSON.parse(localStorage.getItem('local_teams') || '[]');
        const localRs = JSON.parse(localStorage.getItem('local_requests') || '[]');
        if (Array.isArray(localEq) && localEq.length) eq = [...localEq, ...eq];
        if (Array.isArray(localTs) && localTs.length) ts = [...localTs, ...ts];
        if (Array.isArray(localRs) && localRs.length) rs = [...localRs, ...rs];
      } catch (err) {
        console.warn('Error parsing local data:', err);
      }

      setEquipment(eq);
      setTeams(ts);
      setRequests(rs);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays to prevent crashes
      setEquipment([]);
      setTeams([]);
      setRequests([]);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (data) => {
    try {
      // Offline fallback: if DB is unreachable, persist locally so user can continue
      if (!dbAvailable) {
        if (modalType === 'equipment') {
          const localEquip = {
            id: `local-${Date.now()}`,
            name: data.name,
            serialNumber: data.serialNumber || data.serial_number || `LOCAL-${Date.now()}`,
            department: data.department || 'General',
            category: data.category || 'General',
            location: data.location || 'TBD',
            assignedTo: data.assignedTo || data.assigned_to || '',
            purchaseDate: data.purchaseDate || data.purchase_date || null,
            warrantyDate: data.warrantyDate || data.warranty_date || null,
            teamId: data.teamId || data.team_id || null
          };
          // Save to local state and to localStorage
          const newEquipment = [localEquip, ...equipment];
          setEquipment(newEquipment);
          localStorage.setItem('local_equipment', JSON.stringify(newEquipment));
          alert('Saved locally (Postgres unavailable). This change is temporary and will not persist to the database.');
          await loadData();
          closeModal();
          return;
        }

        if (modalType === 'team') {
          const localTeam = {
            id: `local-${Date.now()}`,
            name: data.name,
            color: data.color || '#3b82f6',
            members: Array.isArray(data.members) ? data.members : data.members.split(',').map(m => m.trim()).filter(m => m)
          };
          const newTeams = [localTeam, ...teams];
          setTeams(newTeams);
          localStorage.setItem('local_teams', JSON.stringify(newTeams));
          alert('Team saved locally (Postgres unavailable).');
          await loadData();
          closeModal();
          return;
        }

        // For requests, create local-only request for now
        if (modalType === 'request') {
          const localRequest = {
            id: `local-${Date.now()}`,
            subject: data.subject,
            equipmentId: data.equipmentId || data.equipment_id || null,
            teamId: data.teamId || data.team_id || null,
            type: data.type,
            priority: data.priority || 'Medium',
            scheduledDate: data.scheduledDate || data.scheduled_date || null,
            assignedTo: data.assignedTo || data.assigned_to || '',
            duration: parseFloat(data.duration) || 0,
            description: data.description || ''
          };
          const newRequests = [localRequest, ...requests];
          setRequests(newRequests);
          localStorage.setItem('local_requests', JSON.stringify(newRequests));
          alert('Request saved locally (Postgres unavailable).');
          await loadData();
          closeModal();
          return;
        }
      }

      if (modalType === 'equipment') {
        let payload = {
          name: data.name,
          serialNumber: data.serialNumber || data.serial_number,
          department: data.department,
          category: data.category || 'General',
          location: data.location,
          assignedTo: data.assignedTo || data.assigned_to,
          purchaseDate: data.purchaseDate || data.purchase_date,
          warrantyDate: data.warrantyDate || data.warranty_date,
          teamId: data.teamId || data.team_id
        };

        // If a placeholder 'new:Name' team was selected, create that team first
        if (typeof payload.teamId === 'string' && payload.teamId.startsWith('new:')) {
          const teamName = payload.teamId.replace('new:', '');
          try {
            const teamRes = await teamsAPI.create({ name: teamName, members: [] });
            payload.teamId = teamRes.data.id;
          } catch (err) {
            console.error('Failed to auto-create team for equipment:', err);
            throw err;
          }
        }

        if (editingItem) {
          await equipmentAPI.update(editingItem.id, payload);
        } else {
          await equipmentAPI.create(payload);
        }
      } else if (modalType === 'team') {
        const payload = {
          name: data.name,
          color: data.color || '#3b82f6',
          members: Array.isArray(data.members) ? data.members : data.members.split(',').map(m => m.trim()).filter(m => m)
        };

        if (editingItem) {
          await teamsAPI.update(editingItem.id, payload);
        } else {
          await teamsAPI.create(payload);
        }
      } else if (modalType === 'request') {
        let payload = {
          subject: data.subject,
          equipmentId: data.equipmentId || data.equipment_id,
          teamId: data.teamId || data.team_id,
          type: data.type,
          priority: data.priority || 'Medium',
          scheduledDate: data.scheduledDate || data.scheduled_date,
          assignedTo: data.assignedTo || data.assigned_to,
          duration: parseFloat(data.duration) || 0,
          description: data.description
        };

        // Auto-create referenced team if placeholder selected
        if (typeof payload.teamId === 'string' && payload.teamId.startsWith('new:')) {
          const teamName = payload.teamId.replace('new:', '');
          try {
            const teamRes = await teamsAPI.create({ name: teamName, members: [] });
            payload.teamId = teamRes.data.id;
          } catch (err) {
            console.error('Failed to auto-create team for request:', err);
            throw err;
          }
        }

        // If equipment placeholder selected, create an equipment record first using fallback values
        if (typeof payload.equipmentId === 'string' && payload.equipmentId.startsWith('newEquip:')) {
          const equipName = payload.equipmentId.replace('newEquip:', '');
          try {
            const newEquipPayload = {
              name: equipName,
              serialNumber: `SAMPLE-${Date.now()}`,
              department: 'General',
              category: 'Tools',
              location: 'TBD',
              assignedTo: payload.assignedTo || '',
              teamId: payload.teamId || null
            };
            const equipRes = await equipmentAPI.create(newEquipPayload);
            payload.equipmentId = equipRes.data.id;
          } catch (err) {
            console.error('Failed to auto-create equipment for request:', err);
            throw err;
          }
        }

        if (editingItem) {
          await requestsAPI.update(editingItem.id, payload);
        } else {
          await requestsAPI.create(payload);
        }
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving data:', error);
      const serverMsg = error?.response?.data?.error || error?.message || String(error);
      if (serverMsg.includes('ECONNREFUSED') || serverMsg.includes('connect')) {
        alert(`Failed to save: ${serverMsg}\n\nHint: the backend database may be down. Start PostgreSQL and try again.`);
      } else {
        alert(`Failed to save: ${serverMsg}`);
      }
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      if (type === 'equipment') {
        await equipmentAPI.delete(id);
      } else if (type === 'team') {
        await teamsAPI.delete(id);
      } else if (type === 'request') {
        await requestsAPI.delete(id);
      }
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleViewEquipmentRequests = async (equipmentId) => {
    const equip = equipment.find(e => e.id === equipmentId);
    if (equip) {
      setSelectedEquipment(equip);
      setShowEquipmentRequests(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GearGuard
                </h1>
                <p className="text-xs text-gray-400">Ultimate Maintenance Tracker</p>
              </div>
            </div>
            <nav className="flex gap-2">
              {[
                { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
                { id: 'kanban', icon: Wrench, label: 'Requests' },
                { id: 'calendar', icon: Calendar, label: 'Calendar' },
                { id: 'equipment', icon: Settings, label: 'Equipment' },
                { id: 'teams', icon: Users, label: 'Teams' }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeView === view.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{view.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!dbAvailable && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="rounded-lg bg-red-600/20 border border-red-600 text-red-200 px-4 py-3">
            <strong>Database unavailable:</strong> The backend cannot reach PostgreSQL. Some actions (create/update) will fail until the DB is running.
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'dashboard' && (
          <Dashboard equipment={equipment} requests={requests} teams={teams} />
        )}
        
        {activeView === 'kanban' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openModal('request')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>
            <Kanban
              requests={requests}
              equipment={equipment}
              teams={teams}
              onRefresh={loadData}
              onEdit={(req) => openModal('request', req)}
              onDelete={(id) => handleDelete('request', id)}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterTeam={filterTeam}
              setFilterTeam={setFilterTeam}
            />
          </div>
        )}
        
        {activeView === 'calendar' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openModal('request')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Maintenance
              </button>
            </div>
            <CalendarView
              requests={requests}
              equipment={equipment}
              teams={teams}
              onEdit={(req) => openModal('request', req)}
              onDelete={(id) => handleDelete('request', id)}
            />
          </div>
        )}
        
        {activeView === 'equipment' && (
          <div className="space-y-4">
            {equipment.length === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400 text-sm mb-3">
                  💡 <strong>No equipment found!</strong> Click "Seed Sample Data" to add realistic sample equipment, or create your own.
                </p>
                <button
                  onClick={async () => {
                    if (window.confirm('This will create sample teams and equipment. Continue?')) {
                      try {
                        await seedSampleData();
                        await loadData();
                        alert('✅ Sample data created successfully!');
                      } catch (error) {
                        console.error('Error seeding data:', error);
                        alert(`Failed to seed data: ${error.response?.data?.error || error.message}`);
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Seed Sample Data
                </button>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => openModal('equipment')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </div>
            <Equipment
              equipment={equipment}
              teams={teams}
              requests={requests}
              onEdit={(equip) => openModal('equipment', equip)}
              onDelete={(id) => handleDelete('equipment', id)}
              onViewRequests={handleViewEquipmentRequests}
            />
          </div>
        )}
        
        {activeView === 'teams' && (
          <div className="space-y-4">
            {teams.length === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400 text-sm mb-3">
                  💡 <strong>No teams found!</strong> Click "Seed Sample Data" to add maintenance teams, or create your own.
                </p>
                <button
                  onClick={async () => {
                    if (window.confirm('This will create 5 sample maintenance teams. Continue?')) {
                      try {
                        await seedTeamsOnly();
                        await loadData();
                        alert('✅ Sample teams created successfully!');
                      } catch (error) {
                        console.error('Error seeding teams:', error);
                        alert(`Failed to seed teams: ${error.response?.data?.error || error.message}`);
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Seed Sample Teams
                </button>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => openModal('team')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </button>
            </div>
            <Teams
              teams={teams}
              requests={requests}
              onEdit={(team) => openModal('team', team)}
              onDelete={(id) => handleDelete('team', id)}
            />
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        type={modalType}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        equipment={equipment}
        teams={teams}
        onNavigateToTeams={() => {
          closeModal();
          setActiveView('teams');
        }}
      />

      {/* Equipment Requests Modal */}
      {showEquipmentRequests && selectedEquipment && (
        <EquipmentRequests
          equipment={selectedEquipment}
          requests={requests}
          onClose={() => {
            setShowEquipmentRequests(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
}

export default App;

