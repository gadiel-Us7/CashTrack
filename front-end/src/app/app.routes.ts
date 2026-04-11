import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Gastos } from './components/gastos/gastos';
import { Conversor } from './components/conversor/conversor';
import { Categorias } from './components/categorias/categorias';

export const routes: Routes = [
    { path: '', component: Inicio },
    {path: 'gastos', component: Gastos},
    {path:'conversor', component:Conversor},
    {path: 'categorias', component:Categorias}
];
