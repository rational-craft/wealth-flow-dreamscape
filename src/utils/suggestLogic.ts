import { FIELDS, OPERATORS, FieldType, FieldDefinition, MOCK_VALUES } from "./fieldSchema";

/**
 * Returns field suggestions matching the current user input.
 */
export function suggestFields(input: string): FieldDefinition[] {
  const lowered = input.toLowerCase();
  return FIELDS.filter(f =>
    f.label.toLowerCase().includes(lowered) ||
    f.key.toLowerCase().includes(lowered)
  );
}

/**
 * Returns operator suggestions based on field (or field type)
 */
export function suggestOperators(fieldType: FieldType, input: string): string[] {
  return OPERATORS[fieldType].filter(op => op.toLowerCase().includes(input.toLowerCase()));
}

export function suggestValues(fieldKey: string, input: string): string[] {
  // Only works for some demo fields, otherwise returns the current input itself.
  const values = MOCK_VALUES[fieldKey] || [];
  return values.filter(v => v.toLowerCase().includes(input.toLowerCase())).concat([input]);
}

// Parse a single statement, e.g. If [field] [operator] [value]
export function parseCondition(tokens: string[]): {
  field?: FieldDefinition;
  operator?: string;
  value?: string;
  error?: string;
} {
  if (tokens.length < 3) return { error: "Incomplete condition." };
  const field = FIELDS.find(f =>
    tokens[0].toLowerCase() === f.label.toLowerCase() ||
    tokens[0].toLowerCase() === f.key.toLowerCase()
  );
  if (!field) return { error: `Unknown field: "${tokens[0]}"` };

  const possibleOps = OPERATORS[field.type];
  const matchedOp = possibleOps.find(op => op.toLowerCase() === tokens[1].toLowerCase());
  if (!matchedOp) return { error: `Invalid operator "${tokens[1]}" for ${field.label}` };

  const value = tokens.slice(2).join(" ");
  // For demo: skip type-checking value, but could implement for boolean/date, etc.
  // Example validation
  if (field.type === "boolean" && !["true", "false"].includes(value.toLowerCase()))
    return { error: `Boolean value must be "true" or "false"` };
  if (field.type === "email" && matchedOp === "before")
    return { error: `Operator "before" invalid for field type "email"` };
  // ... add more type-validation as needed
  return { field, operator: matchedOp, value };
}

/**
 * Parses a logic input, supporting AND/OR chaining ("AND"/"OR" must be in ALL CAPS)
 * e.g.: Name is Alice AND Amount >= 100 OR Is Active is true
 */
export function parseLogic(input: string) {
  // Split on ' AND ' and ' OR ', keep the logical chain
  const tokens = input.split(/\s(AND|OR)\s/);
  let conditions = [];
  let logic: ("AND" | "OR")[] = [];

  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      // Condition string
      const words = tokens[i].trim().split(/\s+/);
      conditions.push(parseCondition(words));
    } else {
      logic.push(tokens[i] as "AND" | "OR");
    }
  }
  return { conditions, logic };
}

/**
 * Transforms parsed logic into JSON for workflows, e.g.:
 * [
 *   { field: "name", operator: "is", value: "Alice" },
 *   "AND",
 *   { field: "amount", operator: ">=", value: "100" }
 * ]
 */
export function toLogicJSON(parsed: ReturnType<typeof parseLogic>) {
  const out: any[] = [];
  parsed.conditions.forEach((cond, idx) => {
    if (!cond.error && cond.field) {
      out.push({
        field: cond.field.key,
        operator: cond.operator,
        value: cond.value,
      });
    } else {
      // If parse error, push error as string
      out.push({ error: cond.error });
    }
    if (idx < parsed.logic.length) out.push(parsed.logic[idx]);
  });
  return out;
}

/**
 * Transforms parsed logic to readable natural language (with error messages if present)
 */
export function toLogicText(parsed: ReturnType<typeof parseLogic>): string {
  let out = "";
  parsed.conditions.forEach((cond, idx) => {
    if (cond.error) {
      out += `[Error: ${cond.error}]`;
    } else {
      out += `${cond.field?.label} ${cond.operator} ${cond.value}`;
    }
    if (idx < parsed.logic.length) out += ` ${parsed.logic[idx]} `;
  });
  return out;
}
