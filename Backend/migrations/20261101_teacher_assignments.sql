CREATE TABLE teacher_assignments (
    id INT NOT NULL AUTO_INCREMENT,
    organization_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    grade_id INT NOT NULL,
    section_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_teacher_assignments_section_subject_year
        (academic_year_id, section_id, subject_id),
    KEY idx_teacher_assignments_organization_year (organization_id, academic_year_id),
    KEY idx_teacher_assignments_teacher_year (teacher_id, academic_year_id)
) ENGINE=InnoDB;
