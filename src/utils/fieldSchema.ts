
/**
 * Mocked schema for demonstration.
 * In a real app, fetch these from actual forms/schemas.
 */
export type FieldType = "string" | "number" | "date" | "email" | "boolean";

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  form: string;
}

export const FIELDS: FieldDefinition[] = [
  { key: "name", label: "Name", type: "string", form: "User" },
  { key: "email", label: "Email", type: "email", form: "User" },
  { key: "dateOfBirth", label: "Date of Birth", type: "date", form: "User" },
  { key: "amount", label: "Amount", type: "number", form: "Payment" },
  { key: "paymentDate", label: "Payment Date", type: "date", form: "Payment" },
  { key: "isActive", label: "Is Active", type: "boolean", form: "User" },
  // Add more fields as needed!
];

export const OPERATORS = {
  string: ["is", "is not", "contains", "does not contain", "starts with", "ends with"],
  number: ["=", "!=", ">", "<", ">=", "<="],
  date: ["before", "after", "on", "not on"],
  email: ["is", "is not", "contains", "does not contain"],
  boolean: ["is true", "is false"],
} as const;

export type Operator = (typeof OPERATORS)[FieldType][number];

// Optional: values for fields (for suggestions)
export const MOCK_VALUES = {
  email: ["test@example.com", "user@domain.com"],
  name: ["Alice", "Bob"],
  amount: ["100", "500"],
  isActive: ["true", "false"],
};
