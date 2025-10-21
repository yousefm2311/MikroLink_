import { body } from 'express-validator';

export const updateProfileValidator = [
  body('fullName').optional().isString(),
  body('phone').optional().isString(),
];

