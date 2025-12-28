require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gearguard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed sample data...');

    // First, create teams if they don't exist
    console.log('Creating teams...');
    const teams = [
      { name: 'Mechanics', color: '#3b82f6', members: ['John Doe', 'Jane Smith', 'Mike Johnson'] },
      { name: 'Electricians', color: '#f59e0b', members: ['Sarah Wilson', 'Tom Brown', 'Emma Davis'] },
      { name: 'IT Support', color: '#8b5cf6', members: ['Alex Chen', 'Lisa Anderson', 'David Kim'] },
      { name: 'Vehicle Maintenance', color: '#10b981', members: ['Robert Taylor', 'Maria Garcia'] },
      { name: 'Facilities', color: '#ef4444', members: ['James White', 'Patricia Lee'] }
    ];

    const teamIds = {};
    for (const team of teams) {
      // Check if team exists
      const checkResult = await pool.query('SELECT id FROM teams WHERE name = $1', [team.name]);
      
      if (checkResult.rows.length === 0) {
        // Create team
        const teamResult = await pool.query(
          'INSERT INTO teams (name, color) VALUES ($1, $2) RETURNING id',
          [team.name, team.color]
        );
        const teamId = teamResult.rows[0].id;
        teamIds[team.name] = teamId;

        // Add members
        for (const member of team.members) {
          await pool.query(
            'INSERT INTO team_members (team_id, member_name) VALUES ($1, $2)',
            [teamId, member]
          );
        }
        console.log(`  ✓ Created team: ${team.name}`);
      } else {
        teamIds[team.name] = checkResult.rows[0].id;
        console.log(`  ✓ Team already exists: ${team.name}`);
      }
    }

    // Now create equipment
    console.log('\nCreating equipment...');
    const equipment = [
      // Production / Factory Equipment
      { name: 'CNC Machine 01', serialNumber: 'CNC-2023-001', department: 'Production', category: 'Machinery', location: 'Factory Floor A', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },
      { name: 'Lathe Machine 01', serialNumber: 'LAT-2022-045', department: 'Production', category: 'Machinery', location: 'Factory Floor A', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },
      { name: 'Milling Machine 01', serialNumber: 'MIL-2023-012', department: 'Production', category: 'Machinery', location: 'Factory Floor B', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },
      { name: 'Conveyor Belt System', serialNumber: 'CON-2021-078', department: 'Production', category: 'Machinery', location: 'Assembly Line 1', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },
      { name: 'Hydraulic Press 01', serialNumber: 'HYD-2022-033', department: 'Production', category: 'Machinery', location: 'Factory Floor C', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },
      { name: 'Welding Machine 01', serialNumber: 'WEL-2023-056', department: 'Production', category: 'Tools', location: 'Welding Station 1', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },
      { name: 'Air Compressor 01', serialNumber: 'AIR-2022-089', department: 'Production', category: 'Machinery', location: 'Utility Room', teamId: teamIds['Mechanics'], assignedTo: 'Production Department' },

      // IT / Office Equipment
      { name: 'Laptop Dell XPS 15', serialNumber: 'LAP-2024-001', department: 'IT', category: 'Electronics', location: 'Office 3B', teamId: teamIds['IT Support'], assignedTo: 'John Anderson' },
      { name: 'Laptop HP EliteBook', serialNumber: 'LAP-2024-002', department: 'IT', category: 'Electronics', location: 'Office 2A', teamId: teamIds['IT Support'], assignedTo: 'Sarah Johnson' },
      { name: 'Desktop Computer 01', serialNumber: 'DESK-2023-015', department: 'IT', category: 'Electronics', location: 'Office 1C', teamId: teamIds['IT Support'], assignedTo: 'IT Department' },
      { name: 'HP LaserJet Printer', serialNumber: 'PRT-2023-042', department: 'IT', category: 'Electronics', location: 'Office Main Floor', teamId: teamIds['IT Support'], assignedTo: 'IT Department' },
      { name: 'Canon Scanner', serialNumber: 'SCN-2022-028', department: 'IT', category: 'Electronics', location: 'Office Main Floor', teamId: teamIds['IT Support'], assignedTo: 'IT Department' },
      { name: 'Network Router Main', serialNumber: 'RTR-2021-001', department: 'IT', category: 'Electronics', location: 'Server Room', teamId: teamIds['IT Support'], assignedTo: 'IT Department' },
      { name: 'Network Switch 24-Port', serialNumber: 'SWT-2022-005', department: 'IT', category: 'Electronics', location: 'Server Room', teamId: teamIds['IT Support'], assignedTo: 'IT Department' },
      { name: 'Server Dell PowerEdge', serialNumber: 'SRV-2020-001', department: 'IT', category: 'Electronics', location: 'Server Room', teamId: teamIds['IT Support'], assignedTo: 'IT Department' },

      // Vehicles
      { name: 'Company Car Toyota Camry', serialNumber: 'CAR-2022-001', department: 'Logistics', category: 'Vehicles', location: 'Parking Lot A', teamId: teamIds['Vehicle Maintenance'], assignedTo: 'Logistics Department' },
      { name: 'Delivery Van Ford Transit', serialNumber: 'VAN-2021-003', department: 'Logistics', category: 'Vehicles', location: 'Parking Lot B', teamId: teamIds['Vehicle Maintenance'], assignedTo: 'Logistics Department' },
      { name: 'Forklift Toyota 3-Ton', serialNumber: 'FLT-2020-012', department: 'Warehouse', category: 'Vehicles', location: 'Warehouse Floor', teamId: teamIds['Vehicle Maintenance'], assignedTo: 'Warehouse Department' },
      { name: 'Delivery Truck Isuzu', serialNumber: 'TRK-2021-007', department: 'Logistics', category: 'Vehicles', location: 'Parking Lot C', teamId: teamIds['Vehicle Maintenance'], assignedTo: 'Logistics Department' },
      { name: 'Company Bike Yamaha', serialNumber: 'BIK-2023-002', department: 'Logistics', category: 'Vehicles', location: 'Parking Lot A', teamId: teamIds['Vehicle Maintenance'], assignedTo: 'Logistics Department' },

      // Electrical & Utility Equipment
      { name: 'Air Conditioner Office 01', serialNumber: 'AC-2023-101', department: 'Facilities', category: 'Electrical', location: 'Office Floor 1', teamId: teamIds['Electricians'], assignedTo: 'Facilities Team' },
      { name: 'Air Conditioner Office 02', serialNumber: 'AC-2023-102', department: 'Facilities', category: 'Electrical', location: 'Office Floor 2', teamId: teamIds['Electricians'], assignedTo: 'Facilities Team' },
      { name: 'Generator Backup 50KVA', serialNumber: 'GEN-2022-001', department: 'Facilities', category: 'Electrical', location: 'Building B Basement', teamId: teamIds['Electricians'], assignedTo: 'Facilities Team' },
      { name: 'UPS System 10KVA', serialNumber: 'UPS-2023-005', department: 'IT', category: 'Electrical', location: 'Server Room', teamId: teamIds['Electricians'], assignedTo: 'IT Department' },
      { name: 'Inverter 5KVA', serialNumber: 'INV-2022-003', department: 'Facilities', category: 'Electrical', location: 'Building A', teamId: teamIds['Electricians'], assignedTo: 'Facilities Team' },
      { name: 'Main Power Panel', serialNumber: 'PWR-2020-001', department: 'Facilities', category: 'Electrical', location: 'Electrical Room', teamId: teamIds['Electricians'], assignedTo: 'Facilities Team' },

      // Building & Facility Equipment
      { name: 'Elevator Main Building', serialNumber: 'ELV-2021-001', department: 'Facilities', category: 'Machinery', location: 'Main Building', teamId: teamIds['Facilities'], assignedTo: 'Facilities Team' },
      { name: 'Fire Extinguisher Set A', serialNumber: 'FIRE-2024-001', department: 'Facilities', category: 'Tools', location: 'Building A - All Floors', teamId: teamIds['Facilities'], assignedTo: 'Facilities Team' },
      { name: 'CCTV Camera System', serialNumber: 'CCTV-2023-001', department: 'Security', category: 'Electronics', location: 'Building Perimeter', teamId: teamIds['IT Support'], assignedTo: 'Security Department' },
      { name: 'Access Control System', serialNumber: 'ACS-2023-001', department: 'Security', category: 'Electronics', location: 'Main Entrance', teamId: teamIds['IT Support'], assignedTo: 'Security Department' },
      { name: 'Water Pump Main', serialNumber: 'WTR-2022-001', department: 'Facilities', category: 'Machinery', location: 'Building Basement', teamId: teamIds['Facilities'], assignedTo: 'Facilities Team' }
    ];

    let created = 0;
    let skipped = 0;

    for (const equip of equipment) {
      // Check if equipment already exists
      const checkResult = await pool.query(
        'SELECT id FROM equipment WHERE serial_number = $1',
        [equip.serialNumber]
      );

      if (checkResult.rows.length === 0) {
        await pool.query(
          `INSERT INTO equipment (name, serial_number, department, category, location, 
           assigned_to, team_id, purchase_date, warranty_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            equip.name,
            equip.serialNumber,
            equip.department,
            equip.category,
            equip.location,
            equip.assignedTo,
            equip.teamId,
            new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Random date within last 3 years
            new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 2) // Random date within next 2 years
          ]
        );
        created++;
        console.log(`  ✓ Created: ${equip.name}`);
      } else {
        skipped++;
        console.log(`  ⊙ Skipped (exists): ${equip.name}`);
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created} equipment items`);
    console.log(`   Skipped: ${skipped} equipment items (already exist)`);
    console.log(`   Total teams: ${Object.keys(teamIds).length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('\n🎉 Sample data seeded successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to seed data:', error);
      process.exit(1);
    });
}

module.exports = { seedData };

