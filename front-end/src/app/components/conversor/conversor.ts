// conversor.ts - Versión definitiva sin bucles
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Nabvar } from '../nabvar/nabvar';
import { CurrencyService, CurrencyResponse } from '../../services/s-conversor';

@Component({
  selector: 'app-conversor',
  standalone: true,
  imports: [Nabvar, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './conversor.html',
  styleUrls: ['./conversor.css']
})

export class Conversor implements OnInit {
  fromAmount: number = 1250;
  toAmount: number = 0;
  fromCurrency: string = 'GTQ';
  toCurrency: string = 'USD';
  exchangeRate: number = 0;
  isLoading: boolean = false;
  error: string = '';

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    // Solo cargar la tasa inicial, no hacer conversión aún
    this.loadExchangeRateOnly();
  }

  // Método SOLO para cargar la tasa de cambio
  loadExchangeRateOnly(): void {
    this.isLoading = false;
    this.error = '';
    
    this.currencyService.getExchangeRate(this.fromCurrency, this.toCurrency)
      .subscribe({
        next: (response: CurrencyResponse) => {
          this.exchangeRate = response.conversion_rate;
          // Una vez que tenemos la tasa, hacemos la conversión inicial
          this.calculateConversion();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar tasa:', err);
          this.error = 'Error al cargar la tasa de cambio';
          this.isLoading = false;
        }
      });
  }

    onFromAmountInput(event: any): void {
      
    // Obtener el valor ingresado
    let value = event.target.value;

  
    // Reemplazar coma por punto si es necesario
    value = value.replace(',', '.');

    
    
    // Limpiar caracteres no numéricos (excepto punto decimal)
    value = value.replace(/[^\d.-]/g, '');
    
    // Convertir a número
    let numericValue = parseFloat(value);
    
    // Validar que sea un número válido
    if (isNaN(numericValue)) {
      numericValue = 0;
    }
    
    // Actualizar el modelo
    this.fromAmount = numericValue;
    
    // Mostrar el valor formateado en el input
    event.target.value = numericValue;
    
    // Ejecutar conversión
    this.calculateConversion();
  }

  


  // Método para convertir usando la tasa actual (sin llamar a la API)
  calculateConversion(): void {
    if (this.fromAmount > 0 && this.exchangeRate > 0) {
      this.toAmount = parseFloat((this.fromAmount * this.exchangeRate).toFixed(2));
      //console.log(this.toAmount);
    } else {
      this.toAmount = 0;
    }
  }

  // Método para convertir con API (cuando se necesita tasa actualizada)
  convertWithAPI(): void {
    if (this.fromAmount <= 0) {
      this.toAmount = 0;
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.currencyService.convertCurrency(
      this.fromCurrency, 
      this.toCurrency, 
      this.fromAmount
    ).subscribe({
      next: (response: CurrencyResponse) => {
        this.toAmount = response.conversion_result;
        this.exchangeRate = response.conversion_rate;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en la conversión:', err);
        this.error = 'Error al obtener la conversión';
        this.isLoading = false;
      }
    });
  }

  // Cuando cambia el monto - solo recalcula, no llama a API
  onFromAmountChange(value: number): void {
    this.fromAmount = value;
    this.calculateConversion(); // Usa la tasa que ya tenemos
  }

  // Cuando se hace clic en "Convertir ahora" - obtiene tasa actualizada
  onConvertClick(): void {
    this.convertWithAPI();
  }

  // Intercambiar monedas
  swapCurrencies(): void {
    this.isLoading = false;
    
    // Intercambiar montos
    const tempAmount = this.fromAmount;
    this.fromAmount = this.toAmount;
    this.toAmount = tempAmount;

    // Intercambiar monedas
    const tempCurrency = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = tempCurrency;

    // Recargar la tasa con las nuevas monedas
    this.currencyService.getExchangeRate(this.fromCurrency, this.toCurrency)
      .subscribe({
        next: (response: CurrencyResponse) => {
          this.exchangeRate = response.conversion_rate;
          // Recalcular con el nuevo monto
          this.calculateConversion();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Error al obtener tasa de cambio';
          this.isLoading = false;
        }
      });
  }
}