import {registerDecorator, ValidationOptions, ValidationArguments, Validator} from 'class-validator'

const validator = new Validator()

export function IsIntString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isIntString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator:{
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' &&
            validator.isInt(Number(value))
        }
      }
    })
  }
}
