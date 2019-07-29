import {
  registerDecorator,
  ValidationOptions,
  Validator
} from 'class-validator'

const validator = new Validator()

export function IsIntString(
  validationOptions?: ValidationOptions
): (object: Record<string, unknown>, propertyName: string) => void {
  return function(object: Record<string, unknown>, propertyName: string): void {
    registerDecorator({
      name: 'isIntString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && validator.isInt(Number(value))
        }
      }
    })
  }
}
