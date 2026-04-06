import { Component, OnInit } from '@angular/core';
import { Nabvar } from '../nabvar/nabvar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../interfaces/categoria';

@Component({
  selector: 'app-categorias',
  imports: [Nabvar, CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias {
   // Datos de ejemplo (el otro desarrollador conectará con la API)
  categories: Categoria[] = [
    { id: 1, nombre: 'Alimentación', icono: 'bi bi-egg-fried' },
    { id: 2, nombre: 'Transporte', icono: 'bi bi-bus-front' },
    { id: 3, nombre: 'Compras', icono: 'bi bi-cart-fill'},
    { id: 4, nombre: 'Vivienda', icono: 'bi bi-house-door' },
    { id: 5, nombre: 'Entretenimiento', icono: 'bi bi-tv' },
    { id: 6, nombre: 'Salud', icono: 'bi bi-heart-pulse'}
  ];
  
  // Nueva categoría
  newCategory: Categoria = {
    id: 0,
    nombre: '',
    icono: 'bi bi-tag'
  };
  
  showModal: boolean = false;
  editingCategory: Categoria | null = null;
  error: string = '';
  
  // Lista de iconos disponibles
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

  constructor() {}

  // Abrir modal para agregar categoría
  openAddModal(): void {
    this.newCategory = {
      id: this.getNextId(),
      nombre: '',
      icono: 'bi bi-tag'
    };
    this.editingCategory = null;
    this.showModal = true;
  }

  // Abrir modal para editar categoría
  openEditModal(category: Categoria): void {
    this.editingCategory = { ...category };
    this.newCategory = { ...category };
    this.showModal = true;
  }

  // Cerrar modal
  closeModal(): void {
    this.showModal = false;
    this.newCategory = { id: 0, nombre: '', icono: 'bi bi-tag' };
    this.editingCategory = null;
    this.error = '';
  }

  // Guardar categoría (crear o actualizar)
  saveCategory(): void {
    if (!this.newCategory.nombre.trim()) {
      this.error = 'El nombre de la categoría es requerido';
      return;
    }

    if (this.editingCategory) {
      // Actualizar categoría existente
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
      if (index !== -1) {
        this.categories[index] = { ...this.newCategory, id: this.editingCategory!.id };
      }
    } else {
      // Crear nueva categoría
      this.categories.push({ ...this.newCategory });
    }
    
    this.closeModal();
  }

  // Eliminar categoría
  deleteCategory(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }

  // Obtener siguiente ID disponible
  getNextId(): number {
    const maxId = this.categories.length > 0 
      ? Math.max(...this.categories.map(c => c.id)) 
      : 0;
    return maxId + 1;
  }

  // Seleccionar icono
  selectIcon(iconValue: string): void {
    this.newCategory.icono = iconValue;
  }

  // Obtener color de fondo para el icono (opcional)

}
