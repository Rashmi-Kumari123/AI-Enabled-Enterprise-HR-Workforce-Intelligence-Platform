CREATE TABLE performance_reviews (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT       NOT NULL,
    reviewer_email  VARCHAR(255) NOT NULL,
    review_year     INT          NOT NULL,
    review_quarter  INT          NOT NULL,
    goals           VARCHAR(2048),
    summary_comment VARCHAR(2048),
    overall_rating  NUMERIC(3, 2),
    status          VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    submitted_at    TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_review_quarter CHECK (review_quarter BETWEEN 1 AND 4),
    CONSTRAINT chk_review_year CHECK (review_year >= 2000),
    CONSTRAINT uq_review_employee_period UNIQUE (employee_id, review_year, review_quarter)
);

CREATE TABLE performance_ratings (
    id          BIGSERIAL PRIMARY KEY,
    review_id   BIGINT       NOT NULL REFERENCES performance_reviews (id) ON DELETE CASCADE,
    criterion   VARCHAR(64)  NOT NULL,
    score       INT          NOT NULL,
    comment     VARCHAR(512),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rating_score CHECK (score BETWEEN 1 AND 5),
    CONSTRAINT uq_rating_review_criterion UNIQUE (review_id, criterion)
);

CREATE INDEX idx_performance_reviews_employee ON performance_reviews (employee_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews (status);
CREATE INDEX idx_performance_ratings_review ON performance_ratings (review_id);
