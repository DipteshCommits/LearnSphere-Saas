CREATE TABLE attendance_records (
    id INT NOT NULL AUTO_INCREMENT,
    organization_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    section_id INT NOT NULL,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    marked_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_attendance_student_day (academic_year_id, attendance_date, student_id),
    KEY idx_attendance_section_day (organization_id, academic_year_id, section_id, attendance_date),
    KEY idx_attendance_student_history (student_id, attendance_date)
) ENGINE=InnoDB;
