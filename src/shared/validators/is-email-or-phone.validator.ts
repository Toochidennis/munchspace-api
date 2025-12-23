import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import validator from 'validator';

@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
export class IsEmailOrPhone implements ValidatorConstraintInterface {
  validate(value: string) {
    return validator.isEmail(value) || validator.isMobilePhone(value, 'any');
  }

  defaultMessage() {
    return 'Identifier must be a valid email or phone number';
  }
}
