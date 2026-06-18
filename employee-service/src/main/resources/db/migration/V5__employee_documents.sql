CREATE TABLE employee_documents (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT       NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    stored_file_name    VARCHAR(255) NOT NULL,
    original_file_name  VARCHAR(255) NOT NULL,
    content_type        VARCHAR(128),
    file_size           BIGINT       NOT NULL,
    document_type       VARCHAR(64)  NOT NULL DEFAULT 'GENERAL',
    uploaded_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_employee_documents_employee ON employee_documents (employee_id);
