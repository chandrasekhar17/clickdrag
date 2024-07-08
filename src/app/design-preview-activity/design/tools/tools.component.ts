import { Component, OnInit } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';

import { CanvasSettingComponent } from './settings/canvas/canvas-setting.component';
import { ImageSettingComponent } from './settings/image-setting/image-setting.component';
import { MagnifyComponent } from './settings/magnify/magnify.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss'],
})
export class ToolsComponent implements OnInit {
  buttonPurpose = ButtonPurpose;
  DefaultDirectives: any[] = [
    { title: 'Canvas', expandPanel: true, Directive: CanvasSettingComponent, visible: true },
    { title: 'Image Description', expandPanel: true, Directive: ImageSettingComponent, visible: false },
    { title: 'Magnify', expandPanel: true, Directive: MagnifyComponent, visible: false },
  ];
  state: any;
  constructor(private cdService: CdStateService,
    private translate: TranslateService
  ) {
    this.state = cdService.getState();
    cdService.stateUpdated.subscribe(() => {
      if (cdService.leaderLineNodes.length === 0) {
        this.setVisible('Magnify', false);
      } else {
        this.setVisible('Magnify', true);
        this.translate.get('directive.magnify').subscribe((translation: string) => {
          this.DefaultDirectives[2].title = translation
        });
      }
    });
    cdService.selectionUpdated.subscribe((selection) => {
      if (selection.type === 'leaderLineNode') {
        this.setMagnify();
      } else if (selection.type === '') {
        this.setMagnify();
      }
    });
    cdService.expandToolsPanel.subscribe((bool) => {
      if (bool) {
        this.DefaultDirectives[1].expandPanel = false;
      }
    });
  }

  ngOnInit(): void {
    this.translate.get('directive.canvas').subscribe((translation: string) => {
      this.DefaultDirectives[0].title = translation;
    });
    this.cdService.bgImageDataUpdated.subscribe(() => {
      switch (this.state.activity.name) {
        case 'labeling':
          this.labelActivity();
          break;
        case 'grouping':
          this.groupActivity();
          break;
      }
    });
  }

  labelActivity() {
    if (this.state.frameData.frames[0].mediaAdded) {
      this.setVisible('Image Description', true);
      this.translate.get('directive.imageDescription').subscribe((translation: string) => {
        this.DefaultDirectives[1].title = translation;
      });
    } else {
      this.setVisible('Image Description', false);
    }

  }

  groupActivity() {
    let docks = this.state.dockData.docks;
    let isImageAdded: boolean = false;
    docks.forEach((dock) => {
      if (dock.isImageAdded) {
        isImageAdded = true;
      }
    });
    if (isImageAdded) {
      this.setVisible('Image Description', true);
      this.translate.get('directive.imageDescription').subscribe((translation: string) => {
        this.DefaultDirectives[1].title = translation;
      });
    } else {
      this.setVisible('Image Description', false);
    }
    if (this.cdService.imageDeleted && !this.state.dockData.docks.length) {
      this.setVisible('Image Description', false);
    }
  }

  setMagnify() {
    const docks = this.state.dockData.docks;
    if (docks.length > 0) {
      const leaderLine = docks.filter((item) => item.leaderLine?.branches && item.leaderLine?.branches.length > 0);
      if (leaderLine.length > 0) {
        this.setVisible('Magnify', true);
        this.translate.get('directive.magnify').subscribe((translation: string) => {
          this.DefaultDirectives[2].title = translation
        });
      } else {
        this.setVisible('Magnify', false);
      }
    }
  }

  expandPanel(index: number) {
    this.DefaultDirectives[index].expandPanel = !this.DefaultDirectives[index].expandPanel;

  }

  setVisible(name: string, value: boolean) {

    this.DefaultDirectives.forEach((item) => {
      if (item.title === name) {

        item.visible = value;
      }
    });
  }
}
