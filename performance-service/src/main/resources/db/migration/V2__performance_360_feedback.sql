CREATE TABLE performance_feedback (
    id                BIGSERIAL PRIMARY KEY,
    review_id         BIGINT       NOT NULL REFERENCES performance_reviews (id) ON DELETE CASCADE,
    respondent_email  VARCHAR(255) NOT NULL,
    feedback_type     VARCHAR(32)  NOT NULL,
    status            VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    summary_comment   VARCHAR(2048),
    overall_rating    NUMERIC(3, 2),
    submitted_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_feedback_type CHECK (feedback_type IN ('SELF', 'MANAGER', 'PEER', 'DIRECT_REPORT')),
    CONSTRAINT chk_feedback_status CHECK (status IN ('PENDING', 'SUBMITTED')),
    CONSTRAINT uq_feedback_review_respondent UNIQUE (review_id, respondent_email)
);
CREATE TABLE performance_feedback_ratings (
    id           BIGSERIAL PRIMARY KEY,
    feedback_id  BIGINT      NOT NULL REFERENCES performance_feedback (id) ON DELETE CASCADE,
    criterion    VARCHAR(64) NOT NULL,
    score        INT         NOT NULL,
    comment      VARCHAR(512),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_feedback_rating_score CHECK (score BETWEEN 1 AND 5),
    CONSTRAINT uq_feedback_rating_criterion UNIQUE (feedback_id, criterion)
);
CREATE INDEX idx_performance_feedback_review ON performance_feedback (review_id);
CREATE INDEX idx_performance_feedback_respondent ON performance_feedback (respondent_email);
CREATE INDEX idx_performance_feedback_status ON performance_feedback (status);
