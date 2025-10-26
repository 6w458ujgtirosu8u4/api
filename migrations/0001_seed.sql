-- Migration number: 0001 	 2025-10-26T09:26:23.090Z

-- Drop existing tables if they exist

DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS tenants;

-- Create tables

CREATE TABLE tenants (
    tid TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    status INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,

    CHECK(status IN (0,1,2))
);

CREATE TABLE companies (
    cid TEXT PRIMARY KEY,
    tid TEXT NOT NULL,
    name TEXT NOT NULL UNIQUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,

    FOREIGN KEY(tid) REFERENCES tenants(tid)
);

-- Create indexes

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

CREATE INDEX idx_companies_slug ON companies(name);