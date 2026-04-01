import { Component } from '@angular/core';
import { Nabvar } from '../nabvar/nabvar';
import { CommonModule } from '@angular/common';

interface Expense {
  date: string;
  category: string;
  categoryColor: string;
  description: string;
  amount: number;
}

interface CategorySummary {
  category: string;
  icon: string;
  total: number;
}


@Component({
  selector: 'app-gastos',
  imports: [Nabvar, CommonModule],
  templateUrl: './gastos.html',
  styleUrl: './gastos.css',
})


export class Gastos {
  
  expenses: Expense[] = [
    {
      date: '24 Oct 14:20',
      category: 'Comida y bebida',
      categoryColor: '#dcfce7',
      description: 'Restaurante el olvido',
      amount: 42.50
    },
    {
      date: '23 Oct 08:15',
      category: 'Transporte',
      categoryColor: '#fee2e2',
      description: 'Uber Technologies Inc.',
      amount: 18.20
    },
    {
      date: '22 Oct 18:45',
      category: 'Compras',
      categoryColor: '#fff3e0',
      description: 'Producto de Amazon',
      amount: 149.99
    },
    {
      date: '20 Oct 10:00',
      category: 'Salida',
      categoryColor: '#e0f2fe',
      description: 'Caminata al volcán',
      amount: 150.00
    }
  ];

  get categorySummary(): CategorySummary[] {
    const summaryMap = new Map<string, number>();
    
    this.expenses.forEach(expense => {
      const currentTotal = summaryMap.get(expense.category) || 0;
      summaryMap.set(expense.category, currentTotal + expense.amount);
    });
    
    const iconMap: { [key: string]: string } = {
      'Food & Drink': '🍽️',
      'Transport': '🚗',
      'Shopping': '🛍️',
      'Housing': '🏠'
    };
    
    return Array.from(summaryMap.entries()).map(([category, total]) => ({
      category,
      icon: iconMap[category] || '📌',
      total
    }));
  }

  get totalGeneral(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  get averageExpense(): number {
    return this.expenses.length > 0 ? this.totalGeneral / this.expenses.length : 0;
  }

  get highestExpense(): number {
    return this.expenses.length > 0 
      ? Math.max(...this.expenses.map(e => e.amount)) 
      : 0;
  }

}
