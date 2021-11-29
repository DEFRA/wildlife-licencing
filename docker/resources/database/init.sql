create table if not exists users (
   id uuid,
   created timestamp not null default current_timestamp,
   updated timestamp not null default current_timestamp,
   sdds_id uuid,
   PRIMARY KEY (id)
);

create table if not exists applications (
    id uuid,
    created timestamp not null default current_timestamp,
    updated timestamp not null default current_timestamp,
    sdds_id uuid,
    user_id uuid,
    application jsonb,
    submited boolean not null default false,
    PRIMARY KEY (id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE UNIQUE INDEX title_idx ON applications (sdds_id);
