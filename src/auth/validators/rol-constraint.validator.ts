import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidRoles } from '../types';

@ValidatorConstraint({ async: false })
export class IsValidRoleConstraint implements ValidatorConstraintInterface {
    validate(roles: ValidRoles[]) {
        return roles.every(role => Object.values(ValidRoles).includes(role));
    }

    defaultMessage() {
        return `Invalid role provided. Accepted roles: ${Object.values(ValidRoles).join(', ')}`;
    }
}

export function IsValidRole(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidRoleConstraint,
        });
    };
}