<?php
/**
 * Simple request validation helper.
 */
class Validator
{
    private array $errors = [];

    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $ruleSet) {
            $value = $data[$field] ?? null;
            $fieldRules = explode('|', $ruleSet);

            foreach ($fieldRules as $rule) {
                if ($rule === 'required' && (is_null($value) || $value === '')) {
                    $this->errors[$field] = ucfirst($field) . ' is required';
                    break;
                }

                if ($rule === 'email' && $value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->errors[$field] = 'Invalid email format';
                }

                if (str_starts_with($rule, 'min:')) {
                    $min = (int) substr($rule, 4);
                    if ($value && strlen($value) < $min) {
                        $this->errors[$field] = ucfirst($field) . " must be at least {$min} characters";
                    }
                }

                if (str_starts_with($rule, 'max:')) {
                    $max = (int) substr($rule, 4);
                    if ($value && strlen($value) > $max) {
                        $this->errors[$field] = ucfirst($field) . " must not exceed {$max} characters";
                    }
                }

                if ($rule === 'numeric' && $value && !is_numeric($value)) {
                    $this->errors[$field] = ucfirst($field) . ' must be a number';
                }

                if ($rule === 'phone' && $value && !preg_match('/^\+?[0-9]{10,15}$/', $value)) {
                    $this->errors[$field] = 'Invalid phone number format';
                }
            }
        }

        return empty($this->errors);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
