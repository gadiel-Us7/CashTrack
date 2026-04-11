import { Component, OnInit, OnDestroy } from '@angular/core';
import { Nabvar } from '../nabvar/nabvar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../interfaces/categoria';
import { CashtrackService } from '../../services/cashtrack';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categorias',
  imports: [Nabvar, CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit, OnDestroy {
  categories: Categoria[] = [];
  
  newCategory: Categoria = {
    idCategoria: 0,
    nombre: '',
    icono: 'bi bi-tag'
  };
  
  showModal: boolean = false;
  editingCategory: Categoria | null = null;
  error: string = '';
  loading: boolean = false;
  
  availableIcons = [
    { name: 'Alimentación', value: 'bi bi-egg-fried' },
    { name: 'Compras', value: 'bi bi-cart-fill' },
    { name: 'Transporte', value: 'bi bi-bus-front' },
    { name: 'Gasolina', value: 'bi bi-fuel-pump' },
    { name: 'Vivienda', value: 'bi bi-house-door' },
    { name: 'Alquiler', value: 'bi bi-building' },
    { name: 'Servicios', value: 'bi bi-lightbulb' },
    { name: 'Entretenimiento', value: 'bi bi-tv' },
    { name: 'Cine', value: 'bi bi-film' },
    { name: 'Salud', value: 'bi bi-heart-pulse' },
    { name: 'Farmacia', value: 'bi bi-capsule' },
    { name: 'Educación', value: 'bi bi-book' },
    { name: 'Ahorro', value: 'bi bi-piggy-bank' },
    { name: 'Teléfono', value: 'bi bi-phone' },
    { name: 'Regalos', value: 'bi bi-gift' },
    { name: 'Mascotas', value: 'bi bi-tsunami' },
    { name: 'Default', value: 'bi bi-tag' }
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private cashtrackService: CashtrackService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de categorías
    this.subscriptions.add(
      this.cashtrackService.categorias$.subscribe(categorias => {
        this.categories = categorias;
      })
    );
    
    // Recargar datos cada vez que se navega a este componente
    this.subscriptions.add(
      this.route.params.subscribe(() => {
        console.log('Recargando datos de Categorías...');
        this.cargarCategorias();
      })
    );
    
    this.cargarCategorias();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarCategorias(): void {
    this.loading = true;
    this.cashtrackService.obtenerCategorias().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.error = 'No se pudieron cargar las categorías';
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.newCategory = {
      idCategoria: 0,
      nombre: '',
      icono: 'bi bi-tag'
    };
    this.editingCategory = null;
    this.showModal = true;
    this.error = '';
  }

  openEditModal(category: Categoria): void {
    this.editingCategory = { ...category };
    this.newCategory = { ...category };
    this.showModal = true;
    this.error = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.newCategory = { idCategoria: 0, nombre: '', icono: 'bi bi-tag' };
    this.editingCategory = null;
    this.error = '';
  }

  saveCategory(): void {
    if (!this.newCategory.nombre.trim()) {
      this.error = 'El nombre de la categoría es requerido';
      return;
    }

    if (this.editingCategory) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory(): void {
    this.loading = true;
    const categoriaData = {
      nombre: this.newCategory.nombre,
      icono: this.newCategory.icono
    };

    this.cashtrackService.crearCategoria(categoriaData).subscribe({
      next: () => {
        this.closeModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al crear categoría:', err);
        this.error = 'Error al crear la categoría';
        this.loading = false;
      }
    });
  }

  updateCategory(): void {
    this.loading = true;
    const categoriaData = {
      nombre: this.newCategory.nombre,
      icono: this.newCategory.icono
    };

    this.cashtrackService.actualizarCategoria(this.editingCategory!.idCategoria, categoriaData).subscribe({
      next: () => {
        this.closeModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al actualizar categoría:', err);
        this.error = 'Error al actualizar la categoría';
        this.loading = false;
      }
    });
  }

  deleteCategory(idCategoria: number): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.loading = true;
      this.cashtrackService.eliminarCategoria(idCategoria).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al eliminar categoría:', err);
          this.error = 'Error al eliminar la categoría';
          this.loading = false;
        }
      });
    }
  }

  selectIcon(iconValue: string): void {
    this.newCategory.icono = iconValue;
  }
}