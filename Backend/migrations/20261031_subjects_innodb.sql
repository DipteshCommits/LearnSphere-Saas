ALTER TABLE subjects
ENGINE = InnoDB;

ALTER TABLE grade_subjects
ENGINE = InnoDB;

ALTER TABLE subjects
ADD CONSTRAINT uq_subjects_organization_name
UNIQUE (organization_id, subject_name);
