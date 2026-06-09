

export async function createEmployee(name, email, password, role) {

    if (typeof name !== 'string' || name.trim() === '') {
        throw new Error('Failed to create employee: name must be non blank string');
    }

    if (typeof email !== 'string' || email.trim() === '') {
        throw new Error('Failed to create employee: name must be non blank string');
    }

    if (typeof password !== 'string' || password.trim() === '') {
        throw new Error('Failed to create employee: password must be non blank string');
    }


}