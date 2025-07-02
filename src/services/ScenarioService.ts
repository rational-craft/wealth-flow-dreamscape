export interface Scenario {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  data: {
    incomes: any[];
    expenses: any[];
    equityPayouts: any[];
    properties: any[];
    debts: any[];
    initialWealth: number;
    investmentReturn: number;
    projectionYears: number;
    state: string;
    filingStatus: string;
  };
}

export class ScenarioService {
  private scenarios: Map<string, Scenario> = new Map();
  private currentScenarioId: string = "base";

  constructor() {
    this.initializeDefaultScenarios();
  }

  private initializeDefaultScenarios() {
    const baseScenario: Scenario = {
      id: "base",
      name: "Base Case",
      isDefault: true,
      createdAt: new Date(),
      data: {
        incomes: [],
        expenses: [],
        equityPayouts: [],
        properties: [],
        debts: [],
        initialWealth: 50000,
        investmentReturn: 7,
        projectionYears: 10,
        state: "California",
        filingStatus: "single",
      },
    };

    const optimisticScenario: Scenario = {
      id: "optimistic",
      name: "Optimistic",
      isDefault: false,
      createdAt: new Date(),
      data: {
        ...baseScenario.data,
        investmentReturn: 10,
        debts: [],
      },
    };

    const bearScenario: Scenario = {
      id: "bear",
      name: "Bear Case",
      isDefault: false,
      createdAt: new Date(),
      data: {
        ...baseScenario.data,
        investmentReturn: 4,
        debts: [],
      },
    };

    this.scenarios.set("base", baseScenario);
    this.scenarios.set("optimistic", optimisticScenario);
    this.scenarios.set("bear", bearScenario);
  }

  getCurrentScenario(): Scenario {
    return this.scenarios.get(this.currentScenarioId)!;
  }

  setCurrentScenario(id: string) {
    if (this.scenarios.has(id)) {
      this.currentScenarioId = id;
    }
  }

  getAllScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  createScenario(name: string, baseScenarioId?: string): string {
    const id = `scenario_${Date.now()}`;
    const baseData = baseScenarioId
      ? this.scenarios.get(baseScenarioId)?.data
      : this.getCurrentScenario().data;

    const newScenario: Scenario = {
      id,
      name,
      isDefault: false,
      createdAt: new Date(),
      data: { ...baseData },
    };

    this.scenarios.set(id, newScenario);
    return id;
  }

  updateScenario(id: string, data: Partial<Scenario["data"]>) {
    const scenario = this.scenarios.get(id);
    if (scenario) {
      scenario.data = {
        ...scenario.data,
        ...data,
      };
      this.scenarios.set(id, scenario); // force update with new object reference
    }
  }

  deleteScenario(id: string) {
    if (!this.scenarios.get(id)?.isDefault) {
      this.scenarios.delete(id);
      if (this.currentScenarioId === id) {
        this.currentScenarioId = "base";
      }
    }
  }
}

export const scenarioService = new ScenarioService();
