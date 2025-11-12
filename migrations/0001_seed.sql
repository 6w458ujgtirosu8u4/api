-- Migration number: 0001 	 2025-10-26T09:26:23.090Z

-- Drop existing tables if they exist

DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS organization_settings;
DROP TABLE IF EXISTS mail_queue;
DROP TABLE IF EXISTS mail_templates;
DROP TABLE IF EXISTS campaign_steps;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS lists_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS companies_lists;
DROP TABLE IF EXISTS lists;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS legal_types;
DROP TABLE IF EXISTS organizations;


-- Organizations
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    status INTEGER NOT NULL DEFAULT 1,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    CHECK(status IN (0,1,2))
);

CREATE TABLE legal_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE companies (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        legal_type_id TEXT NOT NULL,

        name TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL UNIQUE,
        website TEXT UNIQUE,
        vat TEXT UNIQUE,
        registration_date TEXT,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(organization_id) REFERENCES organizations(id),
        FOREIGN KEY(legal_type_id) REFERENCES legal_types(id)
) STRICT;

-- Users
CREATE TABLE users (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        role TEXT,
        status INTEGER NOT NULL DEFAULT 1,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

    FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Lists
CREATE TABLE lists (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        display_name TEXT,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(organization_id) REFERENCES organizations(id),

        UNIQUE(organization_id, name)
);

-- Companies <-> Lists many-to-many
CREATE TABLE companies_lists (
        company_id TEXT NOT NULL,
        list_id TEXT NOT NULL,
        created_at TEXT DEFAULT current_timestamp,

        PRIMARY KEY(company_id, list_id),
        FOREIGN KEY(company_id) REFERENCES companies(id),
        FOREIGN KEY(list_id) REFERENCES lists(id)
);

-- Tags and Lists <-> Tags many-to-many
CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        display_name TEXT,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(organization_id) REFERENCES organizations(id),

        UNIQUE(organization_id, name)
);

CREATE TABLE lists_tags (
        list_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        created_at TEXT DEFAULT current_timestamp,

        PRIMARY KEY(list_id, tag_id),
        FOREIGN KEY(list_id) REFERENCES lists(id),
        FOREIGN KEY(tag_id) REFERENCES tags(id)
);

-- Campaigns and steps
CREATE TABLE campaigns (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status INTEGER NOT NULL DEFAULT 0,
        start_date TEXT,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(organization_id) REFERENCES organizations(id),
        CHECK(status IN (0,1,2))
);

CREATE TABLE campaign_steps (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        subject TEXT,
        body TEXT,
        delay_seconds INTEGER DEFAULT 0,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
);

-- Mail templates & queue
CREATE TABLE mail_templates (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        subject TEXT,
        body TEXT,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(organization_id) REFERENCES organizations(id),
        UNIQUE(organization_id, name)
);

CREATE TABLE mail_queue (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        campaign_id TEXT,
        recipient_email TEXT NOT NULL,
        subject TEXT,
        body TEXT,
        status INTEGER NOT NULL DEFAULT 0,
        scheduled_at TEXT,
        sent_at TEXT,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        FOREIGN KEY(organization_id) REFERENCES organizations(id),
        FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
);

-- Organization and User settings (key/value). Values can be stored as TEXT or INTEGER (feature flags).
CREATE TABLE organization_settings (
        organization_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value_text TEXT,
        value_int INTEGER,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        PRIMARY KEY(organization_id, key),
        FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE user_settings (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value_text TEXT,
        value_int INTEGER,

        created_at TEXT DEFAULT current_timestamp,
        updated_at TEXT,

        PRIMARY KEY(user_id, key),
        FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Create indexes

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);

CREATE INDEX idx_companies_org ON companies(organization_id);
CREATE INDEX idx_companies_legal_type ON companies(legal_type_id);

CREATE INDEX idx_users_org ON users(organization_id);

CREATE INDEX idx_lists_org ON lists(organization_id);

CREATE INDEX idx_tags_org ON tags(organization_id);

CREATE INDEX idx_campaigns_org ON campaigns(organization_id);

CREATE INDEX idx_campaign_steps_campaign_order ON campaign_steps(campaign_id, step_order);

CREATE INDEX idx_mail_queue_status ON mail_queue(status);
CREATE INDEX idx_mail_queue_scheduled ON mail_queue(scheduled_at);


INSERT INTO legal_types (id, name) VALUES ('lt-0001', 'LLC');