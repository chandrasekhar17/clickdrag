import { Component, Input, OnInit } from '@angular/core';
import { ButtonPurpose, ButtonType } from '@mhe/ngx-shared';
import {
  TranscriptPopupService,
  TranscriptPopupOptions,
} from '../../services/transcript-popup/transcript-popup.service';

import { CdStateService } from '../../../services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../constants/appconfig';

export interface positionConfig {
  x: number;
  y: number;
}

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
  @Input() audioData: any;
  @Input() audioFile: string;
  @Input() boundary: string;
  @Input() dropZoneEle: any;
  @Input() isDisabled: boolean;
  @Input() isInsideDropzone: boolean;
  @Input() isCaptionAvailable: boolean;

  _buttonPurpose = ButtonPurpose;
  buttonType = ButtonType;
  isPlayable = false;
  transcriptPosition: positionConfig = { x: 0, y: 0 };
  state: any;

  constructor(private transcriptPopup: TranscriptPopupService, private cdState: CdStateService) {
    this.state = this.cdState.getState();
  }

  ngOnInit(): void {
    this.transcriptPopup.stop$.subscribe(() => {
      this.isPlayable = false;
    });
  }

  onAudioPlayer(ev) {
    ev.stopPropagation();
    if (this.transcriptPopup.isPlaying) {
      this.transcriptPopup.audioStop();
      this.transcriptPopup.close();
      this.isPlayable = false;
      if (this.transcriptPopup.currentAudio === this.audioFile) {
        return;
      }
    }
    this.isPlayable = !this.isPlayable;
    this.isPlayable ? this.onTranscript(ev) : this.transcriptPopup.close();
    if (this.isPlayable) {
      this.transcriptPopup.audioPlay(this.audioFile).subscribe((event) => {
        if (event['type'] === 'ended') {
          this.isPlayable = false;
          this.transcriptPopup.close();
        }
      });
    }
  }

  onTranscript(ev) {
    if (this.transcriptPopup.currentTranscript === this.audioData) return;
    this.transcriptPositionValue(ev);
    const option: TranscriptPopupOptions = {
      boundary: this.boundary,
      audioData: this.audioData,
      position: this.transcriptPosition,
    };
    if (this.isCaptionAvailable) this.transcriptPopup.open(option);
  }

  transcriptPositionValue(ev) {
    let mediaWrapEl: any = '';
    let pos: any;
    if (this.boundary === '.scrollable-body') {
      mediaWrapEl = ev.currentTarget.closest('.preview-media');
      pos = {
        x: mediaWrapEl.offsetLeft + mediaWrapEl.offsetWidth,
        y: mediaWrapEl.offsetTop,
      };
    } else {
      mediaWrapEl = this.isInsideDropzone ? ev.currentTarget.closest('.drop-zone') : ev.currentTarget.closest('.media-audio');
      const position = mediaWrapEl.getBoundingClientRect();
      const canvasHeight = this.state.canvas.height / 2;
      if (canvasHeight <= position.top) {
        pos = {
          x: position.right + 10,
          y: position.y - 265,
        };
      } else {
        pos = {
          x: position.right + 10,
          y: position.y - 55,
        };
      }

      const defaultWidth = pos.width;
      const defaultHeight = pos.height;
      try {
        let svgCanvas;
        if (this.state.activity.name === 'labeling') {
          svgCanvas = document.getElementById("svg-canvas");
        } else {
          svgCanvas = document.getElementById("js-groupActivityContainer");
        }
        pos = this.setAudioTranscriptPopupPos();
        pos.x += (this.state.canvas.width - svgCanvas.offsetWidth);
      } catch (error) {
        pos.width = defaultWidth;
        pos.height = defaultHeight;
      }

      // this.getAudioTranscriptPosition(pos);
      // pos.width = 0;
      // pos.height = 0;
      // try {
      //   if (EZ.mode === 'preview' || EZ.mode === "test") {
      //     const modalAudioTranscript = { width: 400, height: 264 };
      //     const dropZoneCords = this.dropZone.getBoundingClientRect();
      //     const separationGap = APP_CONFIG.NEW_DOCK_SEPARATION_GAP;
      //     position.width = modalAudioTranscript.width;
      //     position.height = modalAudioTranscript.height;
      //     position.x = dropZoneCords.x + modalAudioTranscript.width + dropZoneCords.width + (separationGap * 2);
      //     position.y = dropZoneCords.y - modalAudioTranscript.height - (separationGap * 2);
      //     this.setAudioTranscriptPosition(pos);
      //   }
      // } catch (error) {
      //   pos.width = defaultWidth;
      //   pos.height = defaultHeight;
      // }

    }
    this.transcriptPosition = {
      x: pos.x,
      y: pos.y,
    };
  }

  setAudioTranscriptPopupPos() {
    const dropZoneCords = this.dropZoneEle.getBoundingClientRect();
    const dropZoneCord = dropZoneCords;
    const modalAudioTranscript = { width: 400, height: 264 };
    let svgCanvas;
    if (this.state.activity.name === 'labeling') {
      svgCanvas = document.getElementById("svg-canvas");
    } else {
      svgCanvas = document.getElementById("js-groupActivityContainer");
    }
    dropZoneCord.x -= this.state.canvas.width - svgCanvas.offsetWidth;
    const separationMargin = APP_CONFIG.NEW_DOCK_SEPARATION_GAP;
    const canvas = this.state.canvas;
    let canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    canvasWidth = svgCanvas.offsetWidth;

    const leftUp = {
      x: dropZoneCord.x - modalAudioTranscript.width - separationMargin < separationMargin ? separationMargin : dropZoneCord.x - modalAudioTranscript.width - separationMargin,
      y: dropZoneCord.y - (modalAudioTranscript.height - dropZoneCord.height) < separationMargin ? separationMargin : dropZoneCord.y - (modalAudioTranscript.height - dropZoneCord.height),
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    };
    const left = {
      x: dropZoneCord.x - modalAudioTranscript.width - separationMargin < separationMargin ? separationMargin : dropZoneCord.x - modalAudioTranscript.width - separationMargin,
      y: dropZoneCord.y < separationMargin ? separationMargin : dropZoneCord.y,
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    };
    const rightUp = {
      x: dropZoneCord.x + dropZoneCord.width + separationMargin > canvasWidth ? canvasWidth - modalAudioTranscript.width : dropZoneCord.x + dropZoneCord.width + separationMargin,
      y: dropZoneCord.y - (modalAudioTranscript.height - dropZoneCord.height) < separationMargin ? separationMargin : dropZoneCord.y - (modalAudioTranscript.height - dropZoneCord.height),
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    }
    const right = {
      x: dropZoneCord.x + dropZoneCord.width + separationMargin > canvasWidth ? canvasWidth - modalAudioTranscript.width : dropZoneCord.x + dropZoneCord.width + separationMargin,
      y: dropZoneCord.y,
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    };
    const topLeft = {
      x: dropZoneCord.x - (modalAudioTranscript.width - dropZoneCord.width) < separationMargin ? separationMargin : dropZoneCord.x - (modalAudioTranscript.width - dropZoneCord.width),
      y: dropZoneCord.y - modalAudioTranscript.height - separationMargin < separationMargin ? separationMargin : dropZoneCord.y - modalAudioTranscript.height - separationMargin,
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    };
    const top = {
      x: dropZoneCord.x,
      y: dropZoneCord.y - modalAudioTranscript.height - separationMargin < separationMargin ? separationMargin : dropZoneCord.y - modalAudioTranscript.height - separationMargin,
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    };
    const bottomLeft = {
      x: dropZoneCord.x - (modalAudioTranscript.width - dropZoneCord.width) < separationMargin ? separationMargin : dropZoneCord.x - (modalAudioTranscript.width - dropZoneCord.width),
      y: dropZoneCord.y + dropZoneCord.height + separationMargin > canvasHeight ? canvasHeight - modalAudioTranscript.height : dropZoneCord.y + dropZoneCord.height + separationMargin,
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    }
    const bottom = {
      x: dropZoneCord.x,
      y: dropZoneCord.y + dropZoneCord.height + separationMargin > canvasHeight ? canvasHeight - modalAudioTranscript.height : dropZoneCord.y + dropZoneCord.height + separationMargin,
      width: modalAudioTranscript.width, height: modalAudioTranscript.height
    };

    if (this.state.activity.name === 'labeling') {
      if (!this.checkAllDocksOverlapping(left) && this.checkForCanvasOverlap(left)) {
        return left;
      } else if (!this.checkAllDocksOverlapping(leftUp) && this.checkForCanvasOverlap(leftUp)) {
        return leftUp;
      } else if (!this.checkAllDocksOverlapping(right) && this.checkForCanvasOverlap(right)) {
        return right;
      } else if (!this.checkAllDocksOverlapping(rightUp) && this.checkForCanvasOverlap(rightUp)) {
        return rightUp;
      } else if (!this.checkAllDocksOverlapping(top) && this.checkForCanvasOverlap(top)) {
        return top;
      } else if (!this.checkAllDocksOverlapping(topLeft) && this.checkForCanvasOverlap(topLeft)) {
        return topLeft;
      } else if (!this.checkAllDocksOverlapping(bottom) && this.checkForCanvasOverlap(bottom)) {
        return bottom;
      } else if (!this.checkAllDocksOverlapping(bottomLeft) && this.checkForCanvasOverlap(bottomLeft)) {
        return bottomLeft;
      }

    }

    if (this.state.activity.name === 'grouping') {
      rightUp.x -= (2 * APP_CONFIG.NEW_DOCK_SEPARATION_GAP);
      bottom.x -= (2 * APP_CONFIG.NEW_DOCK_SEPARATION_GAP);
      top.x -= (2 * APP_CONFIG.NEW_DOCK_SEPARATION_GAP);
      leftUp.x -= (2 * APP_CONFIG.NEW_DOCK_SEPARATION_GAP);

      rightUp.x = rightUp.x < APP_CONFIG.NEW_DOCK_SEPARATION_GAP ? APP_CONFIG.NEW_DOCK_SEPARATION_GAP : rightUp.x;
      bottom.x = bottom.x < APP_CONFIG.NEW_DOCK_SEPARATION_GAP ? APP_CONFIG.NEW_DOCK_SEPARATION_GAP : bottom.x;
      top.x = top.x < APP_CONFIG.NEW_DOCK_SEPARATION_GAP ? APP_CONFIG.NEW_DOCK_SEPARATION_GAP : top.x;
      leftUp.x = leftUp.x < APP_CONFIG.NEW_DOCK_SEPARATION_GAP ? APP_CONFIG.NEW_DOCK_SEPARATION_GAP : leftUp.x;
    }

    if (rightUp.x + rightUp.width <= canvasWidth) {
      return rightUp;
    } else if (bottomLeft.y + bottom.height < canvasHeight) {
      return bottomLeft;
    } else if (bottom.y + bottom.height < canvasHeight) {
      return bottom;
    } else if (top.y >= 0) {
      return top;
    } else if (leftUp.x >= 0) {
      return leftUp;
    }
  }

  checkForCanvasOverlap(pos) {
    const canvas = this.state.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    let flag = true;
    const labelMargin = (document.getElementsByClassName('label-header')[0] as HTMLElement);

    if (pos.x < 0) {
      flag = false;
    } else if (pos.x + pos.width > canvasWidth - labelMargin.offsetWidth) {
      flag = false;
    } else if (pos.y < 0) {
      flag = false;
    } else if (pos.y + pos.height > canvasHeight) {
      flag = false;
    }
    return flag;
  }

  // setAudioTranscriptPosition(position) {
  //   console.log('Position :', position);
  //   const separationGap = APP_CONFIG.NEW_DOCK_SEPARATION_GAP;
  //   const dropZoneCords = this.dropZone.getBoundingClientRect();
  //   const svgCanvas = document.getElementById("svg-canvas");
  //   const svgHeight = svgCanvas.offsetHeight;
  //   // if (EZ.mode === 'test') {
  //   //   svgHeight -= 50;
  //   // }
  //   const modalAudioTranscript = { width: 400, height: 264 };

  //   if (position.x + position.width + separationGap > svgCanvas.offsetWidth) {
  //     position.x = svgCanvas.offsetWidth - modalAudioTranscript.width + dropZoneCords.width;
  //   }

  //   if (position.y + position.height + separationGap > svgHeight) {
  //     position.y = svgHeight - modalAudioTranscript.height + dropZoneCords.height;
  //   }

  //   position.x = position.x < separationGap ? separationGap : position.x;
  //   position.y = position.y < separationGap ? separationGap : position.y;

  //   let maxBoundry = dropZoneCords.y + dropZoneCords.height + position.height + (separationGap * 2);
  //   maxBoundry = maxBoundry > svgHeight ? svgHeight : maxBoundry;

  //   let shift = this.checkPosInSingleShift(position, maxBoundry);
  //   if (shift === 'unmatch' && position.x > separationGap) {
  //     position.x = position.x - 1;
  //     this.setAudioTranscriptPosition(position);
  //   } else {
  //     //Do Nothing.
  //     console.log('Pos :', this.checkAllDocksOverlapping(position));
  //   }
  // }

  // checkPosInSingleShift(pos, maxY) {
  //   if (this.checkAllDocksOverlapping(pos)) {
  //     if (pos.y < maxY) {
  //       pos.y++;
  //       return this.checkPosInSingleShift(pos, maxY);
  //     } else {
  //       return 'unmatch';
  //     }
  //   } else {
  //     return 'match';
  //   }
  // }

  // movePos(pos, dropzone, direction) {
  //   let flag = false;
  //   if (pos.y <= (dropzone.y + dropzone.height + 20) && direction === 'bottom') {
  //     pos.y += 1;
  //     // pos.y = pos.y <= 20 ? 20 : pos.y;
  //     flag = true;
  //   } else if (pos.y >= (dropzone.y + dropzone.height + 20)) {
  //     direction = 'left';
  //     pos.x -= 1;
  //     // pos.x = pos.x <= 20 ? 20 : pos.x;
  //     flag = true;
  //   } else if ((pos.x + pos.width) >= (dropzone.x)) {
  //     direction = 'top';
  //     pos.y -= 1;
  //     // pos.y = pos.y <= 20 ? 20 : pos.y;
  //     flag = true;
  //   } else if ((dropzone.x) - (pos.x + pos.width) >= 0) {
  //     direction = "right";
  //     pos.x += 1;
  //     // pos.x = pos.x <= 20 ? 20 : pos.x;
  //     flag = true;
  //   }
  //   if (!flag) {
  //     console.log('break');
  //     return 'break';
  //   }
  // }

  // checkPos(pos, dropzone, direction) {
  //   let overlap = this.checkAllDocksOverlapping(pos);
  //   if (overlap) {
  //     let breakValue = this.movePos(pos, dropzone, direction);
  //     if (breakValue === 'break') {
  //       return pos;
  //     }
  //     this.checkPos(pos, dropzone, direction);
  //   } else {
  //     return pos;
  //   }
  // }

  // getAudioTranscriptPosition(position) {
  //   let dropZoneCords = this.dropZone.getBoundingClientRect();
  //   let svgCanvas = document.getElementById("svg-canvas");
  //   let modalAudioTranscript = { width: 400, height: 264 };
  //   let overlaps;
  //   // let newPos = { x: 0, y: 0 };

  //   //try4 -> top side.
  //   // overlaps = false;
  //   // position.width = modalAudioTranscript.width;
  //   // position.height = modalAudioTranscript.height;
  //   // position.x = dropZoneCords.x;
  //   // position.y = dropZoneCords.y - dropZoneCords.height - 20;

  //   // position.x = position.x < 20 ? 20 : position.x;
  //   // position.y = position.y < 20 ? 20 : position.y;
  //   // if (!this.checkAllDocksOverlapping(position)) {
  //   //   return position;
  //   // }


  //   //try 1 -> right side.
  //   position.x = dropZoneCords.x + dropZoneCords.width + 20;
  //   position.y = dropZoneCords.y;
  //   position.width = modalAudioTranscript.width;
  //   position.height = modalAudioTranscript.height;
  //   position.x = position.x < 20 ? 20 : position.x;
  //   position.y = position.y < 20 ? 20 : position.y;
  //   // let direction = 'bottom';

  //   this.checkPosInSingleY(position, 20, svgCanvas);
  //   if (!this.checkAllDocksOverlapping(position)) {
  //     return position;
  //   }

  //   //try2 -> left side.
  //   overlaps = false;
  //   position.width = modalAudioTranscript.width;
  //   position.height = modalAudioTranscript.height;
  //   position.x = dropZoneCords.x - position.width - 20;
  //   position.y = dropZoneCords.y;

  //   position.x = position.x < 20 ? 20 : position.x;
  //   position.y = position.y < 20 ? 20 : position.y;

  //   this.checkPosInSingleY(position, 20, svgCanvas);
  //   if (!this.checkAllDocksOverlapping(position)) {
  //     return position;
  //   }

  //   //try1 -> bottom to top.
  //   overlaps = false;
  //   position.width = modalAudioTranscript.width;
  //   position.height = modalAudioTranscript.height;
  //   position.x = dropZoneCords.x;
  //   position.y = dropZoneCords.y + dropZoneCords.height + 20;

  //   position.x = position.x < 20 ? 20 : position.x;
  //   position.y = position.y < 20 ? 20 : position.y;

  //   this.checkPosInSingleY(position, 20, svgCanvas);
  //   if (!this.checkAllDocksOverlapping(position)) {
  //     return position;
  //   }

  //   // this.checkPos(position, dropZoneCords, 'bottom');

  // }

  checkAllDocksOverlapping(pos) {
    let docks = this.state.dockData.docks;
    let overlap = false;
    for (let dock of docks) {
      if (this.checkIfOverlap(dock, pos)) {
        overlap = true;
        break;
      }
    }
    return overlap;
  }

  // checkPosInSingleY(pos, yCord, canvas) {
  //   let overlap = this.checkAllDocksOverlapping(pos);
  //   if (overlap && pos.y > yCord && pos.x > (canvas.offsetWidth - pos.width)) {
  //     pos.y -= 1;
  //     this.checkPosInSingleY(pos, yCord, canvas);
  //   } else {
  //     // let overlaps = this.checkAllDocksOverlapping(pos);
  //     return;
  //   }
  // }

  checkIfOverlap(obj1, obj2) {
    let labelWidth = (document.getElementsByClassName('label-header')[0] as HTMLElement).offsetWidth;
    let RectA = {
      left: obj1.position.x,
      top: obj1.position.y,
      right: obj1.position.x + obj1.width,
      bottom: obj1.position.y + obj1.height,
    };
    let RectB = {
      left: obj2.x,
      top: obj2.y,
      right: obj2.x + obj2.width,
      bottom: obj2.y + obj2.height,
    };

    return RectA.left < RectB.right && RectA.right > RectB.left && RectA.top < RectB.bottom && RectA.bottom > RectB.top;
  }

  setRoleApplication() {
    if (EZ.mode === EZ.MODE_TEST) {
      return 'application';
    }
    return null;
  }

  setRoleDescription() {
    if (EZ.mode === EZ.MODE_TEST) {
      return this.isPlayable ? 'pause button' : 'play button';
    }
    return null;
  }

}
