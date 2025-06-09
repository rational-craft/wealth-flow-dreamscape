import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RealEstateProperty } from '@/pages/Index';
import { Plus, Trash2, home } from 'lucide-react';

interface RealEstateManagerProps {
  properties: RealEstateProperty[];
  setProperties: (properties: RealEstateProperty[]) => void;
}

export const RealEstateManager: React.FC<RealEstateManagerProps> = ({ properties, setProperties }) => {
  const [newProperty, setNewProperty] = useState<Partial<RealEstateProperty>>({
    name: '',
    purchasePrice: 0,
    downPayment: 0,
    loanAmount: 0,
    interestRate: 4.5,
    loanTermYears: 30,
    purchaseYear: 1,
    appreciationRate: 3,
    maintenanceRate: 1,
    propertyTaxRate: 1.2
  });

  const addProperty = () => {
    if (newProperty.name && newProperty.purchasePrice && newProperty.purchaseYear) {
      const property: RealEstateProperty = {
        id: Date.now().toString(),
        name: newProperty.name,
        purchasePrice: newProperty.purchasePrice,
        downPayment: newProperty.downPayment || 0,
        loanAmount: newProperty.loanAmount || (newProperty.purchasePrice - (newProperty.downPayment || 0)),
        interestRate: newProperty.interestRate || 4.5,
        loanTermYears: newProperty.loanTermYears || 30,
        purchaseYear: newProperty.purchaseYear,
        appreciationRate: newProperty.appreciationRate || 3,
        maintenanceRate: newProperty.maintenanceRate || 1,
        propertyTaxRate: newProperty.propertyTaxRate || 1.2
      };
      setProperties([...properties, property]);
      setNewProperty({
        name: '',
        purchasePrice: 0,
        downPayment: 0,
        loanAmount: 0,
        interestRate: 4.5,
        loanTermYears: 30,
        purchaseYear: 1,
        appreciationRate: 3,
        maintenanceRate: 1,
        propertyTaxRate: 1.2
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

  const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <home className="text-blue-600" />
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
                placeholder="e.g., Primary Home, Investment Property"
              />
            </div>

            <div>
              <Label htmlFor="purchase-price">Purchase Price</Label>
              <Input
                id="purchase-price"
                type="number"
                value={newProperty.purchasePrice}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  setNewProperty({ 
                    ...newProperty, 
                    purchasePrice: price,
                    loanAmount: price - (newProperty.downPayment || 0)
                  });
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="down-payment">Down Payment</Label>
              <Input
                id="down-payment"
                type="number"
                value={newProperty.downPayment}
                onChange={(e) => {
                  const down = Number(e.target.value);
                  setNewProperty({ 
                    ...newProperty, 
                    downPayment: down,
                    loanAmount: (newProperty.purchasePrice || 0) - down
                  });
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="loan-amount">Loan Amount</Label>
              <Input
                id="loan-amount"
                type="number"
                value={newProperty.loanAmount}
                onChange={(e) => setNewProperty({ ...newProperty, loanAmount: Number(e.target.value) })}
                placeholder="0"
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
                placeholder="4.5"
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
              <Label htmlFor="maintenance-rate">Maintenance Rate (% of value)</Label>
              <Input
                id="maintenance-rate"
                type="number"
                step="0.1"
                value={newProperty.maintenanceRate}
                onChange={(e) => setNewProperty({ ...newProperty, maintenanceRate: Number(e.target.value) })}
                placeholder="1"
              />
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Down Payment</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Purchase Year</TableHead>
                    <TableHead>Appreciation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell>{formatCurrency(property.purchasePrice)}</TableCell>
                      <TableCell>{formatCurrency(property.downPayment)}</TableCell>
                      <TableCell>{formatCurrency(property.loanAmount)}</TableCell>
                      <TableCell>
                        {formatCurrency(calculateMonthlyPayment(property.loanAmount, property.interestRate, property.loanTermYears))}
                      </TableCell>
                      <TableCell>{property.purchaseYear}</TableCell>
                      <TableCell>{property.appreciationRate}%</TableCell>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
