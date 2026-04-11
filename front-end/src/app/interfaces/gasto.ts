export interface Gasto {
    idGasto: number;
    descripcion: string;
    monto: number;
    fecha: string;      // o Date si prefieres
    categoria: string;
    detalle: string;
    fechaRegistro: string;  // o Date
}
