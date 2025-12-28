-- Create database schema for GearGuard

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    purchase_date DATE,
    warranty_date DATE,
    team_id INTEGER,
    is_scrapped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Corrective', 'Preventive')),
    stage VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (stage IN ('New', 'In Progress', 'Repaired', 'Scrap')),
    priority VARCHAR(10) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    scheduled_date DATE,
    assigned_to VARCHAR(255),
    duration DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for equipment team_id
ALTER TABLE equipment ADD CONSTRAINT fk_equipment_team 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(department);
CREATE INDEX IF NOT EXISTS idx_equipment_team ON equipment(team_id);
CREATE INDEX IF NOT EXISTS idx_requests_equipment ON requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_requests_team ON requests(team_id);
CREATE INDEX IF NOT EXISTS idx_requests_stage ON requests(stage);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_scheduled_date ON requests(scheduled_date);

