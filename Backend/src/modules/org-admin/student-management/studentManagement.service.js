import bcrypt from 'bcryptjs';
import {
    createStudentWithEnrollment,
    getStudentsWithFilters
} from "./studentManagement.repository.js";
import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';
import { findGradeByIdAndOrg } from '../../grade/grade.repository.js';
import { findSectionById } from '../../section/section.repository.js';

export const admitStudent = async ({
    organizationId,
    name,
    email,
    temporaryPassword,
    admissionNo,
    gradeId,
    sectionId,
    rollNo
}) => {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedAdmissionNo = typeof admissionNo === 'string' ? admissionNo.trim() : '';
    const normalizedRollNo = typeof rollNo === 'string' ? rollNo.trim() : '';

    if (!normalizedName || !normalizedEmail || !normalizedAdmissionNo
        || typeof temporaryPassword !== 'string' || temporaryPassword.length < 10
        || !gradeId || !sectionId) {
        const error = new Error('Name, email, admission number, temporary password (at least 10 characters), grade, and section are required');
        error.statusCode = 400;
        throw error;
    }

    if (normalizedName.length > 255 || normalizedEmail.length > 191
        || normalizedAdmissionNo.length > 50 || normalizedRollNo.length > 20
        || Buffer.byteLength(temporaryPassword, 'utf8') > 72) {
        const error = new Error('Some fields exceed their maximum allowed length');
        error.statusCode = 400;
        throw error;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        const error = new Error('Provide a valid email address');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before admitting students');
        error.statusCode = 400;
        throw error;
    }

    const grade = await findGradeByIdAndOrg(gradeId, organizationId);
    if (!grade || Number(grade.academic_year_id) !== Number(activeYear.id)) {
        const error = new Error('Grade not found for the active academic year');
        error.statusCode = 404;
        throw error;
    }

    const section = await findSectionById(sectionId, gradeId, activeYear.id);
    if (!section) {
        const error = new Error('Section not found for the selected grade and active academic year');
        error.statusCode = 404;
        throw error;
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    try {
        return await createStudentWithEnrollment({
            organizationId,
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
            admissionNo: normalizedAdmissionNo,
            academicYearId: activeYear.id,
            gradeId,
            sectionId,
            rollNo: normalizedRollNo
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const conflict = new Error('That email or admission number is already in use');
            conflict.statusCode = 409;
            throw conflict;
        }
        throw error;
    }
};

export const listStudents = async ({
    organizationId,
    academicYearId,
    gradeId,
    sectionId,
    search,
    status
}) => {
    // If academicYearId not passed → use active year
    if(!academicYearId){
        const activeYear = await findActiveYearByOrg(organizationId);


        if(!activeYear){
            const error = new Error("No active academic year found");
            error.statusCode = 400;
            throw error;
        }

        academicYearId = activeYear.id;
    }


    return await getStudentsWithFilters({
        organizationId,
        academicYearId,
        gradeId,
        sectionId,
        search,
        status
    });
};