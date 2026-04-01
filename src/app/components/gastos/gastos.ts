import { Component } from '@angular/core';
import { Nabvar } from '../nabvar/nabvar';
import { CommonModule } from '@angular/common';

interface Expense {
  date: string;
  category: string;
  categoryIcon: string;
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
      date: '24 Oct 14:20 PM',
      category: 'Food & Drink',
      categoryIcon: 'bi bi-cup-straw',
      description: 'The Gourmet Kitchen & Bistro',
      amount: 42.50
    },
    {
      date: '23 Oct 08:15 AM',
      category: 'Transport',
      categoryIcon: 'bi bi-taxi-front',
      description: 'Uber Technologies Inc.',
      amount: 18.20
    },
    {
      date: '22 Oct 18:45 PM',
      category: 'Shopping',
      categoryIcon: 'bi bi-bag',
      description: 'Amazon Web Services',
      amount: 149.99
    },
    {
      date: '20 Oct 10:00 AM',
      category: 'Housing',
      categoryIcon: 'bi bi-house-door',
      description: 'Metropolitan Rent Services',
      amount: 1250.00
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
