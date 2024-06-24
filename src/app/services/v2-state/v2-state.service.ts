import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { APP_CONFIG } from 'src/app/shared/constants/appconfig';
import { CdStateService } from '../cd-state/cd-state.service';
import { MediaService } from '../media/media.service';

export enum V2Errors {
  INVALID_TYPE,
  MORE_BGIMG,
  NO_BGIMG,
  TEXT_IN_FRAME,
  LABEL_THRESHOLD,
  GROUP_MORE_IMG,
  GROUP_THRESHOLD,
  FIB_VALUE,
  AUDIO_CONVERSION
}

@Injectable({
  providedIn: 'root',
})
export class V2StateService {
  errorList = [];

  v2StatePassed = false;
  v3State;
  isConversionSuccessful = false;
  conversionErrors = false;
  errorParsingState = false;
  invalidState = false;
  invalidActivity = false;
  conversionErrorsOkay = false;
  errorsOkayed = new Subject();
  isGroupTextAddedByTypeTool = false;
  bgMask = { x1: 0, x2: 0, y1: 0, y2: 0 };

  constructor(private mediaService: MediaService, private cdStateService: CdStateService) { }

  isV2State(str) {
    let isV2 = false;
    if (str.match(/ET%3D/) || str.match(/ET=/) || str.match(/%22adminData%22%3A%/) || str.match(/"adminData":/)) {
      isV2 = true;
      this.v2StatePassed = true;
    }
    return isV2;
  }

  getV3State() {
    return JSON.stringify(this.v3State);
  }

  async convertStateV2toV3(str) {
    try {
      window['CD'] = { width: window.innerWidth, height: window.innerHeight };
      const v2State = this.getParsedV2State(str);
      // work on v2 state to get info and create v3 state.
      const v3State = await this.getInfoForV3(v2State);
      this.v3State = v3State;

      this.isConversionSuccessful = true;
    } catch (e) {
      if (e.message === 'INVALID_STATE') {
        this.invalidState = true;
      } else if (e.message === 'INVALID_TYPE') {
        this.invalidActivity = true;
      } else {
        this.errorParsingState = true;
      }
      this.isConversionSuccessful = false;
    }
    if (this.errorList.length > 0) {
      this.conversionErrors = true;
    }
    return this.isConversionSuccessful;
  }

  async getInfoForV3(v2State) {
    const activityType = v2State.adminData.ET;
    if (activityType === 'SLE') {
      return await this.getLabelingQuestionInfo(v2State);
    } else if (activityType === 'CLS') {
      return this.getGroupingQuestionInfo(v2State);
    } else {
      this.errorList.push(V2Errors.INVALID_TYPE);
      throw new Error('INVALID_TYPE');
    }
  }

  async getLabelingQuestionInfo(v2State) {
    const v3State = this.getEmptyV3State();
    v3State.activity.name = 'labeling';
    let isDisplayEachLabel = false;
    if (v2State.adminData.OTO === true) {
      v3State.activity.options.labelInteraction = 'one-label-one-dock';
    } else if (v2State.adminData.OTM === true) {
      v3State.activity.options.labelInteraction = 'one-label-multiple-dock';
    } else if (v2State.adminData.TYPE === true) {
      v3State.activity.options.labelInteraction = 'one-label-multiple-dock';
    } else {
      throw new Error('INVALID_STATE');
    }
    if (v2State.adminData.TYPE === true) {
      v3State.activity.options.typeOfOccurrence = 'display-each-instance';
      isDisplayEachLabel = true;
    } else if (v2State.adminData.TYPE === false) {
      v3State.activity.options.typeOfOccurrence = 'display-once';
    }

    // Setting canvas height and width
    const canvasWidth = parseInt(v2State.adminData.AW);
    const canvasHeight = parseInt(v2State.adminData.AH);
    v3State.canvas.width = canvasWidth;
    v3State.canvas.height = canvasHeight;

    // Find background image.
    const imgList = [];
    let biggestImgSize = 0;
    let biggestImg;
    let textFound = false;
    for (let i = 0; i < v2State.FrameData.length; i++) {
      for (let img in v2State.FrameData[i].frameImageList) {
        imgList.push({ name: img, value: v2State.FrameData[i].frameImageList[img], frame: v2State.FrameData[i] });
      }
      if (!textFound && v2State.FrameData[i].frameTextList.length > 0) {
        textFound = true;
      }
    }
    if (imgList.length > 1) {
      this.errorList.push(V2Errors.MORE_BGIMG);
    }
    if (textFound) {
      this.errorList.push(V2Errors.TEXT_IN_FRAME);
    }

    for (let i = 0; i < imgList.length; i++) {
      let imgDim;
      if (imgList[i].value.width === undefined || imgList[i].value.height === undefined) {
        imgDim = await this.getImageDimentions(imgList[i].value.src);
        const scaleFactor = imgList[i].value.imageScaleFactor ? Number(imgList[i].value.imageScaleFactor) : 1;
        imgDim.width = parseInt((imgDim.width * scaleFactor).toFixed());
        imgDim.height = parseInt((imgDim.height * scaleFactor).toFixed());
        imgList[i].value.width = imgDim.width;
        imgList[i].value.height = imgDim.height;
      }

      const imgSize = imgList[i].value.width * imgList[i].value.height;
      if (imgSize > biggestImgSize) {
        biggestImgSize = imgSize;
        biggestImg = imgList[i];
      }
    }
    if (biggestImg) {
      // only if image is found
      const mediaDetails = this.mediaService.getMediaDetails(biggestImg.value.src);
      const frame = v3State.frameData.frames[0];
      this.setBGImgWidthHeight(frame, biggestImg);
      frame.mediaAdded = true;
      frame.media.mediaId = mediaDetails.mediaId;
    } else if (imgList.length === 0) {
      // this.errorList.push(V2Errors.NO_BGIMG);
    }

    // get labels
    const createdLabelsByName = {};
    const createdLabelsByValue = {};
    let labelCount = 0;
    let dockCount = 0;
    let yPos = 20;
    const orgDockSize = v2State.DCKLD.split(',').map((n) => Number(n));

    for (let label in v2State.SLEData) {
      const labelData = v2State.SLEData[label];
      let linkedLabel;
      let v3Label;
      if (
        (!isDisplayEachLabel && createdLabelsByName[labelData.name] === undefined) ||
        (isDisplayEachLabel && createdLabelsByValue[labelData.label_value] === undefined)
      ) {
        v3Label = this.getV3Label();
        labelCount++;
        createdLabelsByName[labelData.name] = labelCount;
        createdLabelsByValue[labelData.label_value] = labelCount;
        linkedLabel = labelCount;
        v3Label.id = labelCount;
        v3Label.richText = labelData.label_value;
        v3Label.text = this.getNormalText(labelData.label_value);
        v3Label.feedback = labelData.feedback_value === '%n%' ? '' : labelData.feedback_value;
        v3Label.note = labelData.hint_value === '%n%' ? '' : labelData.hint_value;
        if (labelData.distractor_label === 'T') {
          v3Label.distractor = true;
        }
        if (labelData.FIB_value !== undefined && labelData.FIB_value !== 'N') {
          this.errorList.push(V2Errors.FIB_VALUE);
        }
        if (labelData.image_data !== '' && labelData.image_data !== 'N') {
          v3Label.mediaType = 'image';
          const image = this.mediaService.getMediaDetails(labelData.image_data);
          v3Label.image.mediaId = image.mediaId;
        } else if (labelData.media_value !== '' && labelData.media_value !== 'N') {
          this.errorList.push(V2Errors.AUDIO_CONVERSION);
          if (labelData.label_value === '') {
            labelCount--;
            continue;
          }
          // v3Label.mediaType = 'audio';
          // const audio = this.mediaService.getMediaDetails(labelData.media_value);
          // v3Label.audio.mediaId = audio.mediaId;
        }
        v3State.labelData.labels.push(v3Label);
      } else {
        if (isDisplayEachLabel) {
          linkedLabel = createdLabelsByValue[labelData.label_value];
        } else {
          linkedLabel = createdLabelsByName[labelData.name];
        }
        v3Label = v3State.labelData.labels.filter((l) => l.id === linkedLabel)[0];
      }

      if (labelData.distractor_label === 'F') {
        const v3Dock = this.getV3Dock();
        dockCount++;
        v3Dock.id = dockCount;
        v3Dock.position.x = Number(labelData.doc_x);
        v3Dock.position.y = Number(labelData.doc_y);
        // yPos = yPos + 80;
        v3Dock.linkedLabel.push(linkedLabel);
        v3Dock['hasError'] = false;
        v3Label.dockedTo.push(dockCount);
        this.getLeaderLineInfo(v3Dock, labelData, orgDockSize);
        v3State.dockData.docks.push(v3Dock);
      }
    }
    v3State.labelData.idCount = ++labelCount;
    v3State.dockData.idCount = ++dockCount;
    if (v3State.labelData.labels.length === 0) {
      const new_x_axis = this.cdStateService.current_x_axis;
      const new_y_axis = this.cdStateService.current_y_axis;
      this.cdStateService.iteratorLabel = 0;
      this.cdStateService.iteratorDock = 0;
      const label1 = this.cdStateService.getLabelData(new_x_axis, new_y_axis);
      const dock1 = this.cdStateService.createNewDoc(new_x_axis, new_y_axis, label1.id);
      const label2 = this.cdStateService.getLabelData(new_x_axis, new_y_axis);
      const dock2 = this.cdStateService.createNewDoc(
        new_x_axis,
        new_y_axis + APP_CONFIG.DROPZONE_CORDINATES.Y_AXIS - APP_CONFIG.NEW_DOCK_SEPARATION_GAP,
        label2.id
      );
      v3State.labelData.labels.push(label1);
      v3State.labelData.labels.push(label2);
      v3State.dockData.docks.push(dock1);
      v3State.dockData.docks.push(dock2);
    }
    if (v3State.labelData.labels.length > 20) {
      let docksToRemove = [];
      this.errorList.push(V2Errors.LABEL_THRESHOLD);
      const labels = v3State.labelData.labels;
      for (let i = 0; i < labels.length;) {
        const label = labels[i];
        if (label.distractor) {
          docksToRemove = docksToRemove.concat(label.dockedTo);
          labels.splice(i, 1);
        } else {
          i++;
        }
        if (labels.length <= 20) {
          break;
        }
      }
      if (labels.length > 20) {
        for (let i = labels.length - 1; i >= 0;) {
          const label = labels[i];
          docksToRemove = docksToRemove.concat(label.dockedTo);
          labels.splice(i, 1);
          i--;
          if (labels.length <= 20) {
            break;
          }
        }
      }
      if (docksToRemove.length > 0) {
        const docks = v3State.dockData.docks;
        for (let i = 0; i < docks.length;) {
          const dock = docks[i];
          if (docksToRemove.includes(dock.id)) {
            docks.splice(i, 1);
          } else {
            i++;
          }
        }
      }
    }

    this.pushDocksFromBGImage(v3State);
    this.spreadDocksForMinGap(v3State);

    //Horizontal and vertical guides
    if (Array.isArray(v2State.adminData.HGL)) {
      v3State.canvas.snapGuide = true;
      v2State.adminData.HGL.forEach((hg) => {
        if (typeof hg === 'number') {
          v3State.canvas.guide.hGuide.push(hg - 15);
        }
      });
    }
    if (Array.isArray(v2State.adminData.VGL)) {
      v3State.canvas.snapGuide = true;
      v2State.adminData.VGL.forEach((vg) => {
        if (typeof vg === 'number') {
          const vVal = vg - 15 - APP_CONFIG.LABEL_ELE_WIDTH;
          if (vVal > 0) {
            v3State.canvas.guide.vGuide.push(vg - 15);
          }
        }
      });
    }

    this.updateCanvasDimension(v3State);

    return v3State;
  }

  async getImageDimentions(imgId) {
    return new Promise((resolve, reject) => {
      const mediaDetails = this.mediaService.getMediaDetails(imgId);
      const imgEle = new Image();
      imgEle.onload = () => resolve({ width: imgEle.width, height: imgEle.height });
      imgEle.onerror = reject;
      imgEle.src = mediaDetails.path;
    });
  }

  setBGImgWidthHeight(frame, imgDetails) {
    const img = imgDetails.value;
    const imgFrame = imgDetails.frame;

    frame.media.width = img.width;
    frame.media.height = img.height;
    frame.width = img.width;
    frame.height = img.height;

    frame.position.x = Number(img.imageX) + Number(imgFrame.frameX);
    frame.position.y = Number(img.imageY) + Number(imgFrame.frameY);
  }

  getNormalText(richtext) {
    const div = document.createElement('div');
    div.innerHTML = richtext;
    return div.innerText;
  }

  pushDocksFromBGImage(v3State) {
    const imageLeft = v3State.frameData.frames[0].position.x;
    const imageTop = v3State.frameData.frames[0].position.y;
    const imageWidth = v3State.frameData.frames[0].width;
    const imageHeight = v3State.frameData.frames[0].height;

    let x1 = imageLeft + Number((imageWidth / 2).toFixed());
    let x2 = x1 + 1;
    let y1 = imageTop;
    let y2 = imageTop + imageHeight;
    this.bgMask = { x1, y1, x2, y2 };
    const imgDim = { x1: imageLeft, y1: imageTop, x2: imageLeft + imageWidth, y2: imageTop + imageHeight };
    this.pushDocksOnImageHorizontally(v3State, this.bgMask, imgDim);
    this.bgMask.x1 = imageLeft;
    this.bgMask.x2 = this.bgMask.x1 + imageWidth;
    this.bgMask.y1 = imageTop + Number((imageHeight / 2).toFixed());
    this.bgMask.y2 = this.bgMask.y1 + 1;
    this.pushDocksOnImageVerically(v3State, this.bgMask, imgDim);
  }

  pushDocksOnImageHorizontally(v3State, masks, imgDim) {
    const docks = v3State.dockData.docks;
    while (masks.x1 > imgDim.x1 - 20) {
      for (let i = 0; i < docks.length; i++) {
        const dock = docks[i];
        const dockY1 = dock.position.y;
        const dockY2 = dock.position.y + dock.height;
        if (
          masks.x1 === dock.position.x + dock.width &&
          ((dockY1 >= masks.y1 && dockY1 <= masks.y2) || (dockY2 >= masks.y1 && dockY2 <= masks.y2))
        ) {
          this.pushDockLeft(dock, docks);
        } else if (
          masks.x2 === dock.position.x &&
          ((dockY1 >= masks.y1 && dockY1 <= masks.y2) || (dockY2 >= masks.y1 && dockY2 <= masks.y2))
        ) {
          this.pushDockRight(dock, docks);
        }
      }
      masks.x1 = masks.x1 - 1;
      masks.x2 = masks.x2 + 1;
    }
  }

  pushDocksOnImageVerically(v3State, masks, imgDim) {
    const docks = v3State.dockData.docks;
    while (masks.y1 > imgDim.y1 - 20) {
      for (let i = 0; i < docks.length; i++) {
        const dock = docks[i];
        const dockX1 = dock.position.x;
        const dockX2 = dock.position.x + dock.width;
        const dockY1 = dock.position.y;
        const dockY2 = dock.position.y + dock.height;
        if (
          masks.y1 === dock.position.y + dock.height &&
          ((dockX1 >= masks.x1 && dockX1 <= masks.x2) || (dockX2 >= masks.x1 && dockX2 <= masks.x2))
        ) {
          this.pushDockTop(dock, docks, 1, false);
        } else if (
          masks.y2 === dock.position.y &&
          ((dockX1 >= masks.x1 && dockX1 <= masks.x2) || (dockX2 >= masks.x1 && dockX2 <= masks.x2))
        ) {
          this.pushDockBottom(dock, docks, 1, false);
        }
      }
      masks.y1 = masks.y1 - 1;
      masks.y2 = masks.y2 + 1;
    }
  }

  spreadDocksForMinGap(v3State) {
    const imageLeft = v3State.frameData.frames[0].position.x;
    const imageTop = v3State.frameData.frames[0].position.y;
    const imageWidth = v3State.frameData.frames[0].width;
    const imageHeight = v3State.frameData.frames[0].height;
    const imageMidPoint = imageTop + Number((imageHeight / 2).toFixed());
    let yPos = imageMidPoint;
    this.spreadDocksUp(v3State, yPos);
    yPos = imageMidPoint + 1;
    this.spreadDocksDown(v3State, yPos, imageTop + imageHeight);
  }

  spreadDocksUp(v3State, yPos) {
    let overlaps = true;
    const allDocks = v3State.dockData.docks;
    const docks = allDocks
      .filter((d) => d.position.y < yPos)
      .sort((a, b) => {
        return a.position.y > b.position.y ? -1 : a.position.y < b.position.y ? 1 : 0;
      });
    while (yPos > 0) {
      for (let i = 0; i < docks.length; i++) {
        const dock = docks[i];
        const overlapDocks = this.getOverLapDocks(dock, allDocks, true);
        if (overlapDocks.length > 0) {
          overlaps = true;
          this.pushOverLapedDocks(dock, overlapDocks, allDocks);
        } else {
          overlaps = false;
        }
      }
      yPos--;
    }
  }
  spreadDocksDown(v3State, yPos, imageBottom) {
    let overlaps = true;
    const allDocks = v3State.dockData.docks;
    const docks = allDocks
      .filter((d) => d.position.y > yPos)
      .sort((a, b) => {
        return a.position.y < b.position.y ? -1 : a.position.y > b.position.y ? 1 : 0;
      });
    let largestY = { y: imageBottom };
    while (yPos < largestY.y + 20) {
      for (let i = 0; i < docks.length; i++) {
        const dock = docks[i];
        if (dock.position.y + dock.height > largestY.y) {
          largestY.y = dock.position.y + dock.height;
        }
        const overlapDocks = this.getOverLapDocks(dock, allDocks, false);
        if (overlapDocks.length > 0) {
          overlaps = true;
          this.pushOverLapedDocks(dock, overlapDocks, allDocks, largestY);
        } else {
          overlaps = false;
        }
      }
      yPos++;
    }
  }

  pushOverLapedDocks(srcDock, overlapDocks, allDocks, largestY?) {
    for (let i = 0; i < overlapDocks.length; i++) {
      const dock = overlapDocks[i];
      if (srcDock.position.y > dock.position.y) {
        this.pushDockTop(dock, allDocks, 5, true);
      } else {
        this.pushDockBottom(dock, allDocks, 5, true);
      }
      if (largestY && dock.position.y + dock.height > largestY.y) {
        largestY.y = dock.position.y + dock.height;
      }
    }
  }

  getOverLapDocks(srcDock, allDocks, up) {
    const overlappedDocks = [];
    for (let i = 0; i < allDocks.length; i++) {
      const dock = allDocks[i];
      if (dock !== srcDock) {
        if (this.checkForOverLap(srcDock, dock, up)) {
          overlappedDocks.push(dock);
        }
      }
    }
    return overlappedDocks;
  }

  checkForOverLap(dock1, dock2, up) {
    let result = false;
    const dockRect = {
      x1: dock1.position.x - 20, // - (up ? 150 : 0),
      y1: dock1.position.y - 20, // - (up ? 60 : 0),
      x2: dock1.position.x + dock1.width + 20, // + (up ? 150 : 0),
      y2: dock1.position.y + dock1.height + 20, // + (up ? 60 : 0),
    };
    const point = { x: dock2.position.x, y: dock2.position.y };
    if (point.x > dockRect.x1 && point.x < dockRect.x2 && point.y > dockRect.y1 && point.y < dockRect.y2) {
      result = true;
    }
    return result;
  }

  pushDockLeft(srcDock, docks) {
    srcDock.position.x = srcDock.position.x - 1;
    if (srcDock.leaderLine !== undefined) {
      srcDock.leaderLine.position.x = srcDock.leaderLine.position.x - 1;
    }
    const srcX1 = srcDock.position.x;
    const srcX2 = srcDock.position.x + srcDock.width;
    const srcY1 = srcDock.position.y;
    const srcY2 = srcDock.position.y + srcDock.height;
    for (let i = 0; i < docks.length; i++) {
      const dock = docks[i];
      if (dock !== srcDock) {
        const dockX1 = dock.position.x;
        const dockX2 = dock.position.x + dock.width;
        const dockY1 = dock.position.y;
        const dockY2 = dock.position.y + dock.height;
        if (srcX1 > dockX2 && ((dockY2 <= srcY2 && dockY2 >= srcY1) || (dockY1 <= srcY2 && dockY1 >= srcY1))) {
          // dock is left to source dock.
          this.pushDockLeft(dock, docks);
        }
      }
    }
  }

  pushDockRight(srcDock, docks) {
    srcDock.position.x = srcDock.position.x + 1;
    if (srcDock.leaderLine !== undefined) {
      srcDock.leaderLine.position.x = srcDock.leaderLine.position.x + 1;
    }
    const srcX1 = srcDock.position.x;
    const srcX2 = srcDock.position.x + srcDock.width;
    const srcY1 = srcDock.position.y;
    const srcY2 = srcDock.position.y + srcDock.height;
    for (let i = 0; i < docks.length; i++) {
      const dock = docks[i];
      if (dock !== srcDock) {
        const dockX1 = dock.position.x;
        const dockX2 = dock.position.x + dock.width;
        const dockY1 = dock.position.y;
        const dockY2 = dock.position.y + dock.height;
        if (srcX2 < dockX1 && ((dockY2 <= srcY2 && dockY2 >= srcY1) || (dockY1 <= srcY2 && dockY1 >= srcY1))) {
          // dock is right to source dock.
          this.pushDockRight(dock, docks);
        }
      }
    }
  }

  pushDockTop(srcDock, docks, value, checkForOverlap) {
    srcDock.position.y = srcDock.position.y - value;
    if (srcDock.leaderLine !== undefined) {
      srcDock.leaderLine.position.y = srcDock.leaderLine.position.y - value;
    }
    const srcX1 = srcDock.position.x;
    const srcX2 = srcDock.position.x + srcDock.width;
    const srcY1 = srcDock.position.y;
    const srcY2 = srcDock.position.y + srcDock.height;
    for (let i = 0; i < docks.length; i++) {
      const dock = docks[i];
      if (dock !== srcDock) {
        if (checkForOverlap && this.checkForOverLap(srcDock, dock, 'up')) {
          const dockX1 = dock.position.x;
          const dockX2 = dock.position.x + dock.width;
          const dockY1 = dock.position.y;
          const dockY2 = dock.position.y + dock.height;
          if (srcY1 > dockY2 && ((dockX2 <= srcX2 && dockX2 >= srcX1) || (dockX1 <= srcX2 && dockX1 >= srcX1))) {
            // dock is top to source dock.
            this.pushDockTop(dock, docks, value, checkForOverlap);
          }
        }
      }
    }
  }

  pushDockBottom(srcDock, docks, value, checkForOverlap) {
    srcDock.position.y = srcDock.position.y + value;
    if (srcDock.leaderLine !== undefined) {
      srcDock.leaderLine.position.y = srcDock.leaderLine.position.y + value;
    }
    const srcX1 = srcDock.position.x;
    const srcX2 = srcDock.position.x + srcDock.width;
    const srcY1 = srcDock.position.y;
    const srcY2 = srcDock.position.y + srcDock.height;
    for (let i = 0; i < docks.length; i++) {
      const dock = docks[i];
      if (dock !== srcDock) {
        if (checkForOverlap && this.checkForOverLap(srcDock, dock, 'down')) {
          const dockX1 = dock.position.x;
          const dockX2 = dock.position.x + dock.width;
          const dockY1 = dock.position.y;
          const dockY2 = dock.position.y + dock.height;
          if (srcY2 < dockY1 && ((dockX2 <= srcX2 && dockX2 >= srcX1) || (dockX1 <= srcX2 && dockX1 >= srcX1))) {
            // dock is top to source dock.
            this.pushDockBottom(dock, docks, value, checkForOverlap);
          }
        }
      }
    }
  }

  getLeaderLineInfo(dock, label, orgDockSize) {
    if (label.connector_options.connectorPresent === 'T') {
      const directionMap = { T: 'top', B: 'bottom', L: 'left', R: 'right' };
      const direction = directionMap[label.connector_facing];
      const position = { x: 0, y: 0 };
      const orgPosition = { x: 0, y: 0 };
      switch (direction) {
        case 'top':
          position.x = dock.position.x + dock.width / 2;
          position.y = dock.position.y;
          orgPosition.x = dock.position.x + orgDockSize[0] / 2;
          orgPosition.y = dock.position.y;
          break;
        case 'bottom':
          position.x = dock.position.x + dock.width / 2;
          position.y = dock.position.y + dock.height;
          orgPosition.x = dock.position.x + orgDockSize[0] / 2;
          orgPosition.y = dock.position.y + orgDockSize[1];
          break;
        case 'left':
          position.x = dock.position.x;
          position.y = dock.position.y + dock.height / 2;
          orgPosition.x = dock.position.x;
          orgPosition.y = dock.position.y + orgDockSize[1] / 2;
          break;
        case 'right':
          position.x = dock.position.x + dock.width;
          position.y = dock.position.y + dock.height / 2;
          orgPosition.x = dock.position.x + orgDockSize[0];
          orgPosition.y = dock.position.y + orgDockSize[1] / 2;
          break;
      }
      dock.leaderLine = { branches: [], direction, position };
      const rootNodePos = {
        x: orgPosition.x + Number(label.connector_mx),
        y: orgPosition.y + Number(label.connector_my),
      };
      const rootNode = { branches: [], position: rootNodePos };
      dock.leaderLine.branches.push(rootNode);
      //Add root node branches.
      const branch1Pos = {
        x: orgPosition.x + Number(label.connector_lx),
        y: orgPosition.y + Number(label.connector_ly),
      };
      const branch1 = { branches: [], position: branch1Pos };
      rootNode.branches.push(branch1);
      const type = label.connector_options.connectorType.substr(0, 1);
      let pos = [];
      switch (type) {
        case '2':
        case '3':
        case '4':
        case '5':
          pos = label.connector_options.connectorType.split('%d%');
          pos.shift();
          for (let i = 0; i < pos.length; i = i + 2) {
            const nodePos = {
              x: orgPosition.x + Number(pos[i]),
              y: orgPosition.y + Number(pos[i + 1]),
            };
            rootNode.branches.push({ position: nodePos });
          }
          break;
        case 'B':
          pos = label.connector_options.connectorType.split('%d%');
          pos.shift();
          const node1 = {
            branches: [],
            position: {
              x: branch1Pos.x,
              y: branch1Pos.y - Number(pos[0]),
            },
          };
          node1.branches.push({
            position: {
              x: branch1Pos.x < position.x ? node1.position.x - 15 : node1.position.x + 15,
              y: node1.position.y,
            },
          });
          const node2 = {
            branches: [],
            position: {
              x: branch1Pos.x,
              y: branch1Pos.y + Number(pos[1]),
            },
          };
          node2.branches.push({
            position: {
              x: branch1Pos.x < position.x ? node2.position.x - 15 : node2.position.x + 15,
              y: node2.position.y,
            },
          });
          branch1.branches.push(node1);
          branch1.branches.push(node2);
          break;
        case 'H':
          pos = label.connector_options.connectorType.split('%d%');
          pos.shift();
          const nodeH1 = {
            branches: [],
            position: {
              x: branch1Pos.x - Number(pos[0]),
              y: branch1Pos.y,
            },
          };
          nodeH1.branches.push({
            position: {
              x: nodeH1.position.x,
              y: branch1Pos.y < position.y ? nodeH1.position.y - 15 : nodeH1.position.y + 15,
            },
          });
          const nodeH2 = {
            branches: [],
            position: {
              x: branch1Pos.x + Number(pos[1]),
              y: branch1Pos.y,
            },
          };
          nodeH2.branches.push({
            position: {
              x: nodeH2.position.x,
              y: branch1Pos.y < position.y ? nodeH2.position.y - 15 : nodeH2.position.y + 15,
            },
          });
          branch1.branches.push(nodeH1);
          branch1.branches.push(nodeH2);
          break;
      }
    }
  }

  updateCanvasDimension(v3State) {
    let largestX = v3State.frameData.frames[0].position.x + v3State.frameData.frames[0].width;
    let largestY = v3State.frameData.frames[0].position.y + v3State.frameData.frames[0].height;
    let smallestX = 20;
    let smallestY = 20;
    let xIncreasedBy = 0;
    let yIncreasedBy = 0;
    const docks = v3State.dockData.docks;
    if (smallestX > v3State.frameData.frames[0].position.x) {
      smallestX = v3State.frameData.frames[0].position.x;
    }
    if (smallestY > v3State.frameData.frames[0].position.y) {
      smallestY = v3State.frameData.frames[0].position.y;
    }
    for (let i = 0; i < docks.length; i++) {
      const dock = docks[i];
      if (largestX < dock.position.x + dock.width) {
        largestX = dock.position.x + dock.width;
      }
      if (largestY < dock.position.y + dock.height) {
        largestY = dock.position.y + dock.height;
      }
      if (smallestX > dock.position.x) {
        smallestX = dock.position.x;
      }
      if (smallestY > dock.position.y) {
        smallestY = dock.position.y;
      }
    }

    if (smallestX < 20) {
      // update all x position.
      xIncreasedBy = Math.abs(20 - smallestX);
      this.updatePositionBy('x', xIncreasedBy, v3State);
    }

    if (smallestY < 20) {
      // update all y position.
      yIncreasedBy = Math.abs(20 - smallestY);
      this.updatePositionBy('y', yIncreasedBy, v3State);
    }

    if (v3State.canvas.width < largestX + APP_CONFIG.LABEL_ELE_WIDTH + xIncreasedBy + 20) {
      v3State.canvas.width = largestX + APP_CONFIG.LABEL_ELE_WIDTH + xIncreasedBy + 20;
    }
    if (v3State.canvas.height < largestY + yIncreasedBy) {
      v3State.canvas.height = largestY + yIncreasedBy + 20;
    }
  }

  updatePositionBy(dir, val, v3State) {
    v3State.frameData.frames[0].position[dir] = v3State.frameData.frames[0].position[dir] + val;
    const docks = v3State.dockData.docks;
    const updateLeaderLineBranches = (nodes) => {
      for (let k = 0; k < nodes.length; k++) {
        const node = nodes[k];
        node.position[dir] = node.position[dir] + val;
        if (node.branches !== undefined && node.branches.length > 0) {
          updateLeaderLineBranches(node.branches);
        }
      }
    };
    for (let i = 0; i < docks.length; i++) {
      const dock = docks[i];
      dock.position[dir] = dock.position[dir] + val;
      if (dock.leaderLine !== undefined) {
        dock.leaderLine.position[dir] = dock.leaderLine.position[dir] + val;
        if (dock.leaderLine.branches !== undefined && dock.leaderLine.branches.length > 0) {
          updateLeaderLineBranches(dock.leaderLine.branches);
        }
      }
    }
  }

  getGroupingQuestionInfo(v2State) {
    const v3State = this.getEmptyV3State();
    // populate appropriate v3State properties as we find info in v2State.
    // populating activity information.
    v3State.activity.name = 'grouping';
    let isDisplayEachLabel = false;
    const canvasWidth = parseInt(v2State.adminData.AW);
    const canvasHeight = parseInt(v2State.adminData.AH);
    v3State.canvas.width = canvasWidth;
    v3State.canvas.height = canvasHeight;
    if (v2State.adminData.OTO === true) {
      v3State.activity.options.labelInteraction = 'one-label-one-dock';
    } else if (v2State.adminData.OTM === true) {
      v3State.activity.options.labelInteraction = 'one-label-multiple-dock';
    } else if (v2State.adminData.TYPE === true) {
      v3State.activity.options.labelInteraction = 'one-label-multiple-dock';
    } else {
      throw new Error('INVALID_STATE');
    }
    if (v2State.adminData.TYPE === true) {
      v3State.activity.options.typeOfOccurrence = 'display-each-instance';
      isDisplayEachLabel = true;
    } else if (v2State.adminData.TYPE === false) {
      v3State.activity.options.typeOfOccurrence = 'display-once';
    }
    // populate other informations.
    v3State.labelData.labels = this.setV3Label(v2State, isDisplayEachLabel);
    v3State.labelData.idCount = v3State.labelData.labels.length + 1;
    v3State.dockData.docks = this.setV3Docks(v2State, v3State);
    if (v3State.dockData.docks) v3State.dockData.idCount = v3State.dockData.docks.length + 1;
    return v3State;
  }

  getParsedV2State(inputStr) {
    let parsedState;
    const strType = this.getStringType(inputStr);

    switch (strType) {
      case 1: //old encoded
        /*
         * The following line is commented to send encoded string
         * because on olddata_validator it is checked that if the
         * string is encoded then the status is true.
         */
        //inputStr =  unescape(inputStr);
        parsedState = inputStr.validate_olddata(); // For old data string;
        break;
      case 2: //old not encoded
        parsedState = inputStr.validate_olddata();
        break;
      case 3: //new encoded
        inputStr = unescape(inputStr);
        parsedState = inputStr.validate_newAuth(); // For new data string;
        break;
      case 4: //new not encoded
        parsedState = inputStr.validate_newAuth(); // For new data string;
        break;
    }

    return parsedState;
  }
  getStringType(str) {
    if (str.match(/ET%3D/)) {
      return 1; //old encoded
    } else if (str.match(/ET=/)) {
      return 2; //old not encoded
    } else if (str.match(/%22adminData%22%3A%/)) {
      return 3; //new encoded
    } else if (str.match(/"adminData":/)) {
      return 4; //new not encoded
    }
  }

  getEmptyV3State() {
    const activity = {
      name: null,
      options: {
        labelInteraction: null,
        typeOfOccurrence: null,
      },
    };
    const canvas = {
      width: 800,
      height: 600,
      showGrid: false,
      hideGuide: false,
      lockGuide: false,
      snapGuide: false,
      guide: {
        vGuide: [],
        hGuide: [],
      },
    };
    const frameData = {
      frames: [
        {
          id: 1,
          type: 'image',
          width: 364,
          height: 560,
          mediaAdded: false,
          position: { x: 20, y: 20 }, // this will be relative to canvas top left corner.
          media: {
            mediaId: '',
            altText: '',
            description: '',
            position: { x: 0, y: 0 }, // this will be relative to the frame top left corner.
            width: 0,
            height: 0,
          },
        },
      ],
    };
    const labelData = {
      labels: [],
      width: 150,
      height: 60,
      totalLabels: 2,
      idCount: 1,
    };
    const dockData = {
      sizeSameAsLabels: null,
      docks: [],
      idCount: 1,
      biggestLabelHeight: 60,
    };
    const notesSettings = {
      width: null,
      height: null,
      displayOnHover: null,
    };
    const feedbackSettings = {
      width: null,
      height: null,
      displayOnHover: null,
    };
    const magnifySettings = {
      enabled: true,
      width: 200,
      height: 200,
      scale: 2,
    };
    const texts = [];

    return {
      activity,
      canvas,
      frameData,
      labelData,
      dockData,
      notesSettings,
      feedbackSettings,
      magnifySettings,
      texts,
    };
  }

  getV3Label() {
    return {
      id: 11111, // need to update where this object is used.
      text: '',
      richText: '',
      note: '',
      feedback: '',
      dropzoneDescription: '',
      mediaType: '',
      image: {
        mediaId: '',
        altText: '',
        description: '',
        position: { x: 0, y: 0 }, // this will be relative to the label top left corner.
        width: 120,
        height: 120,
      },
      audio: {
        mediaId: '',
        altText: '',
        description: '',
        position: { x: 0, y: 0 }, // this will be relative to the label top left corner.
        width: 50,
        height: 20,
      },
      distractor: false,
      position: { x: 0, y: 0 }, // this will be relative to canvas top left corner.
      dockedTo: [],
      height: 60,
      width: 150,
    };
  }

  getV3Dock() {
    return {
      id: 22222, // need to update where this object is used.
      linkedLabel: [], // this can be array depenging on the activity type.
      position: { x: APP_CONFIG.DROPZONE_CORDINATES.INITIAL_X_AXIS, y: 0 }, // this will be relative to canvas top left corner.
      width: 150,
      height: 60, // docks items will have width and height property for each item, because it depends on activity type.
      media: {
        mediaId: '',
        altText: '',
        description: '',
        position: { x: 0, y: 0 }, // this will be relative to the frame top left corner.
        width: 0,
        height: 0,
      },
      headerText: '', // will be present only for grouping type activity.
      image: {
        width: 180,
        height: 220,
      },
      isImageAdded: false,
    };
  }

  setV3Label(v2state, isDisplayEachLabel) {
    const createdLabelsByName = {};
    const createdLabelsByValue = {};
    let labels = [];
    let id = 0;
    let v3label;
    for (let label in v2state.CLSData) {
      const labelData = v2state.CLSData[label];
      let linkedLabel;
      if (
        (!isDisplayEachLabel && createdLabelsByName[labelData.name] === undefined) ||
        (isDisplayEachLabel && createdLabelsByValue[labelData.label_value] === undefined)
      ) {
        v3label = this.getV3Label();
        if (labelData.FIB_value !== undefined && labelData.FIB_value !== 'N') {
          this.errorList.push(V2Errors.FIB_VALUE);
        }
        id++;
        if (labelData.name) createdLabelsByName[labelData.name] = id;
        createdLabelsByValue[labelData.label_value] = id;
        linkedLabel = id;
        v3label.id = id;
        v3label.text = this.getNormalText(labelData.label_value);
        v3label.richText = labelData.label_value;
        v3label.feedback = labelData.feedback_value === '%n%' ? '' : labelData.feedback_value;
        v3label.note = labelData.hint_value === '%n%' ? '' : labelData.hint_value;
        v3label.distractor = labelData.distractor === 'T' ? true : false;
        v3label.dockedTo = this.updateDockedTo(v2state, labelData.class_set);
        if (labelData.image_data !== '' && labelData.image_data !== 'N') {
          v3label.mediaType = 'image';
          const mediaDetails = this.mediaService.getMediaDetails(labelData.image_data);
          v3label.image.mediaId = mediaDetails.mediaId;
        } else if (labelData.media_value !== '' && labelData.media_value !== 'N') {
          this.errorList.push(V2Errors.AUDIO_CONVERSION);
          if (labelData.label_value === '') {
            continue;
          }
          // const mediaDetails = this.mediaService.getMediaDetails(labelData.media_value);
          // v3label.mediaType = 'audio';
          // v3label.audio.mediaId = mediaDetails.mediaId;
        }

        labels.push(v3label);
      } else {
        if (isDisplayEachLabel) {
          linkedLabel = createdLabelsByValue[labelData.label_value];
        } else {
          linkedLabel = createdLabelsByName[labelData.name];
        }
        v3label = labels.filter((l) => l.id === linkedLabel)[0];
      }
    }

    if (labels.length === 0) {
      const new_x_axis = this.cdStateService.current_x_axis;
      const new_y_axis = this.cdStateService.current_y_axis;
      this.cdStateService.iteratorLabel = 0;
      this.cdStateService.iteratorDock = 0;
      const label1 = this.cdStateService.getLabelData(new_x_axis, new_y_axis);
      const label2 = this.cdStateService.getLabelData(new_x_axis, new_y_axis);
      label1.dockedTo = [];
      label2.dockedTo = [];
      labels.push(label1);
      labels.push(label2);
    }

    if (labels.length > 20) {
      this.errorList.push(V2Errors.LABEL_THRESHOLD);
      for (let i = 0; i < labels.length;) {
        const label = labels[i];
        if (label.distractor) {
          labels.splice(i, 1);
        } else {
          i++;
        }
        if (labels.length <= 20) {
          break;
        }
      }
      if (labels.length > 20) {
        for (let i = labels.length - 1; i >= 0;) {
          labels.splice(i, 1);
          i--;
          if (labels.length <= 20) {
            break;
          }
        }
      }
    }

    return labels;
  }

  updateDockedTo(v2State, labelDocked) {
    let dockedTo = [];
    const classSet = labelDocked.split('|');
    const docks = v2State.CLSCData;
    for (const key of Object.keys(docks)) {
      const classSetLen = classSet.length;
      for (let i = 0; i < classSetLen; i++) {
        if (classSet[i] === docks[key].name) {
          dockedTo.push(docks[key].dockGroupNo);
        }
      }
    }
    return dockedTo;
  }

  setV3Docks(v2State, v3State) {
    let docks = [];
    const v2Media = this.getV2GroupMedia(v2State);
    const dockLength = Object.keys(v2State.CLSCData).length;
    const arrangeDock = this.arrangeDock(v2State.CLSCData);
    let id = 0;
    arrangeDock.forEach((dock, index) => {
      const v3dock = this.getV3Dock();
      const dockData = dock;
      id++;
      v3dock.id = id;
      v3dock.headerText = this.getDockText(v2State, dockData);
      v3dock.linkedLabel = this.getLinkedLabel(v3dock.id, v3State);
      if (v2Media.length === dockLength) {
        const media = this.mediaFrame(v2Media, dock);
        if (media.length) {
          const mediaDetails = this.mediaService.getMediaDetails(media[0].imageSrc);
          v3dock.media.mediaId = mediaDetails.mediaId;
          v3dock.isImageAdded = true;
        }

      }
      docks.push(v3dock);
    });
    if (v2Media.length) {
      if (v2Media.length !== dockLength) {
        this.errorList.push(V2Errors.GROUP_MORE_IMG);
      }
    }
    if (this.isGroupTextAddedByTypeTool) {
      this.errorList.push(V2Errors.TEXT_IN_FRAME);
    }
    if (docks.length > 6) {
      this.errorList.push(V2Errors.GROUP_THRESHOLD);
      const removedDocks = docks.slice(0, 6);
      docks = removedDocks;
    }

    return docks;
  }

  arrangeDock(CLSCData) {
    const dockData = [];
    for (let dock in CLSCData) {
      dockData.push(CLSCData[dock]);
    }
    return dockData;
  }

  getV2GroupMedia(v2State) {
    const media = [];
    v2State.FrameData.filter(
      (frameData) => frameData.frameImageList && Object.keys(frameData.frameImageList).length !== 0
    ).forEach((item) => {
      for (const key of Object.keys(item.frameImageList)) {
        const frameObj = {
          frameHeight: item.frameHeight,
          frameWidth: item.frameWidth,
          frameX: item.frameX,
          frameY: item.frameY,
          imageHeight: item.frameImageList[key].height,
          imageWidth: item.frameImageList[key].width,
          imageX: item.frameImageList[key].imageX,
          imageY: item.frameImageList[key].imageY,
          imageSrc: item.frameImageList[key].src
        }
        media.push(frameObj);
      }
    });
    return media;
  }

  getDockPosition(dock) {
    return {
      x1: parseInt(dock.xpos),
      y1: parseInt(dock.ypos),
      x2: parseInt(dock.xpos) + parseInt(dock.width),
      y2: parseInt(dock.ypos) + parseInt(dock.height),
    };
  }

  getImagePosition(frame) {
    return {
      x1: parseInt(frame.frameX) + parseInt(frame.imageX),
      y1: parseInt(frame.frameY) + parseInt(frame.imageY),
      x2: parseInt(frame.frameX) + parseInt(frame.imageX) + parseInt(frame.imageWidth),
      y2: parseInt(frame.frameY) + parseInt(frame.imageY) + parseInt(frame.imageHeight),
    };
  }

  mediaFrame(frameData, dockData) {
    const dockPos = this.getDockPosition(dockData);
    let frame = [];
    frameData.forEach((item) => {
      const framePos = this.getImagePosition(item);
      const temp = framePos.x1 < dockPos.x1 ? [framePos, dockPos] : [dockPos, framePos];
      if (this.checkForOverLapImage(temp[0], temp[1])) {
        frame.push(item);
      }
    })
    return frame;
  }

  checkForOverLapImage(dock1, dock2) {
    let result = false;
    if (dock2.x1 >= dock1.x1 && dock2.x1 <= dock1.x2) {
      result = true;
    }
    return result;
  }


  getDockText(state, dockData) {
    console.log('Group Heading', state);
    let str = '';
    const isNameAvailable = dockData.name.includes('group') ? false : true;
    const isGroupHeadingIDAvailable = dockData.dockHeadingId !== '' ? true : false;

    let frameText = [];
    let frame: any = [];
    state.FrameData.filter((frameData) => {
      if (frameData.frameTextList.length) {
        frame.push(frameData);
        frameText.push(...frameData.frameTextList);
      }
    });

    if (isNameAvailable) {
      if (frameText.length) {
        frameText.forEach((item) => {
          const dockName = this.getNormalText(dockData.name).toLowerCase().replace(/ /g, '').trim();
          const textName = this.getNormalText(item.textValue).toLowerCase().replace(/ /g, '').trim();
          if (dockName === textName) {
            str = this.getNormalText(item.textValue);
          } else {
            const textId = item.textGroupObjID.split('_');
            const dockPos = this.getGroupDockPos(dockData, item);
            const temp = frame.find((frame) => {
              const frameId = frame.frameGroupID.split('_');
              return frameId[1] === textId[2];
            });
            const textPos = this.getGroupDockLabelPos(temp, item);

            if (dockPos.x2 > textPos.x2) {
              if (this.checkForOverLapForGroup(dockPos, textPos)) {
                str = this.getNormalText(item.textValue);
              }
            } else {
              if (this.checkForOverLapForGroup(textPos, dockPos)) {
                str = this.getNormalText(item.textValue);
              }
            }
          }
        });
      } else {
        str = frameText.length === 0 ? '' : dockData.name;
      }
    } else if (isGroupHeadingIDAvailable) {
      if (frameText.length) {
        frameText.forEach((item) => {
          if (item.textGroupObjID === dockData.dockHeadingId) {
            if (!item.textValue.includes('Add Name')) str = this.getNormalText(item.textValue);
          }
        });
      }
    } else {
      frameText.forEach((item) => {
        const textId = item.textGroupObjID.split('_');
        const dockPos = this.getGroupDockPos(dockData, item);
        const temp = frame.find((frame) => {
          const frameId = frame.frameGroupID.split('_');
          return frameId[1] === textId[2];
        });
        const textPos = this.getGroupDockLabelPos(temp, item);

        // const dockPos = this.getGroupDockPos(dockData, item);
        // const textPos = this.getGroupDockLabelPos(frame, item);
        if (this.checkForOverLapForGroup(dockPos, textPos)) {
          str = this.getNormalText(item.textValue);
        }
      });
    }

    if (str === '' && !this.isGroupTextAddedByTypeTool) {
      this.isGroupTextAddedByTypeTool = true;
    }

    return str;
  }

  getGroupDockPos(dock, textFrame) {
    return {
      x1: parseInt(dock.xpos),
      y1: parseInt(dock.ypos) - (parseInt(dock.ypos) - parseInt(textFrame.textY)),
      x2: parseInt(dock.xpos) + parseInt(dock.width),
      y2: parseInt(dock.ypos) + parseInt(dock.height),
    };
  }

  getGroupDockLabelPos(frame, textFrame) {
    return {
      x1: parseInt(frame.frameX) + parseInt(textFrame.textX),
      y1: parseInt(frame.frameY) + parseInt(textFrame.textY),
      x2: parseInt(frame.frameX) + parseInt(textFrame.textX) + parseInt(textFrame.maxWidth),
      y2:
        textFrame.minHeight === null || textFrame.minHeight === undefined
          ? parseInt(frame.frameY) + parseInt(textFrame.textY) + 0
          : parseInt(frame.frameY) + parseInt(textFrame.textY) + parseInt(textFrame.minHeight),
    };
  }

  checkForOverLapForGroup(dock1, dock2) {
    let result = false;
    if (dock2.x1 >= dock1.x1 && dock2.x1 <= dock1.x2 && dock2.y1 >= dock1.y1 && dock2.y1 <= dock1.y2) {
      result = true;
    }
    return result;
  }

  getLinkedLabel(id, v3State) {
    let linkedLabel = [];
    v3State.labelData.labels.forEach((label) => {
      if (label.dockedTo.includes(id)) {
        linkedLabel.push(label.id);
      }
    });
    return linkedLabel;
  }
}
