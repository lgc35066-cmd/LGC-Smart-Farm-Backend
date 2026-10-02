-- LGC Smart Farm OS — Pilot schema (Irrigation module)
-- Run once against your PostgreSQL database.

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    role          VARCHAR(40)  NOT NULL DEFAULT 'operator', -- manager | irrigation_officer | energy_officer | technician
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zones (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,       -- e.g. 'Zone 01'
    crop_type     VARCHAR(80),
    area_hectares NUMERIC(6,2) DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moisture_readings (
    id           SERIAL PRIMARY KEY,
    zone_id      INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    moisture_pct NUMERIC(5,2) NOT NULL,       -- 0-100
    temperature_c NUMERIC(5,2),
    source       VARCHAR(40) DEFAULT 'sensor', -- sensor | manual
    recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS irrigation_actions (
    id              SERIAL PRIMARY KEY,
    zone_id         INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    triggered_by    INTEGER REFERENCES users(id),
    duration_minutes INTEGER NOT NULL DEFAULT 10,
    status          VARCHAR(20) NOT NULL DEFAULT 'completed', -- queued | running | completed | failed
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_zone_time ON moisture_readings(zone_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_zone_time ON irrigation_actions(zone_id, created_at DESC);

-- Seed a couple of demo zones (matches the frontend demo: Zone 01 / Zone 02)
INSERT INTO zones (name, crop_type, area_hectares)
VALUES ('Zone 01', 'خضروات', 3.5),
       ('Zone 02', 'أشجار مثمرة', 4.0)
ON CONFLICT DO NOTHING;
