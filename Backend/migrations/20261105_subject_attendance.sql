CREATE TABLE attendance_grade_settings (
    id INT NOT NULL AUTO_INCREMENT,
    organization_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    grade_id INT NOT NULL,
    attendance_mode ENUM('DAILY', 'SUBJECT') NOT NULL DEFAULT 'DAILY',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_attendance_grade_settings_year_grade (academic_year_id, grade_id)
) ENGINE=InnoDB;

ALTER TABLE attendance_records
    ADD COLUMN timetable_entry_id INT NOT NULL DEFAULT 0 AFTER section_id,
    DROP INDEX uq_attendance_student_day,
    ADD UNIQUE KEY uq_attendance_student_slot
        (academic_year_id, attendance_date, student_id, timetable_entry_id);
