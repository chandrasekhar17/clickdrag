import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseRouterComponent } from './base-router.component';


const routes: Routes = [
    {
        path: '',
        component: BaseRouterComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BaseRoutingModule { }
