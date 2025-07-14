// Comprehensive validation utility to replace missing schema validation

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormSchema {
  [fieldName: string]: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
  postalCode: /^[0-9]{4}$/,
  accountNumber: /^[0-9]{8,11}$/,
  idNumber: /^[0-9]{13}$/,
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Common validation rules
export const COMMON_RULES = {
  required: { required: true },
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.email,
    maxLength: 255,
  },
  phone: {
    pattern: VALIDATION_PATTERNS.phone,
    minLength: 10,
    maxLength: 20,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: VALIDATION_PATTERNS.strongPassword,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  postalCode: {
    required: true,
    pattern: VALIDATION_PATTERNS.postalCode,
  },
  accountNumber: {
    required: true,
    pattern: VALIDATION_PATTERNS.accountNumber,
  },
  price: {
    required: true,
    min: 0,
    max: 100000,
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
} as const;

// Validate a single field
export const validateField = (
  value: any,
  rule: ValidationRule,
): string | null => {
  // Check required
  if (
    rule.required &&
    (value === null || value === undefined || value === "")
  ) {
    return "This field is required";
  }

  // Skip other validations if value is empty and not required
  if (
    !rule.required &&
    (value === null || value === undefined || value === "")
  ) {
    return null;
  }

  const stringValue = String(value);
  const numericValue = Number(value);

  // Check string length
  if (rule.minLength && stringValue.length < rule.minLength) {
    return `Must be at least ${rule.minLength} characters long`;
  }

  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `Must be no more than ${rule.maxLength} characters long`;
  }

  // Check numeric range
  if (rule.min !== undefined && numericValue < rule.min) {
    return `Must be at least ${rule.min}`;
  }

  if (rule.max !== undefined && numericValue > rule.max) {
    return `Must be no more than ${rule.max}`;
  }

  // Check pattern
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return getPatternErrorMessage(rule.pattern);
  }

  // Check custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

// Get user-friendly error messages for patterns
const getPatternErrorMessage = (pattern: RegExp): string => {
  const patternString = pattern.toString();

  if (pattern === VALIDATION_PATTERNS.email) {
    return "Please enter a valid email address";
  }

  if (pattern === VALIDATION_PATTERNS.phone) {
    return "Please enter a valid phone number";
  }

  if (pattern === VALIDATION_PATTERNS.postalCode) {
    return "Please enter a valid 4-digit postal code";
  }

  if (pattern === VALIDATION_PATTERNS.accountNumber) {
    return "Please enter a valid bank account number (8-11 digits)";
  }

  if (pattern === VALIDATION_PATTERNS.idNumber) {
    return "Please enter a valid 13-digit ID number";
  }

  if (pattern === VALIDATION_PATTERNS.strongPassword) {
    return "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character";
  }

  return "Invalid format";
};

// Validate an entire form
export const validateForm = (
  data: Record<string, any>,
  schema: FormSchema,
): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [fieldName, rule] of Object.entries(schema)) {
    const value = data[fieldName];
    const error = validateField(value, rule);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Predefined schemas for common forms
export const FORM_SCHEMAS = {
  login: {
    email: COMMON_RULES.email,
    password: { required: true, minLength: 1 }, // Don't validate strength on login
  },

  register: {
    email: COMMON_RULES.email,
    password: COMMON_RULES.password,
    firstName: COMMON_RULES.name,
    lastName: COMMON_RULES.name,
  },

  profile: {
    firstName: COMMON_RULES.name,
    lastName: COMMON_RULES.name,
    email: COMMON_RULES.email,
    phone: COMMON_RULES.phone,
  },

  address: {
    street: { required: true, minLength: 5, maxLength: 255 },
    city: { required: true, minLength: 2, maxLength: 100 },
    province: { required: true, minLength: 2, maxLength: 100 },
    postal_code: COMMON_RULES.postalCode,
    country: { required: true, minLength: 2, maxLength: 100 },
  },

  banking: {
    businessName: { required: true, minLength: 2, maxLength: 255 },
    email: COMMON_RULES.email,
    bankName: { required: true, minLength: 2, maxLength: 100 },
    accountNumber: COMMON_RULES.accountNumber,
  },

  bookListing: {
    title: { required: true, minLength: 2, maxLength: 255 },
    author: { required: true, minLength: 2, maxLength: 255 },
    description: COMMON_RULES.description,
    price: COMMON_RULES.price,
    condition: { required: true },
    category: { required: true },
  },

  contactForm: {
    name: COMMON_RULES.name,
    email: COMMON_RULES.email,
    subject: { required: true, minLength: 5, maxLength: 255 },
    message: { required: true, minLength: 10, maxLength: 2000 },
  },
} as const;

// Specific validation functions
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.email.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.phone.test(phone);
};

export const validatePostalCode = (postalCode: string): boolean => {
  return VALIDATION_PATTERNS.postalCode.test(postalCode);
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  return VALIDATION_PATTERNS.accountNumber.test(accountNumber);
};

export const validatePassword = (password: string): boolean => {
  return VALIDATION_PATTERNS.strongPassword.test(password);
};

// Address validation
export const validateAddress = (address: any): ValidationResult => {
  return validateForm(address, FORM_SCHEMAS.address);
};

// Banking details validation
export const validateBankingDetails = (bankingData: any): ValidationResult => {
  return validateForm(bankingData, FORM_SCHEMAS.banking);
};

// Book listing validation
export const validateBookListing = (bookData: any): ValidationResult => {
  return validateForm(bookData, FORM_SCHEMAS.bookListing);
};

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d\+]/g, "");
};

export const sanitizeNumericInput = (input: string): string => {
  return input.replace(/[^\d\.]/g, "");
};

// Validation with automatic sanitization
export const validateAndSanitize = (
  data: Record<string, any>,
  schema: FormSchema,
): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} => {
  const sanitizedData: Record<string, any> = {};

  // Sanitize data
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      if (key === "email") {
        sanitizedData[key] = sanitizeEmail(value);
      } else if (key === "phone") {
        sanitizedData[key] = sanitizePhoneNumber(value);
      } else if (key === "price" || key.includes("amount")) {
        sanitizedData[key] = sanitizeNumericInput(value);
      } else {
        sanitizedData[key] = sanitizeString(value);
      }
    } else {
      sanitizedData[key] = value;
    }
  }

  // Validate sanitized data
  const validation = validateForm(sanitizedData, schema);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    sanitizedData,
  };
};

// Real-time validation for forms
export const createFieldValidator = (rule: ValidationRule) => {
  return (value: any) => validateField(value, rule);
};

// Async validation (for unique checks, etc.)
export type AsyncValidator = (value: any) => Promise<string | null>;

export const validateAsync = async (
  value: any,
  validators: AsyncValidator[],
): Promise<string | null> => {
  for (const validator of validators) {
    const error = await validator(value);
    if (error) {
      return error;
    }
  }
  return null;
};

// Common async validators
export const createUniqueEmailValidator = (
  checkEmailExists: (email: string) => Promise<boolean>,
): AsyncValidator => {
  return async (email: string) => {
    if (!validateEmail(email)) {
      return null; // Let synchronous validation handle format errors
    }

    const exists = await checkEmailExists(email);
    return exists ? "Email is already registered" : null;
  };
};

export const createUniqueUsernameValidator = (
  checkUsernameExists: (username: string) => Promise<boolean>,
): AsyncValidator => {
  return async (username: string) => {
    const exists = await checkUsernameExists(username);
    return exists ? "Username is already taken" : null;
  };
};
