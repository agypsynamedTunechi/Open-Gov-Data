-- schema_postgres.sql
-- PostgreSQL version of the Edo Dashboard schema, for hosted deployment
-- (e.g. Render's free PostgreSQL tier). The local development schema
-- remains MySQL (schema.sql) -- see Chapter 3 for why MySQL was chosen
-- for local development. This file exists only because free hosted MySQL
-- was found to be unreliable; the data model itself is unchanged, only
-- the SQL dialect differs (SERIAL instead of AUTO_INCREMENT, YEAR becomes
-- SMALLINT since Postgres has no YEAR type, etc).
--
-- Render (and most hosted Postgres providers) create the database for you
-- and give you a connection string -- there is no CREATE DATABASE step
-- here, unlike schema.sql. Just run this against the database they provision.

CREATE TABLE lgas (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  area_km2      DECIMAL(10,2),
  headquarters  VARCHAR(100)
);

CREATE TABLE demographics (
  id                   SERIAL PRIMARY KEY,
  lga_id               INT NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
  population           INT,
  population_density   DECIMAL(10,2),
  male_female_ratio    DECIMAL(6,2),
  year                 SMALLINT NOT NULL,
  UNIQUE (lga_id, year)
);

CREATE TABLE education (
  id                       SERIAL PRIMARY KEY,
  lga_id                   INT NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
  primary_schools          INT,
  secondary_schools        INT,
  teachers                 INT,
  student_teacher_ratio    DECIMAL(6,2),
  year                     SMALLINT NOT NULL,
  UNIQUE (lga_id, year)
);

CREATE TABLE health (
  id                 SERIAL PRIMARY KEY,
  lga_id             INT NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
  health_facilities  INT,
  health_workers     INT,
  year               SMALLINT NOT NULL,
  UNIQUE (lga_id, year)
);

CREATE TABLE economy (
  id                      SERIAL PRIMARY KEY,
  lga_id                  INT NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
  faac_allocation_million DECIMAL(10,2),
  cooperative_societies   INT,
  registered_markets      INT,
  month_year              VARCHAR(20) NOT NULL,
  UNIQUE (lga_id, month_year)
);

CREATE TABLE admins (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(50) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE import_logs (
  id             SERIAL PRIMARY KEY,
  admin_id       INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  filename       VARCHAR(255),
  imported_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  records_count  INT
);

-- Seed: 18 LGAs (must match schema.sql exactly)
INSERT INTO lgas (name) VALUES
  ('Oredo'), ('Ikpoba Okha'), ('Akoko Edo'), ('Egor'), ('Ovia South West'),
  ('Etsako West'), ('Orhionmwon'), ('Ovia North East'), ('Esan South East'),
  ('Owan East'), ('Uhunmwonde'), ('Etsako East'), ('Esan West'),
  ('Esan North East'), ('Etsako Central'), ('Owan West'), ('Esan Central'), ('Igueben');

-- Seed: real FAAC allocation data (April 2026, OurLgaMoni.com)
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
