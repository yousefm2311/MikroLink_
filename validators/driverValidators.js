import { body, param } from 'express-validator';

export const signupValidator = [
  body('fullName').trim().notEmpty().withMessage('fullName is required'),
  body('phone').trim().notEmpty().withMessage('phone is required'),
  body('email').isEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('password min length is 6'),
];

export const resendVerificationValidator = [
  body('email').isEmail().withMessage('valid email is required'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('valid email is required'),
  body('password').notEmpty().withMessage('password is required'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('valid email is required'),
];

export const verifyResetCodeValidator = [
  body('email').isEmail().withMessage('valid email is required'),
  body('code').trim().isLength({ min: 4 }).withMessage('code is required'),
];

export const resetPasswordValidator = [
  body('email').isEmail().withMessage('valid email is required'),
  body('code').trim().isLength({ min: 4 }).withMessage('code is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('newPassword min length is 6'),
];

export const changePasswordValidator = [
  body('currentPassword').isLength({ min: 6 }).withMessage('currentPassword required'),
  body('newPassword').isLength({ min: 6 }).withMessage('newPassword min length is 6'),
];

export const refreshValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
];

export const logoutValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
];

export const verifyEmailParamValidator = [
  param('token').notEmpty().withMessage('token is required'),
];

