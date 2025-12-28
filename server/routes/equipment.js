const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all equipment
router.get('/', async (req, res) => {
  try {
    const { department, assignedTo, search } = req.query;
    let query = `
      SELECT e.*, t.name as team_name, t.color as team_color,
             COUNT(r.id) FILTER (WHERE r.stage NOT IN ('Repaired', 'Scrap')) as open_requests_count
      FROM equipment e
      LEFT JOIN teams t ON e.team_id = t.id
      LEFT JOIN requests r ON r.equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (department) {
      query += ` AND e.department = $${paramCount++}`;
      params.push(department);
    }

    if (assignedTo) {
      query += ` AND e.assigned_to = $${paramCount++}`;
      params.push(assignedTo);
    }

    if (search) {
      query += ` AND (e.name ILIKE $${paramCount} OR e.serial_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY e.id, t.id ORDER BY e.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single equipment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, t.name as team_name, t.color as team_color
       FROM equipment e
       LEFT JOIN teams t ON e.team_id = t.id
       WHERE e.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create equipment
router.post('/', async (req, res) => {
  try {
    const {
      name,
      serialNumber,
      department,
      category,
      location,
      assignedTo,
      purchaseDate,
      warrantyDate,
      teamId
    } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment (name, serial_number, department, category, location, 
       assigned_to, purchase_date, warranty_date, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, serialNumber, department, category, location, assignedTo, purchaseDate, warrantyDate, teamId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update equipment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      serialNumber,
      department,
      category,
      location,
      assignedTo,
      purchaseDate,
      warrantyDate,
      teamId
    } = req.body;

    const result = await pool.query(
      `UPDATE equipment 
       SET name = $1, serial_number = $2, department = $3, category = $4, 
           location = $5, assigned_to = $6, purchase_date = $7, 
           warranty_date = $8, team_id = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, serialNumber, department, category, location, assignedTo, purchaseDate, warrantyDate, teamId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get requests for specific equipment
router.get('/:id/requests', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.*, e.name as equipment_name, t.name as team_name, t.color as team_color
       FROM requests r
       LEFT JOIN equipment e ON r.equipment_id = e.id
       LEFT JOIN teams t ON r.team_id = t.id
       WHERE r.equipment_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

