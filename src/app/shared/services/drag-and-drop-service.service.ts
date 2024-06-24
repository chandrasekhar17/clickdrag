import { Injectable } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AsyncSubject, BehaviorSubject, fromEvent, merge, Subject } from 'rxjs';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
import { MediaService } from 'src/app/services/media/media.service';
declare var $;

@Injectable({
  providedIn: 'root',
})
export class DragAndDropServiceService {
  dragStart: Subject<any>;
  dragEnd;
  dragOver;
  drop;

  mousedown;
  mouseup;
  mousemove;

  mouseDownSub;
  mouseUpSub;
  mouseMoveSub;
  removeDisbaleClass = new Subject<string>();
  mouseleave: any;
  mouseleaveSub: any;
  dragInProgress = false;
  xCordOnMouseDown: number;
  yCordOnMouseDown: number;
  xScrolling;
  yScrolling;
  labelClone;
  iframeDim;
  scrollingElement: any;

  constructor(public cdStateService: CdStateService, private undoRedoService: UndoRedoService, private a11yHelper: A11yHelperService, private announcer: LiveAnnouncer, private mediaService: MediaService) {
    this.initDragDrop();
    this.scrollingElement = this.getScrollingElement(window.parent.document.getElementById(EZ.id));
  }

  initDragDrop() {
    let undoObj;
    this.dragEnd = new BehaviorSubject<any>(false);
    this.removeDisbaleClass = new Subject<string>();
    this.dragStart = new Subject<any>();
    this.drop = new Subject<any>();
    this.dragOver = new BehaviorSubject<any>(false);
    const mouseDown = fromEvent<MouseEvent>(document, 'mousedown');
    const touchStart = fromEvent<TouchEvent>(document, 'touchstart', { passive: false });
    const mouseUp = fromEvent<MouseEvent>(document, 'mouseup');
    const touchEnd = fromEvent<TouchEvent>(document, 'touchend', { passive: false });
    const mouseMove = fromEvent<MouseEvent>(document, 'mousemove');
    const touchMove = fromEvent<TouchEvent>(document, 'touchmove', { passive: false });
    const mouseLeave = fromEvent<MouseEvent>(document, 'mouseleave');
    const touchCancel = fromEvent<TouchEvent>(document, 'touchcancel', { passive: false });
    this.mousedown = merge(mouseDown, touchStart);
    this.mouseup = merge(mouseUp, touchEnd);
    this.mousemove = merge(mouseMove, touchMove);
    this.mouseleave = merge(mouseLeave, touchCancel);
    this.mouseDownSub = this.mousedown.subscribe((evnt) => {
      undoObj = {
        actionName: 'drag-and-drop-label-grouping',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      if (EZ.mode === 'test') {
        undoObj = {
          actionName: 'drag-drop-test-mode',
          actionData: {
            old: this.cdStateService.getDataOfFields(['response']),
            new: {},
          },

        };

      }
      if (this.cdStateService.getState().activity.name === 'grouping' || EZ.mode === 'test') {
        const initialX = evnt.type === 'touchstart' ? (evnt.targetTouches[0] ? evnt.targetTouches[0].pageX : evnt.changedTouches[evnt.changedTouches.length - 1].pageX) : evnt.clientX;
        const initialY = evnt.type === 'touchstart' ? (evnt.targetTouches[0] ? evnt.targetTouches[0].pageY : evnt.changedTouches[evnt.changedTouches.length - 1].pageY) : evnt.clientY;
        this.xCordOnMouseDown = initialX;
        this.yCordOnMouseDown = initialY;
        const target = evnt.target;
        const result = this.isLabel(target);
        // let labelClone;
        if (result.islabel) {
          evnt.preventDefault();
          if (this.cdStateService.editorInFocus) {
            this.cdStateService.editorBlur.next(true);
          }
          evnt.stopPropagation();
          this.labelClone = result.label.cloneNode(true);
          this.labelClone.style.position = 'absolute';
          this.labelClone.style.zIndex = '2';
          this.labelClone.style.outline = 'solid 3px #003b4c';
          this.labelClone.style.border = '1px solid transparent';
          const labelCordinate = result.label.getBoundingClientRect();
          let initialLeft = labelCordinate.left;
          let initialTop = labelCordinate.top;
          this.labelClone.style.left = initialLeft + 'px';
          this.labelClone.style.top = initialTop + 'px';
          if (EZ.mode === 'test') {
            this.labelClone.classList.add('label-lifted');
            this.a11yHelper.updateA11yAttributes(this.labelClone);

          }
          if (this.cdStateService.getState().activity.options.labelInteraction !== 'one-label-one-dock') {
            this.labelClone.classList.remove('label-stack');
          }
          this.labelClone.classList.remove('draggable');
          document.body.appendChild(this.labelClone);
          let output = this.checkIsDropzone(initialX, initialY);
          if (EZ.mode === 'test' && evnt.sourceCapabilities !== null) {
            this.setAnnounceLabel(result);
          } else if (EZ.mode === 'test' && evnt.sourceCapabilities === null) {
            this.announcer.announce(this.a11yHelper.getAnnounceMsg('turnOffBrowseMode'), 'assertive');

          }
          this.dragStart.next({
            label: result.label,
            labelId: result.labelId,
            dropzoneId: output.dropzoneId,
            isDropzone: output.isDropzone,
          });
          this.mouseMoveSub = this.mousemove.subscribe((evt) => {
            evt.preventDefault();
            const client_x = evt.type === 'touchmove' ? (evt.targetTouches[0] ? evt.targetTouches[0].pageX : evt.changedTouches[evt.changedTouches.length - 1].pageX) : evt.clientX;
            const client_y = evt.type === 'touchmove' ? (evt.targetTouches[0] ? evt.targetTouches[0].pageY : evt.changedTouches[evt.changedTouches.length - 1].pageY) : evt.clientY;
            const updatedX = client_x - initialX;
            const updatedY = client_y - initialY;
            const updatedLeft = initialLeft + updatedX;
            const updatedTop = initialTop + updatedY;
            const browserZoomLevel = Math.round(window.devicePixelRatio * 100);
            let bottomHeight, leftWidth;
            if (browserZoomLevel < 80) {
              bottomHeight = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? (this.cdStateService.isFirefox ? window.parent.innerHeight - 40 : $(this.scrollingElement).innerHeight()) - 150 : this.scrollingElement.getClientRects()[0].bottom - 150;
              leftWidth = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? -50 : this.scrollingElement.getClientRects()[0].left;
            } else if (browserZoomLevel < 90) {
              bottomHeight = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? (this.cdStateService.isFirefox ? window.parent.innerHeight - 40 : $(this.scrollingElement).innerHeight()) - 100 : this.scrollingElement.getClientRects()[0].bottom - 100;
              leftWidth = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? -30 : this.scrollingElement.getClientRects()[0].left;
            } else {
              bottomHeight = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? (this.cdStateService.isFirefox ? window.parent.innerHeight - 40 : $(this.scrollingElement).innerHeight()) : this.scrollingElement.getClientRects()[0].bottom;
              leftWidth = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? 0 : this.scrollingElement.getClientRects()[0].left;
            }
            const topHeight = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? 30 : this.scrollingElement.getClientRects()[0].top;
            const rightWidth = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? $(this.scrollingElement).innerWidth() : this.scrollingElement.getClientRects()[0].right;
            const iframeDim = window.parent.document.getElementById(EZ.id).getBoundingClientRect();
            const screenX = evt.type === 'touchmove' ? evt.touches[0].screenX : evt.screenX;
            const screenY = evt.type === 'touchmove' ? evt.touches[0].screenY : evt.screenY;
            if (screenY > bottomHeight && iframeDim.bottom > bottomHeight) {
              // window.parent.scrollTo(window.parent.scrollX, window.parent.scrollY + 5);
              this.yScrolling = !this.yScrolling ? this.scrollPage('y', 10) : this.yScrolling;
            } else if (iframeDim.top < topHeight && screenY < 300) {
              // window.parent.scrollTo(window.parent.scrollX, window.parent.scrollY - 5);
              this.yScrolling = !this.yScrolling ? this.scrollPage('y', -10) : this.yScrolling;
            } else {
              clearInterval(this.yScrolling);
              this.yScrolling = null;
            }
            if (screenX > rightWidth - 100) {
              // window.parent.scrollTo(window.parent.scrollX + 5, window.parent.scrollY);
              this.xScrolling = !this.xScrolling ? this.scrollPage('x', 10) : this.xScrolling;
            } else if (screenX < leftWidth + 100) {
              // window.parent.scrollTo(window.parent.scrollX - 5, window.parent.scrollY);
              this.xScrolling = !this.xScrolling ? this.scrollPage('x', -10) : this.xScrolling;
            } else {
              clearInterval(this.xScrolling);
              this.xScrolling = null;
            }
            console.log(this.cdStateService.getState().canvas.width);
            this.labelClone.style.left = updatedLeft + 'px';
            this.labelClone.style.top = updatedTop + 'px';
            let output = this.checkIsDropzone(client_x, client_y);
            if (output.isDropzone) {
              this.dragOver.next(output.dropZone);
              const groupElems: any = document.querySelectorAll('.dropable');
              for (let i = 0; i < groupElems.length; i++) {
                if (groupElems[i].id === 'dropzone_' + output.dropzoneId) {
                  groupElems[i].style.outline = 'solid 3px #003b4c';
                  groupElems[i].style.border = '1px solid transparent';
                  if (EZ.mode === 'test') {
                    this.setAnnounceDropZoneMove(result, output)
                  }
                } else {
                  groupElems[i].style.outline = '';
                  groupElems[i].style.border = '';
                }
              }
            } else {
              const groupElems: any = document.querySelectorAll('.dropable');
              for (let i = 0; i < groupElems.length; i++) {
                groupElems[i].style.outline = '';
                groupElems[i].style.border = '';
              }
              // this.announcer.announce('Label cannot be dropped on the area.')
            }
          });
          this.mouseleaveSub = this.mouseleave.subscribe((evt) => {
            const client_x = evt.type === 'touchcancel' ? (evt.targetTouches[0] ? evt.targetTouches[0].pageX : evt.changedTouches[evt.changedTouches.length - 1].pageX) : evt.clientX;
            const client_y = evt.type === 'touchcancel' ? (evt.targetTouches[0] ? evt.targetTouches[0].pageY : evt.changedTouches[evt.changedTouches.length - 1].pageY) : evt.clientY;
            let output = this.checkIsDropzone(client_x, client_y);
            if (output.isDropzone) {
              this.drop.next({
                dropZone: output.dropZone,
                label: result.label,
                dropzoneId: output.dropzoneId,
                labelId: result.labelId,
                isDropped: output.isDropzone,
              });
            } else {
              const activityOptions = this.cdStateService.getState().activity.options;
              if (
                activityOptions.labelInteraction === 'one-label-one-dock' ||
                (activityOptions.labelInteraction === 'one-label-multiple-dock' &&
                  activityOptions.typeOfOccurrence === 'display-each-instance')
              ) {
                this.removeDisbaleClass.next(result.labelId);
              }
            }
            this.labelClone.remove();
            this.labelClone = null;
            if (this.mouseleaveSub) {
              this.mouseleaveSub.unsubscribe();
            }
            if (this.mouseMoveSub) {
              this.mouseMoveSub.unsubscribe();
            }
            if (this.mouseUpSub) {
              this.mouseUpSub.unsubscribe();
            }
            this.clearPageScrollIntervals();
          });
          this.mouseUpSub = this.mouseup.subscribe((evt) => {
            const client_x = evt.type === 'touchend' ? (evt.targetTouches[0] ? evt.targetTouches[0].pageX : evt.changedTouches[evt.changedTouches.length - 1].pageX) : evt.clientX;
            const client_y = evt.type === 'touchend' ? (evt.targetTouches[0] ? evt.targetTouches[0].pageY : evt.changedTouches[evt.changedTouches.length - 1].pageY) : evt.clientY;

            let output = this.checkIsDropzone(client_x, client_y);
            let isPosOfLabelChanged = true;
            if (this.xCordOnMouseDown === client_x && this.yCordOnMouseDown === client_y) {
              isPosOfLabelChanged = false;
            }
            if (output.isDropzone) {
              this.drop.next({
                dropZone: output.dropZone,
                label: result.label,
                dropzoneId: output.dropzoneId,
                labelId: result.labelId,
                isDropped: output.isDropzone,
                isPosOfLabelChanged: isPosOfLabelChanged,
              });
              undoObj.actionData.new = this.cdStateService.getDataOfFields();
              if (EZ.mode === 'test') {
                undoObj.actionData.new = this.cdStateService.getDataOfFields(['response']);
              }
              this.undoRedoService.updateUndoArray(undoObj);
              if (EZ.mode === 'test' && evt.sourceCapabilities !== null) {
                this.setAnnounceLabel(result, output);
              } else if (EZ.mode === 'test' && evnt.sourceCapabilities === null) {
                this.announcer.announce(this.a11yHelper.getAnnounceMsg('turnOffBrowseMode'), 'assertive');
              }
            } else {
              this.removeDisbaleClass.next(result.labelId);
              if (EZ.mode === 'test') {
                const state = this.cdStateService.getState();
                let isDockHasLabel = true;
                for (let doc of state.response.docks) {
                  if (!doc.linkedLabel.length) {
                    isDockHasLabel = true;
                  } else {
                    isDockHasLabel = false;
                    break;
                  }
                }

                if (isDockHasLabel) {
                  this.undoRedoService.resetState();
                  this.cdStateService.disablResetAll.next(true);
                }
              }

            }
            const groupElems: any = document.querySelectorAll('.dropable');
            for (let i = 0; i < groupElems.length; i++) {
              groupElems[i].style.outline = '';
              groupElems[i].style.border = '';
            }
            this.labelClone.remove();
            this.labelClone = null;
            if (!output.isDropzone && evt.sourceCapabilities !== null) {
              this.announcer.announce('Label moved to the label list.')
            } else if (EZ.mode === 'test' && evnt.sourceCapabilities === null) {
              this.announcer.announce(this.a11yHelper.getAnnounceMsg('turnOffBrowseMode'), 'assertive');
              setTimeout(() => {
                document.getElementById(evt.srcElement.getAttribute('id')).focus();
              })
            }

            // undoObj.actionData.new = this.cdStateService.getDataOfFields();
            // this.undoRedoService.updateUndoArray(undoObj);
            if (this.mouseMoveSub) {
              this.mouseMoveSub.unsubscribe();
            }
            if (this.mouseUpSub) {
              this.mouseUpSub.unsubscribe();
            }
            if (this.mouseleaveSub) {
              this.mouseleaveSub.unsubscribe();
            }
            this.clearPageScrollIntervals();
          });
        }
      }
    });
  }

  isLabel(ele) {
    let checkLabelObj = { label: undefined, islabel: false, labelId: '' };
    if (ele) {
      if (
        ele.classList.contains('draggable') &&
        !ele.classList.contains('distractor-border') &&
        !ele.classList.contains('disabled')
      ) {
        checkLabelObj.label = ele;
        checkLabelObj.islabel = true;
        checkLabelObj.labelId = ele.getAttribute('labelId');
      } else if (
        ele.closest('.draggable') &&
        !ele.closest('.draggable').classList.contains('disabled') &&
        !ele.closest('.draggable').classList.contains('distractor-border') &&
        !ele.classList.contains('disabled') &&
        !ele.classList.contains('ngx-shared') &&
        !ele.classList.contains('dpg-icon') &&
        !ele.closest('.label-clone') &&
        !ele.closest('.ahe-ui-link')
      ) {
        checkLabelObj.label = ele.closest('.draggable');
        checkLabelObj.islabel = true;
        checkLabelObj.labelId = ele.closest('.draggable').getAttribute('labelId');
      }
    }
    return checkLabelObj;
  }
  checkIsDropzone(x, y) {
    // check the mouse cordinate will present in doc
    let checkLabelObj = { dropZone: {}, isDropzone: false, dropzoneId: '' };
    let dropZoneEles = document.getElementsByClassName('dropable');
    for (let i = 0; i < dropZoneEles.length; i++) {
      const dropZoneEle = dropZoneEles[i].getBoundingClientRect();
      if (
        x > dropZoneEle.left &&
        x < dropZoneEle.left + dropZoneEle.width &&
        y > dropZoneEle.top &&
        y < dropZoneEle.top + dropZoneEle.height
      ) {
        checkLabelObj.dropZone = dropZoneEles[i];
        checkLabelObj.dropzoneId = dropZoneEles[i].getAttribute('dropzoneId');
        checkLabelObj.isDropzone = true;
        break;
      }
    }
    return checkLabelObj;
  }

  getScrollingElement(el) {
    if (el) {
      if (el.scrollHeight > el.offsetHeight && el.clientHeight > 0 && el.tagName !== 'form') {
        return el;
      } else if (el.body !== undefined) {
        return window.parent;
      } else {
        return this.getScrollingElement(el.parentNode);
      }
    }
  }

  scrollPage(direction, val) {
    return setInterval(() => {
      const parent = window.parent;
      const topWindow = window.top;
      const parentBody = window.parent.document.body;
      this.iframeDim = window.parent.document.getElementById(EZ.id).getBoundingClientRect();
      const scrollX = this.scrollingElement.scrollX !== undefined ? this.scrollingElement.scrollX : this.scrollingElement.scrollLeft;
      const scrollY = this.scrollingElement.scrollY !== undefined ? this.scrollingElement.scrollY : this.scrollingElement.scrollTop;
      const bottomHeight = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? $(this.scrollingElement).innerHeight() : this.scrollingElement.getClientRects()[0].bottom;
      const topHeight = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? 30 : this.scrollingElement.getClientRects()[0].top;
      const rightWidth = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? $(this.scrollingElement).innerWidth() : this.scrollingElement.getClientRects()[0].right;
      const leftWidth = (this.scrollingElement.tagName === 'BODY' || this.scrollingElement.tagName === undefined) ? 100 : this.scrollingElement.getClientRects()[0].left;
      if (direction === 'x') {
        if (
          /*parentBody.clientWidth + parent.scrollX >= parentBody.scrollWidth ||*/
          (val < 0 && this.iframeDim.left >= leftWidth - 100) ||
          (val > 0 && this.iframeDim.right <= rightWidth + 30)
        ) {
          clearInterval(this.xScrolling);
          this.xScrolling = null;
        } else {
          this.scrollingElement.scrollTo(scrollX + val, scrollY);
          let left = parseInt(this.labelClone.style.left.replace(/px/, ''));
          left = left + val;
          this.labelClone.style.left = left + 'px';
        }
      } else {
        if (
          /*parentBody.clientHeight + parent.scrollY >= parentBody.scrollHeight ||*/
          (val < 0 && this.iframeDim.top >= topHeight) ||
          (val > 0 && this.iframeDim.bottom <= bottomHeight)
        ) {
          clearInterval(this.yScrolling);
          this.yScrolling = null;
        } else {
          this.scrollingElement.scrollTo(scrollX, scrollY + val);
          let top = parseInt(this.labelClone.style.top.replace(/px/, ''));
          top = top + val;
          this.labelClone.style.top = top + 'px';
        }
      }
    }, 20);
  }

  clearPageScrollIntervals() {
    clearInterval(this.xScrolling);
    this.xScrolling = null;
    clearInterval(this.yScrolling);
    this.yScrolling = null;
  }

  setAnnounceLabel(label, dropzone?) {
    // console.log(label, isDropzone);
    const state = this.cdStateService.getState();
    const QResponseLabel = state.response.labels.find(l => l.id === parseInt(label.labelId));
    const QLabel = state.labelData.labels.find(l => l.id === QResponseLabel.orgId);
    if (QLabel) {
      if (QLabel.mediaType === "") {
        dropzone?.isDropzone ? this.setAnnounceForNormalLabelsDropped(QLabel, dropzone) : this.setAnnounceForNormalLabels(QLabel);
      } else {
        dropzone?.isDropzone ? this.setAnnounceForMediaLabelsDropped(QLabel, dropzone) : this.setAnnounceForMediaLabels(QLabel);
      }
    }
  }

  setAnnounceForMediaLabels(labels) {
    const state = this.cdStateService.getState();
    const isGroupActivity = state.activity.name === "grouping" ? true : false;
    const media = this.mediaService.getMediaDetails(labels.image.mediaId);
    const labelObj = {
      label: this.cdStateService.stripHtmlTags(labels.text),
      labelType: labels.mediaType,
      shortDescription: this.cdStateService.setImageAltText(media, labels.image, 'altText')
    }
    if (isGroupActivity) {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupMediaLabelLiftMouse', labelObj));
    } else {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('mediaLabelLiftMouse', labelObj));
    }
  }

  setAnnounceForMediaLabelsDropped(labels, dropzone) {
    const state = this.cdStateService.getState();
    const media = this.mediaService.getMediaDetails(labels.image.mediaId);
    const isGroupActivity = state.activity.name === "grouping" ? true : false;
    if (isGroupActivity) {

      const dropZoneData = state.dockData.docks.find((d) => d.id === parseInt(dropzone.dropzoneId));
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        labelType: labels.mediaType,
        groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dropZoneData.headerText)),
        shortDescription: this.cdStateService.setImageAltText(media, labels.image, 'altText')
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupMediaLabelDropped', labelObj));
    } else {
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        currentIndex: this.getDropZoneIndex(dropzone, state) + 1,
        totalDropZoneLength: state.dockData.docks.length,
        labelType: labels.mediaType,
        shortDescription: this.cdStateService.setImageAltText(media, labels.image, 'altText')
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('mediaLabelDropped', labelObj));
    }
  }

  setAnnounceForNormalLabels(labels) {
    const state = this.cdStateService.getState();
    const isGroupActivity = state.activity.name === "grouping" ? true : false;
    const labelObj = {
      label: this.cdStateService.stripHtmlTags(labels.text)
    }
    if (isGroupActivity) {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupNormalLabelLiftMouse', labelObj));
    } else {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('normalLabelLiftMouse', labelObj));
    }
  }

  setAnnounceForNormalLabelsDropped(labels, dropzone) {
    const state = this.cdStateService.getState();
    const isGroupActivity = state.activity.name === "grouping" ? true : false;
    if (isGroupActivity) {
      const dropZoneData = state.dockData.docks.find((d) => d.id === parseInt(dropzone.dropzoneId));
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dropZoneData.headerText))
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupNormalLabelDropped', labelObj));
    } else {
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        currentIndex: this.getDropZoneIndex(dropzone, state) + 1,
        totalDropZoneLength: state.dockData.docks.length
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('normalLabelDropped', labelObj));
    }
  }

  getDropZoneIndex(dropzone, state) {
    const index = state.response.docks.findIndex((d) => d.id === parseInt(dropzone.dropzoneId));
    return index;
  }

  setAnnounceDropZoneMove(dock, dropzone) {
    const state = this.cdStateService.getState();
    const isGroupActivity = state.activity.name === "grouping" ? true : false;
    if (isGroupActivity) {
      this.setAnnounceGroupDropZoneMove(dropzone)
    } else if (!isGroupActivity) {
      const label = state.labelData.labels.find(l => l.id == dropzone.dropzoneId);
      const dropZoneObj = {
        description: this.cdStateService.stripHtmlTags(label?.dropzoneDescription),
        currentIndex: this.getDropZoneIndex(dropzone, state) + 1,
        totalDropZoneLength: state.dockData.docks.length
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('dropZoneMoveMouse', dropZoneObj));
    }

  }

  setAnnounceGroupDropZoneMove(dropZone) {
    const state = this.cdStateService.getState();
    const dropZoneData = state.dockData.docks.find((d) => d.id === parseInt(dropZone.dropzoneId));
    const media = dropZoneData.isImageAdded ? this.mediaService.getMediaDetails(dropZoneData?.media?.mediaId) : '';
    const labelObj = {
      currentIndex: this.getDropZoneIndex(dropZone, state) + 1,
      totalDropZoneLength: state.dockData.docks.length,
      groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dropZoneData.headerText)),
      shortDescription: dropZoneData.isImageAdded ? this.cdStateService.setImageAltText(media, dropZoneData.media, 'altText') : ''
    }
    return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupDropZoneMoveMouse', labelObj));
  }

}
