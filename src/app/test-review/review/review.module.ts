import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedDesignModule } from 'src/app/design-preview-activity/shared/shared-design.module';

@NgModule({
    declarations: [ReviewComponent],
    imports: [
        CommonModule],
    providers: [],
    exports: []
})
export class ReviewModule {}
