import React from "react";
import { parseLogic, toLogicJSON, toLogicText } from "@/utils/suggestLogic";

interface LogicOutputProps {
  input: string;
}

export const LogicOutput: React.FC<LogicOutputProps> = ({ input }) => {
  const parsed = parseLogic(input);
  const logicText = toLogicText(parsed);
  const logicJSON = toLogicJSON(parsed);

  return (
    <div className="space-y-2 mt-4">
      <div>
        <span className="font-semibold text-gray-700">Logic (text):</span>
        <div className="bg-slate-50 border rounded p-2 mt-1 text-gray-800">
          {logicText || <span className="text-gray-400">No logic</span>}
        </div>
      </div>
      <div>
        <span className="font-semibold text-gray-700">Logic (JSON):</span>
        <pre className="bg-slate-50 border rounded p-2 mt-1 text-xs overflow-x-auto">
          {JSON.stringify(logicJSON, null, 2)}
        </pre>
      </div>
    </div>
  );
};
