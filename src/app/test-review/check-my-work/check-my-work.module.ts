import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { CheckMyWorkLabellingComponent } from './check-my-work-labelling/check-my-work-labelling.component';
import { CheckMyWorkComponent } from './check-my-work.component';
import { SharedDesignModule } from 'src/app/design-preview-activity/shared/shared-design.module';
import { CheckMyWorkGroupComponent } from './check-my-work-group/check-my-work-group.component';

@NgModule({
  declarations: [CheckMyWorkComponent, CheckMyWorkLabellingComponent, CheckMyWorkGroupComponent],
  imports: [CommonModule, SharedModule, SharedDesignModule],
})
export class CheckMyWorkModule {}
