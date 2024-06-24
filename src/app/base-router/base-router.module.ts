import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseRouterComponent } from './base-router.component';
import { BaseRoutingModule } from './base-router.routing.module';

@NgModule({
    declarations: [BaseRouterComponent],
    imports: [
        CommonModule,
        BaseRoutingModule
    ]
})
export class BaseRouterModule { }