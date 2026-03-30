-- =========================================================
--  MEENAAKSHI CAFE CORNER — Supabase (PostgreSQL) Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- =========================================================

CREATE TABLE IF NOT EXISTS feedbacks (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120)  NOT NULL,
    email       VARCHAR(150)  DEFAULT NULL,
    phone       VARCHAR(20)   DEFAULT NULL,
    visit_type  VARCHAR(50)   DEFAULT 'Dine-in',
    rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message     TEXT          NOT NULL,
    created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_rating     ON feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_created_at ON feedbacks(created_at DESC);