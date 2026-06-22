CREATE TABLE subscription_plans (
    id           BIGSERIAL PRIMARY KEY,
    code         VARCHAR(32)  NOT NULL UNIQUE,
    name         VARCHAR(128) NOT NULL,
    max_seats    INT          NOT NULL,
    price_inr    NUMERIC(12, 2) NOT NULL DEFAULT 0
);
CREATE TABLE organizations (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(64)  NOT NULL UNIQUE,
    status       VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    plan_id      BIGINT       NOT NULL REFERENCES subscription_plans (id),
    seat_count   INT          NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
INSERT INTO subscription_plans (code, name, max_seats, price_inr)
VALUES ('STARTER', 'Starter', 50, 4999.00),
       ('BUSINESS', 'Business', 500, 19999.00),
       ('ENTERPRISE', 'Enterprise', 5000, 99999.00);

INSERT INTO organizations (name, slug, status, plan_id, seat_count)
VALUES ('NexusHR Demo', 'nexushr', 'ACTIVE', 1, 0);

ALTER TABLE users ADD COLUMN tenant_id BIGINT REFERENCES organizations (id);
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX idx_users_tenant_email ON users (tenant_id, email);
CREATE INDEX idx_users_tenant_id ON users (tenant_id);

INSERT INTO roles (name, description)
VALUES ('ROLE_PLATFORM_ADMIN', 'NexusHR platform operator')
ON CONFLICT (name) DO NOTHING;
