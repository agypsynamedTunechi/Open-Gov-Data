-- schema.sql
-- Open Government Data Visualization System — Edo State
-- Target: MySQL 8.0+ (works with phpMyAdmin / XAMPP out of the box)
--
-- Run this whole file once to create the database and all tables.
-- Then run seed data at the bottom to load the 18 LGAs + real FAAC figures.

CREATE DATABASE IF NOT EXISTS edo_dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE edo_dashboard;

-- ---------------------------------------------------------------
-- Core table: one row per LGA. Every category table references this.
-- ---------------------------------------------------------------
CREATE TABLE lgas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  area_km2      DECIMAL(10,2),
  headquarters  VARCHAR(100)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Category tables — each mirrors a section of data.js
-- ---------------------------------------------------------------
CREATE TABLE demographics (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  lga_id               INT NOT NULL,
  population           INT,
  population_density   DECIMAL(10,2),
  male_female_ratio     DECIMAL(6,2),
  year                 YEAR NOT NULL,
  FOREIGN KEY (lga_id) REFERENCES lgas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_lga_year (lga_id, year)
) ENGINE=InnoDB;

CREATE TABLE education (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  lga_id                   INT NOT NULL,
  primary_schools          INT,
  secondary_schools        INT,
  teachers                 INT,
  student_teacher_ratio    DECIMAL(6,2),
  year                     YEAR NOT NULL,
  FOREIGN KEY (lga_id) REFERENCES lgas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_lga_year (lga_id, year)
) ENGINE=InnoDB;

CREATE TABLE health (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  lga_id             INT NOT NULL,
  health_facilities  INT,
  health_workers     INT,
  year               YEAR NOT NULL,
  FOREIGN KEY (lga_id) REFERENCES lgas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_lga_year (lga_id, year)
) ENGINE=InnoDB;

CREATE TABLE economy (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  lga_id                  INT NOT NULL,
  faac_allocation_million DECIMAL(10,2),
  cooperative_societies   INT,
  registered_markets      INT,
  month_year              VARCHAR(20) NOT NULL,
  FOREIGN KEY (lga_id) REFERENCES lgas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_lga_month (lga_id, month_year)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Admin panel support
-- ---------------------------------------------------------------
CREATE TABLE admins (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(50) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE import_logs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  admin_id       INT NOT NULL,
  filename       VARCHAR(255),
  imported_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  records_count  INT,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =================================================================
-- SEED DATA
-- =================================================================

-- 18 LGAs (names must match data.js exactly for a clean migration later)
INSERT INTO lgas (name) VALUES
  ('Oredo'),
  ('Ikpoba Okha'),
  ('Akoko Edo'),
  ('Egor'),
  ('Ovia South West'),
  ('Etsako West'),
  ('Orhionmwon'),
  ('Ovia North East'),
  ('Esan South East'),
  ('Owan East'),
  ('Uhunmwonde'),
  ('Etsako East'),
  ('Esan West'),
  ('Esan North East'),
  ('Etsako Central'),
  ('Owan West'),
  ('Esan Central'),
  ('Igueben');

-- Real FAAC allocation data (April 2026, source: OurLgaMoni.com)
-- Uses subqueries to look up each lga_id by name, so row order doesn't matter.
INSERT INTO economy (lga_id, faac_allocation_million, month_year)
SELECT id, 709.30, 'April 2026' FROM lgas WHERE name = 'Oredo'
UNION ALL SELECT id, 694.26, 'April 2026' FROM lgas WHERE name = 'Ikpoba Okha'
UNION ALL SELECT id, 643.23, 'April 2026' FROM lgas WHERE name = 'Akoko Edo'
UNION ALL SELECT id, 640.57, 'April 2026' FROM lgas WHERE name = 'Egor'
UNION ALL SELECT id, 557.30, 'April 2026' FROM lgas WHERE name = 'Ovia South West'
UNION ALL SELECT id, 554.97, 'April 2026' FROM lgas WHERE name = 'Etsako West'
UNION ALL SELECT id, 553.85, 'April 2026' FROM lgas WHERE name = 'Orhionmwon'
UNION ALL SELECT id, 528.66, 'April 2026' FROM lgas WHERE name = 'Ovia North East'
UNION ALL SELECT id, 517.05, 'April 2026' FROM lgas WHERE name = 'Esan South East'
UNION ALL SELECT id, 513.23, 'April 2026' FROM lgas WHERE name = 'Owan East'
UNION ALL SELECT id, 511.78, 'April 2026' FROM lgas WHERE name = 'Uhunmwonde'
UNION ALL SELECT id, 506.88, 'April 2026' FROM lgas WHERE name = 'Etsako East'
UNION ALL SELECT id, 453.71, 'April 2026' FROM lgas WHERE name = 'Esan West'
UNION ALL SELECT id, 446.85, 'April 2026' FROM lgas WHERE name = 'Esan North East'
UNION ALL SELECT id, 445.92, 'April 2026' FROM lgas WHERE name = 'Etsako Central'
UNION ALL SELECT id, 435.61, 'April 2026' FROM lgas WHERE name = 'Owan West'
UNION ALL SELECT id, 434.85, 'April 2026' FROM lgas WHERE name = 'Esan Central'
UNION ALL SELECT id, 418.36, 'April 2026' FROM lgas WHERE name = 'Igueben';

-- NOTE: demographics / education / health tables are intentionally left
-- empty for now — real data is pending (NBS site down, see project notes).
-- Once sourced, insert the same way as the economy data above.

-- NOTE: no admin row is seeded here on purpose. Never store a real password
-- or a fake placeholder hash in a file you might commit to git or submit
-- as a project deliverable. Create the first admin from application code
-- (server-side, using bcrypt) once the backend exists — see app.js/api
-- setup in the next phase.
