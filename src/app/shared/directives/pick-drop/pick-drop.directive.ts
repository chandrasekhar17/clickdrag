import { Directive, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DragAndDropServiceService } from '../../services/drag-and-drop-service.service';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MagnifyPreviewService } from 'src/app/services/magnify-preview/magnify-preview.service';
import { ENTER, SPACE, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, ESCAPE, TAB } from '@angular/cdk/keycodes';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { MediaService } from 'src/app/services/media/media.service';
import { fromEvent, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';


@Directive({
  selector: '[appPickDrop]'
})
export class PickDropDirective {

  initialX: number = 0;
  initialY: number = 0;
  currentIndex: number | null;
  prevIndex: number | null;
  nextIndex: number | null;
  state: any;
  dockHeight: number = 0;
  pickedLabelCordinate: any;
  isPickedFromLabelSection: boolean;
  pickedDropZoneIndex: number = 0;
  undoObj;
  VisibilityPage;
  VisibilityPage$;
  labelCloneState;
  resultLabelState;
  isLabelPicked: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private dragAndDropService: DragAndDropServiceService, private cdStateService: CdStateService,
    private magnifyPreviewService: MagnifyPreviewService, private announcer: LiveAnnouncer,
    private a11yHelper: A11yHelperService, private undoRedoService: UndoRedoService, private mediaService: MediaService, @Inject(DOCUMENT) private doc: Document) {
    this.state = this.cdStateService.getState();
    this.VisibilityPage = fromEvent<KeyboardEvent>(this.doc, 'visibilitychange').pipe(map(() => ({ visible: this.doc.visibilityState })));
    this.VisibilityPage$ = this.VisibilityPage.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state.visible === 'visible' && this.isLabelPicked) {
        this.isLabelPicked = false;
        this.escapeKeyForSelectedItem(this.labelCloneState, this.resultLabelState);
      }
    });
    // this.currentIndex = null;
    // this.nextIndex = 0;
    // this.prevIndex = this.state.response.docks.length - 1;
  }

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    this.keyDown(event);
  }

  @HostListener('document:click', ['$event']) onClick(event: MouseEvent) {
    if (this.isLabelPicked) {
      this.isLabelPicked = false;
      this.escapeKeyForSelectedItem(this.labelCloneState, this.resultLabelState);
    }
  }

  keyDown(event) {
    const target = event.target;
    const resultLabel = this.dragAndDropService.isLabel(target);
    if (resultLabel.islabel) {
      if (event.keyCode === ENTER || event.keyCode === SPACE) {
        if (EZ.mode === 'test') {
          this.undoObj = {
            actionName: 'pick-drop-test-mode',
            actionData: {
              old: this.cdStateService.getDataOfFields(['response']),
              new: {},
            },
          };

        }

        this.createCloneForSelectedLabel(resultLabel, event);
        this.isLabelPicked = true;
      } else if (event.keyCode === TAB) {
        if (this.state.activity.name !== 'grouping') {
          this.magnifyPreviewService.hide();
        }
      }
    }
  }


  createCloneForSelectedLabel(resultLabel, event) {
    const cloneLabel = document.getElementsByClassName('label-clone');
    if (cloneLabel?.length < 1) {
      let labelClone;
      if (resultLabel.islabel) {
        labelClone = event.target.cloneNode(true);
        const labelCordinate = resultLabel.label.getBoundingClientRect();
        this.pickedLabelCordinate = { initialX: labelCordinate.left, initialY: labelCordinate.top };
        let initialLeft = labelCordinate.left;
        let initialTop = labelCordinate.top;
        labelClone.style.left = initialLeft + 'px';
        labelClone.style.top = initialTop + 'px';
        labelClone.style.position = 'absolute';
        labelClone.style.zIndex = '2';
        labelClone.classList.add('label-clone');
        labelClone.style.outline = 'solid 3px #003b4c';
        labelClone.style.border = '1px solid transparent';
        labelClone.classList.add('label-lifted');

        this.a11yHelper.updateA11yAttributes(labelClone)


        if (this.state.activity.options.labelInteraction === 'one-label-multiple-dock' && this.state.activity.options.typeOfOccurrence === 'display-once') {
          labelClone.classList.remove('label-stack');
        }
        labelClone.classList.remove('draggable');
        labelClone.classList.remove('media');
        this.labelCloneState = labelClone;
        this.resultLabelState = resultLabel;
        labelClone.addEventListener('keydown', (e) => this.keyDownEventForCloneNode(e, labelClone, resultLabel));
        document.body.appendChild(labelClone);
        this.setAnnounceLabel(resultLabel);
        labelClone.focus();
        let resultDropzone = this.dragAndDropService.checkIsDropzone(initialLeft + 3, initialTop + 3);
        this.dragAndDropService.dragStart.next({ label: resultLabel.label, labelId: resultLabel.labelId, dropzoneId: resultDropzone.dropzoneId, isDropzone: resultDropzone.isDropzone });
        if (resultDropzone.isDropzone) {
          this.isPickedFromLabelSection = false;
          const dock = this.state.response.docks.find((d) => d.id === parseInt(resultDropzone.dropzoneId));
          this.currentIndex = this.state.response.docks.indexOf(dock);
          this.prevIndex = this.currentIndex === 0 ? null : this.currentIndex - 1;
          this.nextIndex = this.currentIndex === (this.state.response.docks.length - 1) ? null : this.currentIndex + 1;
          if (this.state.activity.name === 'grouping') {
            this.addDrozoneBorder(this.currentIndex + 1);
          }
        } else {
          this.isPickedFromLabelSection = true;
          this.currentIndex = null;
          this.nextIndex = 0;
          this.prevIndex = this.state.response.docks.length - 1;
        }
      }
    }

  }


  keyDownEventForCloneNode(e, labelClone, resultLabel) {
    let pIndex = this.prevIndex;
    let cIndex = this.currentIndex;
    let nIndex = this.nextIndex;
    switch (e.keyCode) {
      case RIGHT_ARROW:
      case DOWN_ARROW:
        e.preventDefault();
        e.stopPropagation();
        this.rightAndDownKeyForSelectedItem(nIndex, labelClone, resultLabel);
        break;
      case LEFT_ARROW:
      case UP_ARROW:
        e.preventDefault();
        e.stopPropagation();
        this.leftAndUpKeyForSelectedItem(pIndex, cIndex, nIndex, labelClone, resultLabel);
        break;
      case SPACE:
      case ENTER:
        e.preventDefault();
        e.stopPropagation();
        this.spaceAndEnterKeyForSelectedItem(labelClone, resultLabel);
        break;
      case ESCAPE:
        e.preventDefault();
        e.stopPropagation();
        this.escapeKeyForSelectedItem(labelClone, resultLabel);
        break;
      case TAB:
        e.preventDefault();
        e.stopPropagation();
        break;
      default:
        break;
    }
  }

  rightAndDownKeyForSelectedItem(nIndex, labelClone, resultLabel) {
    if (nIndex === null) {
      this.goToLabel(resultLabel.labelId, labelClone);
    } else {
      this.goToDropZone(labelClone, nIndex);
    }
    this.prevIndex = this.currentIndex;
    this.currentIndex = this.nextIndex;
    if (nIndex === this.state.response.docks.length - 1) {
      this.nextIndex = null;
    } else if (nIndex === null) {
      this.nextIndex = 0;
    } else {
      this.nextIndex = nIndex + 1;
    }
  }

  leftAndUpKeyForSelectedItem(pIndex, cIndex, nIndex, labelClone, resultLabel) {
    if (pIndex === null) {
      this.goToLabel(resultLabel.labelId, labelClone);
    } else {
      this.goToDropZone(labelClone, pIndex);
    }
    if (cIndex === null) {
      this.prevIndex = this.state.response.docks.length - 2;
    } else if (cIndex === 0) {
      this.prevIndex = this.state.response.docks.length - 1;
    } else if (cIndex === 1) {
      this.prevIndex = null;
    } else {
      this.prevIndex = cIndex - 2;
    }
    if (pIndex === this.state.response.docks.length - 1) {
      this.currentIndex = this.state.response.docks.length - 1;
    } else if (pIndex === null) {
      this.currentIndex = null;
    } else {
      this.currentIndex = pIndex;
    }
    if (cIndex === null) {
      this.nextIndex = 0;
    } else if (cIndex === this.state.response.docks.length - 1) {
      this.nextIndex = null;
    } else {
      this.nextIndex = cIndex;
    }
  }
  spaceAndEnterKeyForSelectedItem(labelClone, resultLabel) {
    this.dockHeight = 0;
    if (this.currentIndex === null) {
      this.cdStateService.makeLabelEnable.next(parseInt(resultLabel.labelId));
      labelClone.remove();
      this.dragAndDropService.removeDisbaleClass.next(resultLabel.labelId);
      setTimeout(() => {
        const idOfLabel = parseInt(resultLabel.labelId);
        let label = document.getElementById(`label_${idOfLabel}`);
        this.announcer.announce(this.a11yHelper.getAnnounceMsg('labelDroppedToList'));
        label.focus();
      })
    } else {
      this.setAnnounceLabel(resultLabel, true);
      this.pickedDropZoneIndex = this.currentIndex;
      this.updateDropzone(labelClone, resultLabel, this.initialX, this.initialY);
      this.undoObj.actionData.new = this.cdStateService.getDataOfFields(['response']);
      this.undoRedoService.updateUndoArray(JSON.parse(JSON.stringify(this.undoObj)));
    }
    this.removeDropzoneBorder();
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
      this.isLabelPicked = false;
      // this.undoObj.actionData.new = this.cdStateService.getDataOfFields(['response']);
      // this.undoRedoService.updateUndoArray(JSON.parse(JSON.stringify(this.undoObj)));
    }
  }

  updateDropzone(labelClone, resultLabel, initialX, initialY) {
    let resultDropzone = this.dragAndDropService.checkIsDropzone(initialX + 3, initialY + 3);
    if (resultDropzone.isDropzone) {
      this.dragAndDropService.drop.next({ dropZone: resultDropzone.dropZone, label: resultLabel.label, dropzoneId: resultDropzone.dropzoneId, labelId: resultLabel.labelId, isDropped: resultDropzone.isDropzone });
      labelClone.remove();
      this.magnifyPreviewService.hide();
      setTimeout(() => {
        let labelsEles: any = document.getElementsByClassName('draggable');
        for (let i = 0; i < labelsEles.length; i++) {
          const elLabelId = this.getElementAttr(labelsEles[i], 'labelid');
          if (elLabelId === resultLabel.labelId) {
            if (!labelsEles[i].classList.contains('disabled') && !labelsEles[i].classList.contains('label-stack')) {
              labelsEles[i].focus();
            }
          }
        }
        if (this.state.activity.name !== 'grouping') {
          const dock = this.state.dockData.docks.find((d) => d.id === parseInt(resultDropzone.dropzoneId));
          this.magnifyPreviewService.show(dock);
        }

      });
    }
  }

  escapeKeyForSelectedItem(labelClone, resultLabel) {
    if (this.isPickedFromLabelSection) {
      this.cdStateService.makeLabelEnable.next(parseInt(resultLabel.labelId));
      labelClone.remove();
      this.dragAndDropService.removeDisbaleClass.next(resultLabel.labelId);
      const idOfLabel = parseInt(resultLabel.labelId);
      let label = document.getElementById(`label_${idOfLabel}`);
      setTimeout(() => {
        label.focus();
      });
      this.setAnnounceForCancelLabelsMovement();
      if (this.state.activity.name === 'labeling') {
        this.magnifyPreviewService.hide();
      }
      this.dragAndDropService.removeDisbaleClass.next(resultLabel.labelId);
    } else if (resultLabel) {
      this.setAnnounceForCancelDropZoneMovement(resultLabel);
      this.updateDropzone(labelClone, resultLabel, this.pickedLabelCordinate.initialX, this.pickedLabelCordinate.initialY);
    }
    this.removeDropzoneBorder();
    this.isLabelPicked = false;
  }

  addDrozoneBorder(index) {
    const groupElems: any = document.querySelectorAll('.dropable');
    for (let i = 0; i < groupElems.length; i++) {
      if (groupElems[i].id === 'dropzone_' + index) {
        groupElems[i].style.outline = 'solid 3px #003b4c';
        groupElems[i].style.border = '1px solid transparent';
      } else {
        groupElems[i].style.outline = '';
        groupElems[i].style.border = '';
      }
    }
  }
  removeDropzoneBorder() {
    const groupElems: any = document.querySelectorAll('.dropable');
    for (let i = 0; i < groupElems.length; i++) {
      groupElems[i].style.outline = '';
      groupElems[i].style.border = '';
    }
  }

  goToDropZone(labelClone: any, index: any) {
    let labelHeight;
    if (this.state.activity.name !== 'grouping') {
      const dock = this.state.dockData.docks.find((d) => d.id === this.state.response.docks[index].id);
      const labelHeader = document.getElementsByClassName('label-header') as HTMLCollectionOf<HTMLElement>;
      this.initialX = dock.position.x + labelHeader[0].offsetWidth + 2;
      this.initialY = dock.position.y + labelHeader[0].offsetHeight;
      labelHeight = dock.height;
      this.magnifyPreviewService.show(dock);
      labelClone.style.height = labelHeight + 'px';
      this.setAnnounceDropZone(dock, index);
      this.addDrozoneBorder(dock.id);
    } else {
      const groupElems: any = document.querySelectorAll('.dropable');
      const group = groupElems[index];
      let labelCordinate;
      if (this.dockHeight !== 0) {
        for (let i = 0; i < groupElems.length; i++) {
          groupElems[i].style.minHeight = this.dockHeight + 'px';
        }
      }
      const groupCordinate = group.getBoundingClientRect();
      const groupData = this.state.response.docks.find(d => 'dropzone_' + d.id === group.id);
      if (groupData.linkedLabel.length > 0) {
        let label, invisibleLabelAtFirstPosition = false;
        const groupEl = group.children[0];
        const linkedLabelLength = groupEl.children.length;
        label = groupEl.children[groupEl.children.length - 1];
        for (let i = 0; i < linkedLabelLength; i++) {
          if (group.children[0].children[i].classList.contains('invisible')) {
            if (i !== 0) {
              label = group.children[0].children[i];
              break;
            } else {
              invisibleLabelAtFirstPosition = true;
            }
          }
        }
        if (!invisibleLabelAtFirstPosition) {
          labelCordinate = label.getBoundingClientRect();
          const extraHeight = (groupCordinate.y + groupCordinate.height) - (labelCordinate.y + labelCordinate.height + 40);
          if (groupCordinate.y + groupCordinate.height < labelCordinate.y + labelCordinate.height + labelClone.getBoundingClientRect().height + 20) {
            this.dockHeight = groupCordinate.height;
            for (let i = 0; i < groupElems.length; i++) {
              groupElems[i].style.minHeight = groupCordinate.height + labelClone.getBoundingClientRect().height - extraHeight + 'px';
            }
          }
          this.cdStateService.checkForMaxBoundryHeight();
          const responseLabel = this.state.response.labels.find(l => l.id.toString() === this.getElementAttr(labelClone, 'labelid'));
          const labelData = this.state.labelData.labels.find(l => l.id === responseLabel.orgId);
          const isLabelWithMedia = labelData.mediaType !== '' ? true : false;
          groupCordinate.y = labelCordinate.y + labelCordinate.height + (isLabelWithMedia ? 0 : 10);
        }
      }
      this.setAnnounceGroupDropZone(groupData);
      this.initialX = groupCordinate.x + 12;
      this.initialY = groupCordinate.y + 5;
      this.addDrozoneBorder(index + 1);
    }
    labelClone.style.left = this.initialX + 'px';
    labelClone.style.top = this.initialY + 'px';
    labelClone.scrollIntoView(false);
  }
  goToLabel(labelId: any, labelClone: any) {
    let labelCordinate;
    let labelsEles: any = document.getElementsByClassName('draggable');
    for (let i = 0; i < labelsEles.length; i++) {
      const elLabelId = 'label_' + this.getElementAttr(labelsEles[i], 'labelid');
      if (elLabelId === ('label_' + labelId)) {
        if (labelsEles[i].classList.contains('disabled') || labelsEles[i].classList.contains('label-stack')) {
          labelCordinate = labelsEles[i].getBoundingClientRect();
        }
      }
    }
    labelClone.style.left = labelCordinate.left + 'px';
    labelClone.style.top = labelCordinate.top + 'px';
    labelClone.style.height = labelCordinate.height + 'px';
    labelClone.scrollIntoView(false);
    this.magnifyPreviewService.hide();
    const groupElems: any = document.querySelectorAll('.dropable');
    if (this.state.activity.name === 'grouping') {
      if (this.dockHeight !== 0) {
        for (let i = 0; i < groupElems.length; i++) {
          groupElems[i].style.minHeight = this.dockHeight + 'px';
        }
      }
    }
    this.announcer.announce(this.a11yHelper.getAnnounceMsg('labelMoveBackToList'));
    this.removeDropzoneBorder();
  }

  setAnnounceLabel(label, isDropzone?) {
    const QResponseLabel = this.state.response.labels.find(l => l.id === parseInt(label.labelId));
    const QLabel = this.state.labelData.labels.find(l => l.id === QResponseLabel.orgId);
    if (QLabel) {
      if (QLabel.mediaType === "") {
        isDropzone ? this.setAnnounceForNormalLabelsDropped(QLabel) : this.setAnnounceForNormalLabels(QLabel);
      } else {
        isDropzone ? this.setAnnounceForMediaLabelsDropped(QLabel) : this.setAnnounceForMediaLabels(QLabel);
      }
    }
  }

  setAnnounceForNormalLabels(labels) {
    const isGroupActivity = this.state.activity.name === "grouping" ? true : false;
    const labelObj = {
      label: this.cdStateService.stripHtmlTags(labels.text)
    }
    if (isGroupActivity) {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupNormalLabelLift', labelObj));
    } else {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('normalLabelLift', labelObj));
    }
  }

  setAnnounceForMediaLabels(labels) {
    const isGroupActivity = this.state.activity.name === "grouping" ? true : false;
    const media = this.mediaService.getMediaDetails(labels.image.mediaId);
    const labelObj = {
      label: this.cdStateService.stripHtmlTags(labels.text),
      labelType: labels.mediaType,
      shortDescription: this.cdStateService.setImageAltText(media, labels.image, 'altText')
    }
    if (isGroupActivity) {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupMediaLabelLift', labelObj));
    } else {
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('mediaLabelLift', labelObj));
    }
  }


  setAnnounceDropZone(dock, index) {
    const label = this.state.labelData.labels.find(l => l.id === dock.linkedLabel[0]);
    const responseLabel = this.state.response.docks.find(l => l.id === dock.id);
    const dropZoneObj = {
      description: this.cdStateService.stripHtmlTags(label.dropzoneDescription),
      currentIndex: index + 1,
      totalDropZoneLength: this.state.dockData.docks.length,
      dockText: this.getLabelText(responseLabel)
    }
    return this.announcer.announce(this.a11yHelper.getAnnounceMsg('dropZoneMove', dropZoneObj));
  }

  setAnnounceForNormalLabelsDropped(labels) {
    const isGroupActivity = this.state.activity.name === "grouping" ? true : false;
    if (isGroupActivity) {
      const resultDropzone = this.dragAndDropService.checkIsDropzone(this.initialX + 3, this.initialY + 3);
      const dock = this.state.dockData.docks.find((d) => d.id === parseInt(resultDropzone.dropzoneId));
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dock.headerText))
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupNormalLabelDropped', labelObj));
    } else {
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        currentIndex: this.currentIndex + 1,
        totalDropZoneLength: this.state.dockData.docks.length
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('normalLabelDropped', labelObj));
    }

  }

  setAnnounceForMediaLabelsDropped(labels) {
    const media = this.mediaService.getMediaDetails(labels.image.mediaId);
    const isGroupActivity = this.state.activity.name === "grouping" ? true : false;
    if (isGroupActivity) {
      const resultDropzone = this.dragAndDropService.checkIsDropzone(this.initialX + 3, this.initialY + 3);
      const dock = this.state.dockData.docks.find((d) => d.id === parseInt(resultDropzone.dropzoneId));
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        labelType: labels.mediaType,
        groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dock.headerText)),
        shortDescription: this.cdStateService.setImageAltText(media, labels.image, 'altText')
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupMediaLabelDropped', labelObj));
    } else {
      const labelObj = {
        label: this.cdStateService.stripHtmlTags(labels.text),
        currentIndex: this.currentIndex + 1,
        totalDropZoneLength: this.state.dockData.docks.length,
        labelType: labels.mediaType,
        shortDescription: this.cdStateService.setImageAltText(media, labels.image, 'altText')
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('mediaLabelDropped', labelObj));
    }
  }

  // update aria attributes for clone element
  // updateA11yAttributes(element) {
  //   const childClassNames = ['.label-text', 'img', '.ahe-ui-link', '.btn'];
  //   element.removeAttribute('aria-label');
  //   element.removeAttribute('aria-roledescription');
  //   element.removeAttribute('aria-grabbed');
  //   element.removeAttribute('aria-disabled');
  //   element.setAttribute('aria-hidden', 'true');
  //   childClassNames.forEach(item => {
  //     element.querySelectorAll(item).forEach(el => {
  //       el.setAttribute('aria-hidden', 'true');
  //     });
  //   })
  // }


  setAnnounceForCancelLabelsMovement() {
    return this.announcer.announce(this.a11yHelper.getAnnounceMsg('cancelMovementLabel'), 'assertive');
  }

  setAnnounceForCancelDropZoneMovement(label) {
    const isGroupActivity = this.state.activity.name === "grouping" ? true : false;
    if (isGroupActivity) {
      const resultDropzone = this.dragAndDropService.checkIsDropzone(this.pickedLabelCordinate.initialX + 3, this.pickedLabelCordinate.initialY + 3);
      const dock = this.state.dockData.docks.find((d) => d.id === parseInt(resultDropzone.dropzoneId));
      const labelObj = {
        groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dock.headerText))
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupCancelMovementDropZone', labelObj), 'assertive');
    } else {
      const labelObj = {
        currentIndex: this.pickedDropZoneIndex + 1,
        totalDropZoneLength: this.state.dockData.docks.length,
      }
      return this.announcer.announce(this.a11yHelper.getAnnounceMsg('cancelMovementDropZone', labelObj), 'assertive');
    }

  }

  setAnnounceGroupDropZone(dropZone) {
    const media = dropZone.isImageAdded ? this.mediaService.getMediaDetails(dropZone?.media?.mediaId) : '';
    const index = this.state.dockData.docks.findIndex((d) => d.id === parseInt(dropZone.id));
    const responseLabel = this.state.response.docks.find(l => l.id === dropZone.id);
    const labelObj = {
      currentIndex: index + 1,
      totalDropZoneLength: this.state.dockData.docks.length,
      groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(dropZone.headerText)),
      shortDescription: dropZone.isImageAdded ? this.cdStateService.setImageAltText(media, dropZone.media, 'altText') : '',
      dockText: this.getLabelText(responseLabel)
    }
    return this.announcer.announce(this.a11yHelper.getAnnounceMsg('groupDropZoneMove', labelObj));
  }

  getElementAttr(el: HTMLElement, key: string): string {
    if (el) {
      return el.getAttribute(key);
    }
  }

  getResponseLabel(label) {
    let dockText = [];
    label.linkedLabel.forEach(l => {
      const orgID = this.state.response.labels.find(x => x.id === l);
      const orgLabel = this.state.labelData.labels.find(x => x.id === orgID.orgId);
      if (orgLabel) {
        dockText.push(orgLabel.text);
      }
    });
    return dockText;
  }

  getLabelText(responseLabel) {
    const dock = this.getResponseLabel(responseLabel);
    let dockText = '';
    dock.forEach((x, index) => {
      if (index === 0) {
        dockText += `has ${this.cdStateService.stripHtmlTags(x)}`;
      } else {
        dockText += ` and ${this.cdStateService.stripHtmlTags(x)}`;
      }
    });
    return dockText;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
