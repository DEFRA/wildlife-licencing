create table if not exists application (
    id uuid,
    created date not null default current_timestamp,
    updated date not null default current_timestamp,
    sdds_id uuid,
    application jsonb,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX title_idx ON application (sdds_id);
