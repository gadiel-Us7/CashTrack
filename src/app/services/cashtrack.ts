// services/cashtrack.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Gasto } from '../interfaces/gasto';
import { Categoria } from '../interfaces/categoria';

@Injectable({
  providedIn: 'root',
})
export class CashtrackService {
  private apiUrl = 'https://localhost:7115/api';
  
  // Subjects para datos reactivos (almacenan el estado)
  private gastosSubject = new BehaviorSubject<Gasto[]>([]);
  private categoriasSubject = new BehaviorSubject<Categoria[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  
  // Observables públicos (para que los componentes se suscriban)
  gastos$ = this.gastosSubject.asObservable();
  categorias$ = this.categoriasSubject.asObservable();
  total$ = this.totalSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============ GASTOS ============
  
  obtenerGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiUrl}/gastos`).pipe(
      tap(gastos => {
        this.gastosSubject.next(gastos); // Actualizar el BehaviorSubject
        this.calcularYActualizarTotal(gastos); // Actualizar el total
      })
    );
  }

  obtenerTotalGastos(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/Gastos/total`).pipe(
      map(response => response.total),
      tap(total => this.totalSubject.next(total))
    );
  }

  crearGasto(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gastos`, data).pipe(
      tap(() => this.refrescarTodosLosDatos()) // Refrescar después de crear
    );
  }

  actualizarGasto(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/gastos/${id}`, data).pipe(
      tap(() => this.refrescarTodosLosDatos()) // Refrescar después de actualizar
    );
  }

  eliminarGasto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/gastos/${id}`).pipe(
      tap(() => this.refrescarTodosLosDatos()) // Refrescar después de eliminar
    );
  }

  // ============ CATEGORÍAS ============

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`).pipe(
      tap(categorias => this.categoriasSubject.next(categorias))
    );
  }

  crearCategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, data).pipe(
      tap(() => this.refrescarCategorias()) // Refrescar solo categorías
    );
  }

  actualizarCategoria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categorias/${id}`, data).pipe(
      tap(() => this.refrescarCategorias())
    );
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`).pipe(
      tap(() => this.refrescarCategorias())
    );
  }

  // ============ MÉTODOS PRIVADOS DE ACTUALIZACIÓN ============
  
  private refrescarTodosLosDatos(): void {
    // Refrescar gastos (esto automáticamente actualiza el total)
    this.obtenerGastos().subscribe();
    // Refrescar categorías
    this.obtenerCategorias().subscribe();
  }

  private refrescarCategorias(): void {
    this.obtenerCategorias().subscribe();
  }

  private calcularYActualizarTotal(gastos: Gasto[]): void {
    const total = gastos.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
    this.totalSubject.next(total);
  }
}