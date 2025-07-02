import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import {
  BASE_SUGGESTIONS,
  getContextSuggestions,
} from "@/utils/nlp/suggestions";
import { extractSalaryInfo } from "@/utils/nlp/parsers";

interface NLPChatBoxProps {
  onAction: (action: { type: string; data: any }) => void;
}

export const NLPChatBox: React.FC<NLPChatBoxProps> = ({ onAction }) => {
  const [input, setInput] = useState("");
  const [suggestIndex, setSuggestIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (s: string) => {
    setInput(s);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lowered = input.toLowerCase();
    if (lowered.includes("salary")) {
      const { salary, growthRate, year } = extractSalaryInfo(input);
      if (salary !== undefined) {
        setMessage(
          `Set salary to $${salary}${growthRate !== undefined ? `, growth: ${growthRate}%` : ""}${year ? `, year: ${year}` : ""}`,
        );
        onAction({
          type: "set-salary",
          data: { salary, growthRate, year },
        });
      } else {
        setMessage("Couldn't find a salary value!");
      }
    } else {
      setMessage("That command isn't supported yet!");
    }
    setShowSuggestions(false);
    setInput("");
  };

  const filteredSuggestions = input
    ? getContextSuggestions(input).slice(0, 4)
    : BASE_SUGGESTIONS.slice(0, 4);

  return (
    <Card className="mb-6 p-4 flex flex-col gap-2 shadow-md border-blue-200 bg-white/70">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="text-indigo-400" />
        <span className="font-semibold text-lg text-slate-700">
          Ask AI to update your plan
        </span>
      </div>
      <form className="flex gap-2" onSubmit={handleSubmit} autoComplete="off">
        <Input
          type="text"
          placeholder="Describe what you want to change (ex: 'input a salary of 200000 for year 1')"
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="flex-1"
        />
        <Button type="submit">Go</Button>
      </form>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="mt-1 bg-slate-50 border rounded shadow text-sm z-10">
          {filteredSuggestions.map((s, i) => (
            <div
              key={s}
              className={`p-2 cursor-pointer hover:bg-blue-100`}
              onClick={() => handleSelectSuggestion(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
      {message && <div className="mt-2 text-blue-700 text-sm">{message}</div>}
    </Card>
  );
};
