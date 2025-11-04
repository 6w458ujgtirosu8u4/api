-- Migration number: 0001 	 2025-10-26T09:26:23.090Z

-- Drop existing tables if they exist

DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS organizations;

-- Create tables

CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    status INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,

    CHECK(status IN (0,1,2))
);

CREATE TABLE companies (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL UNIQUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,

    FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Create indexes

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);

CREATE INDEX idx_companies_slug ON companies(name);