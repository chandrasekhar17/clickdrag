import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TestComponent } from './test.component';
import { TestGroupComponent } from './test-group/test-group.component';
import { TestGroupDropzoneComponent } from './test-group/test-group-dropzone/test-group-dropzone.component';
import { SharedDesignModule } from 'src/app/design-preview-activity/shared/shared-design.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestLabelingComponent } from './test-labeling/test-labeling.component';


@NgModule({
    declarations: [TestComponent, TestGroupComponent, TestGroupDropzoneComponent, TestLabelingComponent],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule
    ],
    exports: []
})
export class TestModule { }
