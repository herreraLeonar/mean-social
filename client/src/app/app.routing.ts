import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

//component
import{LoginComponent} from './components/login/login.component';
import{RegisterComponent} from './components/register/register.component';

const appRouter: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'registro', component: RegisterComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders=RouterModule.forRoot(appRouter);