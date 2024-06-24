import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { TranscriptPopupComponent } from './components/transcript-popup/transcript-popup.component';
import { SafeHtmlPipe } from './pipes/safe-Html/safe-html.pipe';
import { NgxSharedModule } from '@mhe/ngx-shared';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { A11yModule } from '@angular/cdk/a11y';
import { LeaderlineComponent } from './components/leaderline/leaderline.component';
import { MagnifyPreviewComponent } from './components/magnify-preview/magnify-preview.component';
import { LabelsComponent } from '../shared/components/labels/labels.component';
import { SingleLabelComponent } from '../shared/components/labels/single-label/single-label.component';
import { DropzoneComponent } from '../shared/components/dropzone/dropzone.component';
import { UndoResetComponent } from './components/undo-reset/undo-reset.component';
import { GroupTitleComponent } from './components/group-title/group-title.component';
import { PickDropDirective } from './directives/pick-drop/pick-drop.directive';
import { BackgroundImageComponent } from './components/background-image/background-image.component';
import { SkipLinkComponent } from './components/skip-link/skip-link.component';

@NgModule({
  declarations: [
    LabelsComponent,
    SingleLabelComponent,
    AudioPlayerComponent,
    TranscriptPopupComponent,
    LeaderlineComponent,
    MagnifyPreviewComponent,
    SafeHtmlPipe,
    DropzoneComponent,
    UndoResetComponent,
    GroupTitleComponent,
    PickDropDirective,
    BackgroundImageComponent,
    SkipLinkComponent
  ],
  imports: [
    CommonModule,
    NgxSharedModule,
    DragDropModule,
    A11yModule,
    RouterModule
  ],
  exports: [
    LabelsComponent,
    SingleLabelComponent,
    AudioPlayerComponent,
    TranscriptPopupComponent,
    LeaderlineComponent,
    MagnifyPreviewComponent,
    DropzoneComponent,
    UndoResetComponent,
    GroupTitleComponent,
    PickDropDirective,
    SafeHtmlPipe,
    CommonModule,
    NgxSharedModule,
    DragDropModule,
    A11yModule,
    BackgroundImageComponent,
    SkipLinkComponent
  ]
})
export class SharedModule { }
