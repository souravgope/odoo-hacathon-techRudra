const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', tm.id, 'name', tm.member_name)
                 ORDER BY tm.member_name
               ) FILTER (WHERE tm.id IS NOT NULL),
               '[]'
             ) as members,
             COUNT(r.id) FILTER (WHERE r.stage NOT IN ('Repaired', 'Scrap')) as active_requests_count
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN requests r ON r.team_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    
    // Transform members array
    const teams = result.rows.map(team => ({
      ...team,
      members: team.members.map(m => m.name)
    }));
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const membersResult = await pool.query(
      'SELECT member_name FROM team_members WHERE team_id = $1 ORDER BY member_name',
      [id]
    );

    const team = {
      ...teamResult.rows[0],
      members: membersResult.rows.map(m => m.member_name)
    };

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create team
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, color, members } = req.body;
    
    const teamResult = await client.query(
      'INSERT INTO teams (name, color) VALUES ($1, $2) RETURNING *',
      [name, color || '#3b82f6']
    );

    const teamId = teamResult.rows[0].id;

    if (members && members.length > 0) {
      const memberValues = members.map((member, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const memberParams = [teamId, ...members];
      await client.query(
        `INSERT INTO team_members (team_id, member_name) VALUES ${memberValues}`,
        memberParams
      );
    }

    await client.query('COMMIT');

    const team = {
      ...teamResult.rows[0],
      members: members || []
    };

    res.status(201).json(team);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating team:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Update team
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { name, color, members } = req.body;

    const teamResult = await client.query(
      'UPDATE teams SET name = $1, color = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, color, id]
    );

    if (teamResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete existing members
    await client.query('DELETE FROM team_members WHERE team_id = $1', [id]);

    // Insert new members
    if (members && members.length > 0) {
      const memberValues = members.map((member, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const memberParams = [id, ...members];
      await client.query(
        `INSERT INTO team_members (team_id, member_name) VALUES ${memberValues}`,
        memberParams
      );
    }

    await client.query('COMMIT');

    const team = {
      ...teamResult.rows[0],
      members: members || []
    };

    res.json(team);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating team:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM teams WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

