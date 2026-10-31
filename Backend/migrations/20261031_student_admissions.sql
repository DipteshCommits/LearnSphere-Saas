ALTER TABLE users
ENGINE = InnoDB;

ALTER TABLE students
ENGINE = InnoDB;

ALTER TABLE enrollments
ENGINE = InnoDB;

ALTER TABLE users
ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE sections
MODIFY section_name VARCHAR(50) NOT NULL;
