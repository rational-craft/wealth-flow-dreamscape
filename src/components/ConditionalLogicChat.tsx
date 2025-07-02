import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  FIELDS,
  OPERATORS,
  FieldType,
  FieldDefinition,
} from "@/utils/fieldSchema";
import {
  suggestFields,
  suggestOperators,
  suggestValues,
  toLogicJSON,
  parseLogic,
  toLogicText,
} from "@/utils/suggestLogic";
import { LogicOutput } from "./LogicOutput";
import type { LogicToken } from "@/utils/suggestLogic";
import { Search, Check, X } from "lucide-react";

interface ConditionalLogicChatProps {
  onLogicSubmit?: (logicJSON: LogicToken[]) => void;
}

export const ConditionalLogicChat: React.FC<ConditionalLogicChatProps> = ({
  onLogicSubmit,
}) => {
  const [userInput, setUserInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [step, setStep] = useState<"field" | "operator" | "value" | "logic">(
    "field",
  );
  const [field, setField] = useState<FieldDefinition | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [logic, setLogic] = useState<string[]>([]); // Chain, e.g. ["Name is Alice", "AND"]
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time suggestions depending on step
  useEffect(() => {
    if (step === "field") {
      setSuggestions(suggestFields(userInput).map((f) => f.label));
    } else if (step === "operator" && field) {
      setSuggestions(suggestOperators(field.type, userInput));
    } else if (step === "value" && field && operator) {
      setSuggestions(suggestValues(field.key, userInput));
    } else if (step === "logic") {
      setSuggestions(["AND", "OR"]);
    } else {
      setSuggestions([]);
    }
  }, [userInput, step, field, operator]);

  // Reset subsequent steps if backing up
  useEffect(() => {
    if (step === "field") {
      setField(null);
      setOperator(null);
      setValue(null);
      setError(null);
    }
    if (step === "operator") {
      setOperator(null);
      setValue(null);
      setError(null);
    }
    if (step === "value") {
      setValue(null);
      setError(null);
    }
  }, [step]);

  // Move to next step on enter/tab or suggestion select
  const advance = (suggestion?: string) => {
    setError(null);
    if (step === "field") {
      const f = FIELDS.find(
        (x) =>
          x.label.toLowerCase() === (suggestion || userInput).toLowerCase(),
      );
      if (f) {
        setField(f);
        setUserInput("");
        setStep("operator");
      } else {
        setError("Please select a valid field");
      }
    } else if (step === "operator" && field) {
      const op = OPERATORS[field.type].find(
        (x) => x.toLowerCase() === (suggestion || userInput).toLowerCase(),
      );
      if (op) {
        setOperator(op);
        setUserInput("");
        setStep("value");
      } else {
        setError("Please select a valid operator for this field");
      }
    } else if (step === "value" && field && operator) {
      const v = suggestion ?? userInput;
      if (v.trim().length === 0) {
        setError("Please provide a value");
        return;
      }
      setValue(v);
      // On success, append to logic chain
      setLogic([...logic, `${field.label} ${operator} ${v}`]);
      setUserInput("");
      setStep("logic");
    } else if (step === "logic") {
      const s = (suggestion || userInput || "").toUpperCase();
      if (s === "AND" || s === "OR") {
        setLogic([...logic, s]);
        setUserInput("");
        setStep("field");
      } else {
        setError("Type AND or OR");
      }
    }
  };

  // Allow editing/cancelling latest
  const undo = () => {
    if (step === "logic" && logic.length > 0) {
      // Delete last condition+logic
      const temp = logic.slice();
      temp.pop();
      setLogic(temp);
      setStep("field");
    } else if (step === "value" && operator) setStep("operator");
    else if (step === "operator" && field) setStep("field");
    else if (step === "field" && logic.length > 0) {
      const temp = logic.slice();
      temp.pop();
      setLogic(temp);
      setStep("field");
    }
  };

  // Handle keyboard: Enter or Tab advances, Escape undoes
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab") && suggestions.length > 0) {
      advance(suggestions[0]);
      e.preventDefault();
    } else if (e.key === "Enter" && userInput.length > 0) {
      advance();
      e.preventDefault();
    } else if (e.key === "Escape") {
      undo();
      e.preventDefault();
    }
  };

  // For accessibility, focus input on every step advance
  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  // The full, chained expression for output
  const logicText = logic.join(" ");

  // "Go" submit handler
  const handleGo = () => {
    // Output both text and JSON to parent
    const parsed = parseLogic(logicText);
    const json = toLogicJSON(parsed);
    if (onLogicSubmit) {
      onLogicSubmit(json);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-4 mt-8 shadow border-blue-200 bg-white/90 space-y-3">
      <div className="text-lg font-semibold flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-500" />
        Build Conditional Logic
      </div>
      <div className="mt-1 text-gray-700 text-base">
        Type conditions step-by-step:{" "}
        <span className="italic">If [Field] [Operator] [Value]</span>, then
        chain with <span className="italic">AND</span> or{" "}
        <span className="italic">OR</span>.
      </div>
      <div className="flex gap-2 items-center">
        <Input
          ref={inputRef}
          value={userInput}
          placeholder={
            step === "field"
              ? "Start typing a field name..."
              : step === "operator"
                ? "Choose an operator..."
                : step === "value"
                  ? "Type a value..."
                  : "Type AND or OR to add another condition"
          }
          className="flex-1"
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKey}
          aria-label="conditional-logic-input"
        />
        <button
          type="button"
          onClick={() => advance()}
          aria-label="Accept"
          className="rounded-full bg-blue-500 text-white h-9 w-9 flex items-center justify-center hover:bg-blue-600"
        >
          <Check className="w-5 h-5" />
        </button>
        {(logic.length > 0 || step !== "field") && (
          <button
            type="button"
            onClick={undo}
            aria-label="Undo"
            className="rounded-full bg-red-100 text-red-600 h-9 w-9 flex items-center justify-center hover:bg-red-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {suggestions.length > 0 && (
        <div className="border rounded mt-1 bg-white shadow z-20 max-h-56 overflow-auto">
          {suggestions.map((s, i) => (
            <div
              key={s}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => advance(s)}
              tabIndex={0}
              role="button"
            >
              {s}
            </div>
          ))}
        </div>
      )}
      {/* Show chain of conditions as "chat bubbles" */}
      <div className="space-y-2">
        {logic.map((text, i) => (
          <div
            key={i}
            className={`rounded px-3 py-2 bg-slate-100 flex items-center ${text === "AND" || text === "OR" ? "bg-yellow-100 font-bold text-yellow-800 justify-center" : "border-l-4 border-blue-300"}`}
          >
            {text}
          </div>
        ))}
      </div>

      {logic.length > 0 && (
        <>
          <LogicOutput input={logicText} />
          {/* "Go" button for submitting logic */}
          <div className="flex justify-end">
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow font-semibold transition-all"
              onClick={handleGo}
            >
              Go
            </button>
          </div>
        </>
      )}
    </Card>
  );
};
