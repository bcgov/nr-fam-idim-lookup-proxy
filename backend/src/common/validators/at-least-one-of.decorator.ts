import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

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
