import { Component, OnInit, OnDestroy } from '@angular/core';
import { Nabvar } from '../nabvar/nabvar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashtrackService } from '../../services/cashtrack';
import { CurrencyService } from '../../services/s-conversor';
import { Gasto } from '../../interfaces/gasto';
import { Categoria } from '../../interfaces/categoria';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  imports: [Nabvar, CommonModule, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {
  // Variables para gastos
  gastos: Gasto[] = [];
  categorias: Categoria[] = [];
  totalGastado: number = 0;
  loading: boolean = false;
  error: string = '';
  
  // Variables para nuevo gasto
  nuevoGasto = {
    descripcion: '',
    monto: 0,
    categoriaNombre: '',
    fecha: '',
    detalle: ''
  };
  
  // Variables para conversor
  exchangeRate: number = 0;
  totalEnUSD: number = 0;
  isLoadingCurrency: boolean = false;
  currencyError: string = '';

  // Suscripciones para limpiar al destruir
  private subscriptions: Subscription = new Subscription();

  constructor(
    private cashtrackService: CashtrackService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los observables reactivos
    this.subscriptions.add(
      this.cashtrackService.gastos$.subscribe(gastos => {
        this.gastos = gastos;
        this.calcularTotalGastado();
      })
    );
    
    this.subscriptions.add(
      this.cashtrackService.categorias$.subscribe(categorias => {
        this.categorias = categorias;
      })
    );
    
    this.subscriptions.add(
      this.cashtrackService.total$.subscribe(total => {
        this.totalGastado = total;
        this.actualizarConversionTotal();
      })
    );
    
    // Cargar datos iniciales
    this.cargarDatosIniciales();
    this.cargarTasaCambio();
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    this.subscriptions.unsubscribe();
  }

  cargarDatosIniciales(): void {
    
    // Usar Promise.all para cargar en paralelo
    Promise.all([
      this.cashtrackService.obtenerGastos().toPromise(),
      this.cashtrackService.obtenerCategorias().toPromise()
    ]).finally(() => {
      this.loading = false;
    });
  }

  calcularTotalGastado(): void {
    // El total ya viene del BehaviorSubject, pero podemos recalcular localmente
    this.totalGastado = this.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  }

  cargarTasaCambio(): void {
    this.currencyService.getExchangeRate('GTQ', 'USD').subscribe({
      next: (response) => {
        this.exchangeRate = response.conversion_rate;
        this.actualizarConversionTotal();
        this.isLoadingCurrency = false;
      },
      error: (err) => {
        console.error('Error al cargar tasa de cambio:', err);
        this.currencyError = 'Error al cargar tasa de cambio';
        this.exchangeRate = 0.13;
        this.actualizarConversionTotal();
        this.isLoadingCurrency = false;
      }
    });
  }

  actualizarConversionTotal(): void {
    if (this.exchangeRate > 0) {
      this.totalEnUSD = parseFloat((this.totalGastado * this.exchangeRate).toFixed(2));
    } else {
      this.totalEnUSD = 0;
    }
  }

crearGasto(): void {
  // Validar campos requeridos
  if (!this.nuevoGasto.descripcion || !this.nuevoGasto.monto || !this.nuevoGasto.categoriaNombre) {
    this.error = 'Por favor complete los campos requeridos';
    setTimeout(() => {
      this.error = '';
    }, 3000);
    return;
  }

  if (this.nuevoGasto.monto <= 0) {
    this.error = 'El monto debe ser mayor a 0';
    setTimeout(() => {
      this.error = '';
    }, 3000);
    return;
  }

  const fechaActual = this.nuevoGasto.fecha || new Date().toISOString();

  const gastoData = {
    descripcion: this.nuevoGasto.descripcion,
    monto: this.nuevoGasto.monto,
    categoriaNombre: this.nuevoGasto.categoriaNombre,
    detalleDescripcion: this.nuevoGasto.detalle || '',
    fecha: fechaActual
  };

  this.loading = true;
  this.cashtrackService.crearGasto(gastoData).subscribe({
    next: (response) => {
      // FORZAR RECARGA MANUALMENTE
      
      this.limpiarFormulario();
      this.error = '';
      setTimeout(() => {
        window.location.reload(); // Esto refresca toda la página
      }, 500);
    
      // Opcional: Mostrar mensaje de éxito
    },
    error: (err) => {
      console.error('Error al crear gasto:', err);
      this.error = 'Error al crear el gasto';
      this.loading = false;
      setTimeout(() => {
        this.error = '';
      }, 3000);
    }
  });
}

  limpiarFormulario(): void {
    this.nuevoGasto = {
      descripcion: '',
      monto: 0,
      categoriaNombre: '',
      fecha: '',
      detalle: ''
    };
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const dia = date.getDate();
    const mes = date.toLocaleString('es-ES', { month: 'short' });
    const año = date.getFullYear();
    return `${dia} ${mes}, ${año}`;
  }

  getIconoPorCategoria(nombreCategoria: string): string {
    const categoria = this.categorias.find(c => c.nombre === nombreCategoria);
    return categoria ? categoria.icono : 'bi bi-tag';
  }

  get ultimosGastos(): Gasto[] {
    return this.gastos.slice(0, 5);
  }
}