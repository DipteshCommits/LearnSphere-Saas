CREATE TABLE timetable_settings (
    id INT NOT NULL AUTO_INCREMENT,
    organization_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    school_days JSON NOT NULL,
    school_start_time TIME NOT NULL,
    period_duration_minutes SMALLINT NOT NULL,
    periods_per_day SMALLINT NOT NULL,
    lunch_after_period SMALLINT NOT NULL,
    lunch_duration_minutes SMALLINT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_timetable_settings_organization_year (organization_id, academic_year_id)
) ENGINE=InnoDB;

CREATE TABLE timetable_subject_loads (
    id INT NOT NULL AUTO_INCREMENT,
    organization_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    section_id INT NOT NULL,
    subject_id INT NOT NULL,
    periods_per_week SMALLINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_timetable_subject_load_section_subject
        (academic_year_id, section_id, subject_id)
) ENGINE=InnoDB;

CREATE TABLE timetable_entries (
    id INT NOT NULL AUTO_INCREMENT,
    organization_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    weekday VARCHAR(3) NOT NULL,
    period_number SMALLINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    section_id INT NOT NULL,
    grade_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_timetable_section_slot
        (academic_year_id, weekday, period_number, section_id),
    UNIQUE KEY uq_timetable_teacher_slot
        (academic_year_id, weekday, period_number, teacher_id),
    KEY idx_timetable_organization_year (organization_id, academic_year_id, weekday)
) ENGINE=InnoDB;
