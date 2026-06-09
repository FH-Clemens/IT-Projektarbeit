
import { hashPassword } from "../auth/hash.js";
import { isNonBlankString, isPositiveInteger, Result, ResultPage} from "../../utils.js";
import ROLES from "../auth/roles.js";

import {
    createEmployee as persistEmployee,
    findEmployeeById,
    getEmployeePage as fetchEmployeePage,
    deleteEmployeeById as removeEmployee, employeeExistsById
} from "./persistence.js";


export async function createEmployee(name, email, password, role) {

    if (!isNonBlankString(name)) return Result.fail('Name must be non blank string');
    if (!isNonBlankString(email)) return Result.fail('Email must be non blank string');

    if (!isNonBlankString(password)) {
        return Result.fail('Password can not be blank');
    }

    if (password.length < 12) {
        return Result.fail('Password must be at least 12 characters long.');
    }

    const allowedRoles = Object.values(ROLES);

    if (!allowedRoles.includes(role)) {
        return Result.fail(`Invalid role. Must be one of [${allowedRoles.join(',')}]`);
    }

    return hashPassword(password)
        .then(passwordHash => persistEmployee(name, email, passwordHash, role))
        .then(Result.ok);
}

export async function getEmployeePage(size, offset) {

    if (!size || isNaN(size)) size = 20;
    if (!offset || isNaN(offset)) offset = 0;

    if (!isPositiveInteger(size)) {
        return Result.fail('Invalid page size. Must be positive integer.');
    }

    if (!isPositiveInteger(offset)) {
        return Result.fail('Invalid page offset. Must be positive integer.');
    }

    return fetchEmployeePage(size, offset).then(employees => ResultPage.of(employees, size, offset));
}

export async function getEmployeeById(id) {

    if (!isPositiveInteger(id)) {
        return Result.fail('id must be positive integer');
    }

    return findEmployeeById(id).then(Result.ok);
}

export async function deleteEmployeeById(id){

    if (!isPositiveInteger(id)) {
        return Result.fail('id must be positive integer');
    }

    return employeeExistsById(id).then(exists => {
        if (!exists) return Result.fail(`Employee with id ${id} not found.`);
        return removeEmployee(id).then(didDelete => didDelete ? Result.ok() : Result.fail('Failed to delete Employee.'));
    })
}


