import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CashtrackService {

  private apiUrl = 'http://localhost:5095/api';

  constructor(private http: HttpClient) {}

  // GASTOS

  obtenerGastos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gastos`);
  }

  crearGasto(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gastos`, data);
  }

  eliminarGasto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/gastos/${id}`);
  }

  // CATEGORÍAS

  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  crearCategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, data);
  }
}