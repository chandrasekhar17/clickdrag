import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ToggleableInputDirective } from '@mhe/ngx-shared/shared';
import { TranslateService } from '@mhe/ngx-shared/translate';
import { provideValueAccessor } from '@mhe/ngx-shared/utils';

// import { TogglePlacement } from './placement';

@Component({
  providers: [provideValueAccessor(ToggleComponent)],
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent extends ToggleableInputDirective {
  get srLabel() {
    return this.checked ? this.onLabel : this.offLabel;
  }
  @Input() labelPosition = 'right';
  @Input() enableLight = false;
  srSwitch: string | undefined = 'switch';
  onLabel: string | undefined = 'on';
  offLabel: string | undefined = 'off';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private liveAnnouncer: LiveAnnouncer
  ) {
    super(changeDetectorRef);

    this.translate.translate('ngx-shared-switch').subscribe((val) => {
      this.srSwitch = val;
    });

    this.translate.translate('ngx-shared-on').subscribe((val) => {
      this.onLabel = val;
    });

    this.translate.translate('ngx-shared-off').subscribe((val) => {
      this.offLabel = val;
    });
  }

  onKeyPressed(e: KeyboardEvent) {
    e.preventDefault();
    if (e.key === ' ') {
      this.checked = !this.checked;
      this.change.emit(this.checked);
    }
  }

  changeHandler() {
    if (this.srLabel) {
      this.liveAnnouncer.announce(this.srLabel);
    }
  }

  getLabelPosition(position: string, enableLight: boolean) {
    if (enableLight) {
      return position === 'left' ? 'position-left inverted' : 'position-right inverted';
    } else {
      return position === 'left' ? 'position-left' : 'position-right';
    }
  }
}