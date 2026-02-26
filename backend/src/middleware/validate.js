const { body, validationResult } = require('express-validator')

/**
 * Validation rules for the contact form
 */
const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),

  body('subject')
    .trim()
    .optional()
    .isLength({ max: 200 })
    .withMessage('Subject must be under 200 characters.'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters.'),
]

/**
 * Middleware that checks validation results and returns 422 on failure
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

module.exports = { contactValidationRules, handleValidationErrors }
