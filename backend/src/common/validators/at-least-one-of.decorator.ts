import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

/**
 * This is a custom NestJS class-validator decorator that checks if at least one of the specified fields is present and not empty in the object being validated.
 * It can be used to enforce that at least one of a group of fields is provided in a request DTO.
 * Example usage:
 *  @AtLeastOneOf(['firstName', 'lastName', 'userId'], {
 *    message: 'At least one of firstName, lastName, or userId must be provided.',
 *  })
 * @param fields The fields to check for presence and non-empty values.
 * @param validationOptions Optional validation options to customize the error message and validation behavior.
 * @returns A property decorator function.
 */
export function AtLeastOneOf(
    fields: string[],
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'atLeastOneOf',
            target: (object as { constructor: Function }).constructor,
            propertyName,
            constraints: fields,
            options: validationOptions,
            validator: {
                validate(_value: unknown, args: ValidationArguments) {
                    const obj = args.object as Record<string, unknown>;
                    return fields.some(
                        (field) =>
                            obj[field] !== undefined &&
                            obj[field] !== null &&
                            obj[field] !== '',
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return `At least one of [${args.constraints.join(', ')}] must be provided.`;
                },
            },
        });
    };
}
