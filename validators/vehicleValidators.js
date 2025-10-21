import { body } from 'express-validator';

export const upsertVehicleValidator = [
  body('plateNumber').optional().isString(),
  body('model').optional().isString(),
  body('fuelLevel').optional().isNumeric(),
  body('odometer').optional().isNumeric(),
  body('nextOilChange').optional().isNumeric(),
];

