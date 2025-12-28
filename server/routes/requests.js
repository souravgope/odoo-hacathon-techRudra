const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { stage, teamId, equipmentId, type, search } = req.query;
    let query = `
      SELECT r.*, 
             e.name as equipment_name, e.serial_number as equipment_serial,
             t.name as team_name, t.color as team_color
      FROM requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN teams t ON r.team_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (stage) {
      query += ` AND r.stage = $${paramCount++}`;
      params.push(stage);
    }

    if (teamId) {
      query += ` AND r.team_id = $${paramCount++}`;
      params.push(teamId);
    }

    if (equipmentId) {
      query += ` AND r.equipment_id = $${paramCount++}`;
      params.push(equipmentId);
    }

    if (type) {
      query += ` AND r.type = $${paramCount++}`;
      params.push(type);
    }

    if (search) {
      query += ` AND r.subject ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.*, 
              e.name as equipment_name, e.serial_number as equipment_serial,
              t.name as team_name, t.color as team_color
       FROM requests r
       LEFT JOIN equipment e ON r.equipment_id = e.id
       LEFT JOIN teams t ON r.team_id = t.id
       WHERE r.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create request
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      subject,
      equipmentId,
      teamId,
      type,
      priority,
      scheduledDate,
      assignedTo,
      duration,
      description
    } = req.body;

    // Auto-fill team from equipment if not provided
    let finalTeamId = teamId;
    if (!finalTeamId && equipmentId) {
      const equipResult = await client.query(
        'SELECT team_id FROM equipment WHERE id = $1',
        [equipmentId]
      );
      if (equipResult.rows.length > 0 && equipResult.rows[0].team_id) {
        finalTeamId = equipResult.rows[0].team_id;
      }
    }

    const result = await client.query(
      `INSERT INTO requests (subject, equipment_id, team_id, type, priority, 
       scheduled_date, assigned_to, duration, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [subject, equipmentId, finalTeamId, type, priority, scheduledDate, assignedTo, duration || 0, description]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Update request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject,
      equipmentId,
      teamId,
      type,
      stage,
      priority,
      scheduledDate,
      assignedTo,
      duration,
      description
    } = req.body;

    const result = await pool.query(
      `UPDATE requests 
       SET subject = $1, equipment_id = $2, team_id = $3, type = $4, 
           stage = $5, priority = $6, scheduled_date = $7, assigned_to = $8, 
           duration = $9, description = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [subject, equipmentId, teamId, type, stage, priority, scheduledDate, assignedTo, duration, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // If moved to Scrap, mark equipment as scrapped
    if (stage === 'Scrap' && equipmentId) {
      await pool.query(
        'UPDATE equipment SET is_scrapped = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [equipmentId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request stage (for drag and drop)
router.patch('/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, equipmentId } = req.body;

    const result = await pool.query(
      `UPDATE requests 
       SET stage = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [stage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // If moved to Scrap, mark equipment as scrapped
    if (stage === 'Scrap' && equipmentId) {
      await pool.query(
        'UPDATE equipment SET is_scrapped = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [equipmentId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating request stage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM requests WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE stage NOT IN ('Repaired', 'Scrap')) as active_requests,
        COUNT(*) FILTER (WHERE stage = 'New') as new_requests,
        COUNT(*) FILTER (WHERE stage = 'In Progress') as in_progress_requests,
        COUNT(*) FILTER (WHERE stage = 'Repaired') as repaired_requests,
        COUNT(*) FILTER (WHERE scheduled_date < CURRENT_DATE AND stage NOT IN ('Repaired', 'Scrap')) as overdue_requests
      FROM requests
    `);
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

