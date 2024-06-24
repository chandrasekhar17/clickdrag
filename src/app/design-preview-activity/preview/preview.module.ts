import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewComponent } from './preview.component';
import { PreviewSvgComponent } from './preview-svg/preview-svg.component';
import { PreviewGroupComponent } from './preview-group/preview-group.component';
import { SharedDesignModule } from '../shared/shared-design.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [PreviewComponent, PreviewSvgComponent, PreviewGroupComponent],
    imports: [
        CommonModule,
        SharedDesignModule,
        SharedModule
    ]
})
export class PreviewModule { }
