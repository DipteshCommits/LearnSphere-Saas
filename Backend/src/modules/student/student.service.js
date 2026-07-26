import {findActiveStudentsByOrganization} from './student.repository.js';

export const getActiveStudents = async (organizationId) =>{
    if(!organizationId){
        const error = new Error('Organization ID is required');
        error.statusCode = 400;
        throw error;
    }

    const students = await findActiveStudentsByOrganization(organizationId);

    return students;
}