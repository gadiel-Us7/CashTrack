import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Gastos } from './components/gastos/gastos';

export const routes: Routes = [
    { path: '', component: Inicio },
    {path: 'gastos', component: Gastos}
];
