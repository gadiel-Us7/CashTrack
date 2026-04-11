import { Component, OnInit, OnDestroy } from '@angular/core';
import { Nabvar } from '../nabvar/nabvar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashtrackService } from '../../services/cashtrack';
import { Gasto } from '../../interfaces/gasto';
import { Categoria } from '../../interfaces/categoria';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

interface CategorySummary {
  category: string;
  icon: string;
  total: number;
}

@Component({
  selector: 'app-gastos',
  imports: [Nabvar, CommonModule, FormsModule],
  templateUrl: './gastos.html',
  styleUrl: './gastos.css',
})
export class Gastos implements OnInit, OnDestroy {
  
  expenses: any[] = [];
  categorias: Categoria[] = [];
  error: string = '';
  
  // Modal para editar
  showEditModal: boolean = false;
  editingExpense: any = {
    idGasto: 0,
    descripcion: '',
    monto: 0,
    fecha: '',
    categoria: '',
    detalle: ''
  };

  // Modal de confirmación para eliminar
  showDeleteModal: boolean = false;
  deleteExpenseId: number = 0;
  deleteExpenseDescription: string = '';

  // Suscripciones
  private subscriptions: Subscription = new Subscription();

  constructor(
    private cashtrackService: CashtrackService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de gastos
    this.subscriptions.add(
      this.cashtrackService.gastos$.subscribe(gastos => {
        this.transformarGastos(gastos);
      })
    );
    
    // Suscribirse a cambios de categorías
    this.subscriptions.add(
      this.cashtrackService.categorias$.subscribe(categorias => {
        this.categorias = categorias;
        this.transformarGastos(this.getCurrentGastos());
      })
    );
    
    // Recargar datos cada vez que se navega a este componente
    this.subscriptions.add(
      this.route.params.subscribe(() => {
        console.log('Recargando datos de Gastos...');
        this.cargarGastos();
        this.cargarCategorias();
      })
    );
    
    // Cargar datos iniciales
    this.cargarGastos();
    this.cargarCategorias();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getCurrentGastos(): Gasto[] {
    let currentGastos: Gasto[] = [];
    const sub = this.cashtrackService.gastos$.subscribe(gastos => {
      currentGastos = gastos;
    });
    sub.unsubscribe();
    return currentGastos;
  }

  transformarGastos(gastos: Gasto[]): void {
    this.expenses = gastos.map(gasto => ({
      idGasto: gasto.idGasto,
      date: this.formatFechaMostrar(gasto.fecha),
      category: gasto.categoria,
      categoryIcon: this.getIconoPorCategoria(gasto.categoria),
      description: gasto.descripcion,
      detalle: gasto.detalle,
      amount: gasto.monto,
      fechaOriginal: gasto.fecha
    }));
  }

  cargarGastos(): void {
    this.cashtrackService.obtenerGastos().subscribe({
      error: (err) => {
        console.error('Error al cargar gastos:', err);
        this.error = 'No se pudieron cargar los gastos';
      }
    });
  }

  cargarCategorias(): void {
    this.cashtrackService.obtenerCategorias().subscribe({
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  getIconoPorCategoria(nombreCategoria: string): string {
    const categoria = this.categorias.find(c => c.nombre === nombreCategoria);
    return categoria ? categoria.icono : 'bi bi-tag';
  }

  formatFechaMostrar(fecha: string): string {
    const date = new Date(fecha);
    const dia = date.getDate();
    const mes = date.toLocaleString('es-ES', { month: 'short' });
    const año = date.getFullYear();
    const horas = date.getHours();
    const minutos = date.getMinutes();
    const ampm = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas % 12 || 12;
    return `${dia} ${mes} ${año} ${horas12}:${minutos.toString().padStart(2, '0')} ${ampm}`;
  }

  formatFechaInput(fecha: string): string {
    return fecha ? fecha.split('T')[0] : '';
  }

  get categorySummary(): CategorySummary[] {
    const summaryMap = new Map<string, number>();
    
    this.expenses.forEach(expense => {
      const currentTotal = summaryMap.get(expense.category) || 0;
      summaryMap.set(expense.category, currentTotal + expense.amount);
    });
    
    return Array.from(summaryMap.entries()).map(([category, total]) => ({
      category,
      icon: this.getIconoPorCategoria(category),
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

  openEditModal(expense: any): void {
    this.editingExpense = {
      idGasto: expense.idGasto,
      descripcion: expense.description,
      monto: expense.amount,
      fecha: this.formatFechaInput(expense.fechaOriginal),
      categoria: expense.category,
      detalle: expense.detalle || ''
    };
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
    this.editingExpense = {
      idGasto: 0,
      descripcion: '',
      monto: 0,
      fecha: '',
      categoria: '',
      detalle: ''
    };
    this.error = '';
  }

  openDeleteModal(idGasto: number, description: string): void {
    this.deleteExpenseId = idGasto;
    this.deleteExpenseDescription = description;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteExpenseId = 0;
    this.deleteExpenseDescription = '';
  }

  saveGasto(): void {
    if (!this.editingExpense.descripcion || !this.editingExpense.monto || !this.editingExpense.categoria) {
      this.error = 'Por favor complete los campos requeridos';
      return;
    }
    
    const gastoData = {
      descripcion: this.editingExpense.descripcion,
      monto: this.editingExpense.monto,
      fecha: this.editingExpense.fecha,
      categoriaNombre: this.editingExpense.categoria,
      detalleDescripcion: this.editingExpense.detalle || ''
    };

    this.cashtrackService.actualizarGasto(this.editingExpense.idGasto, gastoData).subscribe({
      next: () => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      },
      error: (err) => {
        console.error('Error al actualizar gasto:', err);
        this.error = 'Error al actualizar el gasto';
      }
    });
  }

  deleteGasto(): void {
    this.cashtrackService.eliminarGasto(this.deleteExpenseId).subscribe({
      next: () => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      },
      error: (err) => {
        console.error('Error al eliminar gasto:', err);
        this.error = 'Error al eliminar el gasto';
        this.closeDeleteModal();
      }
    });
  }
}