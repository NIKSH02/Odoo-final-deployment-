// Frontend password validation utility
export const validatePassword = (password) => {
  const errors = [];
  
  // Check length (8-20 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 20) {
    errors.push('Password must not exceed 20 characters');
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for at least one symbol/special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain at least one symbol');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export default validatePassword;
