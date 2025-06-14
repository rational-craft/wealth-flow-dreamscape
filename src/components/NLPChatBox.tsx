
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Input a salary of $200,000 for year 1 with a 2% growth rate",
  "Set initial wealth to $50,000",
  "Change projection years to 20",
  "Set bonus of $15,000 in year 2",
  "Update expected annual return to 8%",
  "Add an expense called Housing for $2,000 per month"
];

function extractSalaryInfo(input: string) {
  // Match: "salary of $200000" or "salary of 200000", "with a 2% growth rate"
  const salaryMatch = input.match(/salary (of)?[ $]*([\d,]+)/i);
  const growthMatch = input.match(/(\d+(\.\d+)?)% growth/i);
  const yearMatch = input.match(/year (\d+)/i);

  let salary = salaryMatch ? parseInt(salaryMatch[2].replace(/,/g, "")) : undefined;
  let growthRate = growthMatch ? parseFloat(growthMatch[1]) : undefined;
  let year = yearMatch ? parseInt(yearMatch[1]) : 1;

  return { salary, growthRate, year };
}

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
    // Simple: Handle salary command now
    const lowered = input.toLowerCase();
    if (lowered.includes("salary")) {
      const { salary, growthRate, year } = extractSalaryInfo(input);
      if (salary !== undefined) {
        setMessage(`Set salary to $${salary}${growthRate !== undefined ? `, growth: ${growthRate}%` : ""}${year ? `, year: ${year}` : ""}`);
        onAction({
          type: "set-salary",
          data: { salary, growthRate, year }
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
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(input.toLowerCase()))
    : SUGGESTIONS;

  return (
    <Card className="mb-6 p-4 flex flex-col gap-2 shadow-md border-blue-200 bg-white/70">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="text-indigo-400" />
        <span className="font-semibold text-lg text-slate-700">Ask AI to update your plan</span>
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
          {filteredSuggestions.slice(0, 4).map((s, i) => (
            <div
              key={s}
              className={`p-2 cursor-pointer hover:bg-blue-100 ${i === suggestIndex ? "bg-blue-50" : ""}`}
              onClick={() => handleSelectSuggestion(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
      {message && (
        <div className="mt-2 text-blue-700 text-sm">
          {message}
        </div>
      )}
    </Card>
  );
};
