// services/s-conversor.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CurrencyResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'https://api.budjet.org/fiat';

  constructor(private http: HttpClient) {}

  convertCurrency(from: string, to: string, amount: number): Observable<CurrencyResponse> {
    const url = `${this.apiUrl}/${from}/${to}/${amount}`;
    return this.http.get<CurrencyResponse>(url);
  }

  getExchangeRate(from: string, to: string): Observable<CurrencyResponse> {
    const url = `${this.apiUrl}/${from}/${to}/1`;
    return this.http.get<CurrencyResponse>(url);
  }
}