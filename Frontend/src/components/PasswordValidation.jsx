import React from 'react';

const PasswordValidation = ({ password, show }) => {
  if (!show) return null;

  const validations = [
    {
      test: password.length >= 8 && password.length <= 20,
      message: "8-20 characters",
      id: "length"
    },
    {
      test: /\d/.test(password),
      message: "At least 1 number",
      id: "number"
    },
    {
      test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
      message: "At least 1 symbol (!@#$%^&* etc.)",
      id: "symbol"
    }
  ];

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
      <ul className="space-y-1">
        {validations.map((validation) => (
          <li key={validation.id} className="flex items-center text-xs">
            <span className={`mr-2 ${validation.test ? 'text-green-500' : 'text-red-500'}`}>
              {validation.test ? '✓' : '✗'}
            </span>
            <span className={validation.test ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {validation.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordValidation;
