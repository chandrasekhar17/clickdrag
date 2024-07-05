import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesignComponent } from './design.component';
import { ActivityViewComponent } from './activity-view/activity-view.component';
import { CanvasComponent } from './canvas/canvas.component';
import { LabelsComponent } from './canvas/labels/labels.component';
import { SvgComponent } from './canvas/svg/svg.component';
import { HeaderComponent } from './header/header.component';
import { ToolsComponent } from './tools/tools.component';
import { AddLabelComponent } from './add-label/add-label.component';
// import { LabelPopupComponent } from './components/label-popup/label-popup.component';
import { LabelComponent } from './add-label/label/label.component';
import { NoteComponent } from './add-label/note/note.component';
import { FeedbackComponent } from './add-label/feedback/feedback.component';
import { SpecialCharacterComponent } from '../../shared/components/special-character/special-character.component';
import { BackgroundImageComponent } from './canvas/svg/background-image/background-image.component';
import { DropzoneComponent } from './canvas/svg/dropzone/dropzone.component';
import { MediaComponent } from './components/media/media.component';
import { MediaPreviewComponent } from './components/media-preview/media-preview.component';
// import { AddMediaHeaderComponent } from './add-label/add-media-header/add-media-header.component';
import { AddMediaComponent } from './add-label/add-media/add-media.component';
import { MediaHeaderComponent } from './components/media-header/media-header.component';
import { CanvasSettingComponent } from './tools/settings/canvas/canvas-setting.component';
import { LabelsSettingComponent } from './tools/settings/labels/labels-setting.component';

import { DynamicHostDirective } from '../../shared/directives/dynamic-host.directive';
import { TooltipComponent } from '../../shared/components/tooltip/tooltip.component';
import { RichTextEditorModule } from '@mhe/tinymce';
import { SafeHtmlPipe } from '../../shared/pipes/safe-Html/safe-html.pipe';
import { EditImageDescriptionComponent } from './components/edit-image-description/edit-image-description.component';
import { GroupsComponent } from './canvas/groups/groups.component';
import { LeaderlineNodeComponent } from './leaderline-node/leaderline-node.component';
// import { LeaderlineComponent } from '../../shared/components/leaderline/leaderline.component';
import { DropzoneDescriptionComponent } from './add-label/dropzone-description/dropzone-description.component';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player.component';
import { TranscriptPopupComponent } from '../../shared/components/transcript-popup/transcript-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { A11yModule } from '@angular/cdk/a11y';
import { GroupDropzoneComponent } from './canvas/groups/group-dropzone/group-dropzone.component';
import { GroupAddImageComponent } from './canvas/groups/group-add-image/group-add-image.component';
import { GroupTextAreaComponent } from './canvas/groups/group-text-area/group-text-area.component';
import { ImageDescriptionComponent } from './tools/settings/image-description/image-description.component';
import { ImageSettingComponent } from './tools/settings/image-setting/image-setting.component';
import { MagnifyComponent } from './tools/settings/magnify/magnify.component';
// import { MagnifyPreviewComponent } from '../../shared/components/magnify-preview/magnify-preview.component';
import { SingleLabelComponent } from './canvas/labels/single-label/single-label.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { WarningMessageComponent } from './warning-message/warning-message.component';
import { SharedDesignModule } from '../shared/shared-design.module';
import { BackwardCompatibilityWarningsComponent } from './backward-compatibility-warnings/backward-compatibility-warnings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { ModalComponent } from './shared/modal/modal.component';
import { ToggleComponent } from './shared/toggle/toggle.component';
import { DropdownComponent } from './shared/dropdown/dropdown.component';
import { TooltipDirective } from './shared/tooltip/tooltip.directive';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    DesignComponent,
    ModalComponent,
    ActivityViewComponent,
    CanvasComponent,
    SvgComponent,
    LabelsComponent,
    AddLabelComponent,
    ToolsComponent,
    HeaderComponent,
    AddLabelComponent,
    LabelComponent,
    NoteComponent,
    FeedbackComponent,
    SpecialCharacterComponent,
    BackgroundImageComponent,
    DropzoneComponent,
    MediaComponent,
    MediaPreviewComponent,
    AddMediaComponent,
    MediaHeaderComponent,
    CanvasSettingComponent,
    LabelsSettingComponent,
    DynamicHostDirective,
    TooltipComponent,
    EditImageDescriptionComponent,
    GroupsComponent,
    LeaderlineNodeComponent,
    DropzoneDescriptionComponent,
    GroupDropzoneComponent,
    GroupAddImageComponent,
    GroupTextAreaComponent,
    ImageDescriptionComponent,
    ImageSettingComponent,
    MagnifyComponent,
    SingleLabelComponent,
    WarningMessageComponent,
    BackwardCompatibilityWarningsComponent,
    ToggleComponent,
    DropdownComponent,
    TooltipDirective,
  ],
  imports: [
    CommonModule,
    SharedDesignModule,
    SharedModule,
    RichTextEditorModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    // ClickOutsideModule,
    PortalModule,
    SharedModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',  // Set default language to Spanish
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
})
export class DesignModule { }
