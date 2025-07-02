import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Scenario, scenarioService } from "@/services/ScenarioService";
import { Plus, Copy, Trash } from "lucide-react";

interface ScenarioManagerProps {
  currentScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onScenarioUpdate: (scenarioId: string, data: any) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  currentScenarioId,
  onScenarioChange,
  onScenarioUpdate,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>(
    scenarioService.getAllScenarios(),
  );
  const [newScenarioName, setNewScenarioName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBaseScenario, setSelectedBaseScenario] = useState("base");

  const handleCreateScenario = () => {
    if (newScenarioName.trim()) {
      const newId = scenarioService.createScenario(
        newScenarioName,
        selectedBaseScenario,
      );
      setScenarios(scenarioService.getAllScenarios());
      setNewScenarioName("");
      setIsCreateDialogOpen(false);
      onScenarioChange(newId);
    }
  };

  const handleDeleteScenario = (scenarioId: string) => {
    scenarioService.deleteScenario(scenarioId);
    setScenarios(scenarioService.getAllScenarios());
    if (currentScenarioId === scenarioId) {
      onScenarioChange("base");
    }
  };

  const currentScenario = scenarios.find((s) => s.id === currentScenarioId);

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Scenario:</span>
        <Select value={currentScenarioId} onValueChange={onScenarioChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                <div className="flex items-center gap-2">
                  {scenario.name}
                  {scenario.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Scenario
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Scenario Name</label>
              <Input
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="Enter scenario name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Base on Existing Scenario
              </label>
              <Select
                value={selectedBaseScenario}
                onValueChange={setSelectedBaseScenario}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateScenario} className="flex-1">
                Create Scenario
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {currentScenario && !currentScenario.isDefault && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteScenario(currentScenario.id)}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Trash className="w-4 h-4" />
          Delete
        </Button>
      )}
    </div>
  );
};
