import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RealEstateProperty } from '@/pages/Index';
import { Plus, Trash2, Home } from 'lucide-react';

interface RealEstateManagerProps {
  properties: RealEstateProperty[];
  setProperties: (properties: RealEstateProperty[]) => void;
}

const DOWN_PAYMENT_SOURCES = [
  "Savings",
  "Gift",
  "Sale of Home",
  "Retirement Account",
  "Other"
];

export const RealEstateManager: React.FC<RealEstateManagerProps> = ({ properties, setProperties }) => {
  const [newProperty, setNewProperty] = useState<Partial<RealEstateProperty>>({
    name: '',
    purchasePrice: 0,
    downPayment: 0,
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 30,
    purchaseYear: 1,
    appreciationRate: 3,
    maintenanceRate: 1,
    propertyTaxRate: 1.2,
    downPaymentSource: 'Savings' // default
  });

  const addProperty = () => {
    if (newProperty.name && newProperty.purchasePrice && newProperty.purchaseYear) {
      const property: RealEstateProperty = {
        id: Date.now().toString(),
        name: newProperty.name,
        purchasePrice: newProperty.purchasePrice,
        downPayment: newProperty.downPayment || 0,
        loanAmount: newProperty.loanAmount || 0,
        interestRate: newProperty.interestRate || 0,
        loanTermYears: newProperty.loanTermYears || 30,
        purchaseYear: newProperty.purchaseYear,
        appreciationRate: newProperty.appreciationRate || 3,
        maintenanceRate: newProperty.maintenanceRate || 1,
        propertyTaxRate: newProperty.propertyTaxRate || 1.2,
        downPaymentSource: newProperty.downPaymentSource || 'Savings'
      };
      setProperties([...properties, property]);
      setNewProperty({
        name: '',
        purchasePrice: 0,
        downPayment: 0,
        loanAmount: 0,
        interestRate: 0,
        loanTermYears: 30,
        purchaseYear: 1,
        appreciationRate: 3,
        maintenanceRate: 1,
        propertyTaxRate: 1.2,
        downPaymentSource: 'Savings'
      });
    }
  };

  const updateProperty = (id: string, updates: Partial<RealEstateProperty>) => {
    setProperties(properties.map(property => 
      property.id === id ? { ...property, ...updates } : property
    ));
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter(property => property.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Home className="text-blue-600" />
        <h3 className="text-xl font-semibold text-slate-800">Real Estate Properties</h3>
      </div>

      {/* Add New Property Form */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Add New Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="property-name">Property Name</Label>
              <Input
                id="property-name"
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                placeholder="e.g., Primary Residence"
              />
            </div>

            <div>
              <Label htmlFor="purchase-price">Purchase Price</Label>
              <Input
                id="purchase-price"
                type="number"
                value={newProperty.purchasePrice}
                onChange={(e) => setNewProperty({ ...newProperty, purchasePrice: Number(e.target.value) })}
                placeholder="500000"
              />
            </div>

            <div>
              <Label htmlFor="down-payment">Down Payment</Label>
              <Input
                id="down-payment"
                type="number"
                value={newProperty.downPayment}
                onChange={(e) => setNewProperty({ ...newProperty, downPayment: Number(e.target.value) })}
                placeholder="100000"
              />
            </div>

            <div>
              <Label htmlFor="loan-amount">Loan Amount</Label>
              <Input
                id="loan-amount"
                type="number"
                value={newProperty.loanAmount}
                onChange={(e) => setNewProperty({ ...newProperty, loanAmount: Number(e.target.value) })}
                placeholder="400000"
              />
            </div>

            <div>
              <Label htmlFor="interest-rate">Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                step="0.1"
                value={newProperty.interestRate}
                onChange={(e) => setNewProperty({ ...newProperty, interestRate: Number(e.target.value) })}
                placeholder="6.5"
              />
            </div>

            <div>
              <Label htmlFor="loan-term">Loan Term (Years)</Label>
              <Input
                id="loan-term"
                type="number"
                value={newProperty.loanTermYears}
                onChange={(e) => setNewProperty({ ...newProperty, loanTermYears: Number(e.target.value) })}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="purchase-year">Purchase Year</Label>
              <Input
                id="purchase-year"
                type="number"
                min="1"
                max="50"
                value={newProperty.purchaseYear}
                onChange={(e) => setNewProperty({ ...newProperty, purchaseYear: Number(e.target.value) })}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="appreciation-rate">Appreciation Rate (%)</Label>
              <Input
                id="appreciation-rate"
                type="number"
                step="0.1"
                value={newProperty.appreciationRate}
                onChange={(e) => setNewProperty({ ...newProperty, appreciationRate: Number(e.target.value) })}
                placeholder="3"
              />
            </div>

            <div>
              <Label htmlFor="maintenance-rate">Maintenance Rate (%)</Label>
              <Input
                id="maintenance-rate"
                type="number"
                step="0.1"
                value={newProperty.maintenanceRate}
                onChange={(e) => setNewProperty({ ...newProperty, maintenanceRate: Number(e.target.value) })}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="property-tax-rate">Property Tax Rate (%)</Label>
              <Input
                id="property-tax-rate"
                type="number"
                step="0.1"
                value={newProperty.propertyTaxRate}
                onChange={(e) => setNewProperty({ ...newProperty, propertyTaxRate: Number(e.target.value) })}
                placeholder="1.2"
              />
            </div>

            <div>
              <Label htmlFor="down-payment-source">Down Payment Source</Label>
              <select
                id="down-payment-source"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={newProperty.downPaymentSource}
                onChange={(e) =>
                  setNewProperty({
                    ...newProperty,
                    downPaymentSource: e.target.value,
                  })
                }
              >
                {DOWN_PAYMENT_SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={addProperty} className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </CardContent>
      </Card>

      {/* Existing Properties Table */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Property Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Down Payment</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Purchase Year</TableHead>
                  <TableHead>Appreciation Rate</TableHead>
                  <TableHead>Down Payment Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Input
                        value={property.name}
                        onChange={(e) =>
                          updateProperty(property.id, { name: e.target.value })
                        }
                        className="min-w-[150px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={property.purchasePrice}
                        onChange={(e) =>
                          updateProperty(property.id, { purchasePrice: Number(e.target.value) })
                        }
                        className="min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={property.downPayment}
                        onChange={(e) =>
                          updateProperty(property.id, { downPayment: Number(e.target.value) })
                        }
                        className="min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={property.loanAmount}
                        onChange={(e) =>
                          updateProperty(property.id, { loanAmount: Number(e.target.value) })
                        }
                        className="min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={property.interestRate}
                        onChange={(e) =>
                          updateProperty(property.id, { interestRate: Number(e.target.value) })
                        }
                        className="min-w-[80px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={property.purchaseYear}
                        onChange={(e) =>
                          updateProperty(property.id, { purchaseYear: Number(e.target.value) })
                        }
                        className="min-w-[80px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={property.appreciationRate}
                        onChange={(e) =>
                          updateProperty(property.id, { appreciationRate: Number(e.target.value) })
                        }
                        className="min-w-[80px]"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                        value={property.downPaymentSource || "Savings"}
                        onChange={(e) =>
                          updateProperty(property.id, { downPaymentSource: e.target.value })
                        }
                      >
                        {DOWN_PAYMENT_SOURCES.map((src) => (
                          <option key={src} value={src}>{src}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProperty(property.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
