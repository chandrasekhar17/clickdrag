import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { APP_CONFIG } from '../../shared/constants/appconfig';
import { DummyMediaData } from '../../config/dummyData';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MediaService } from '../media/media.service';
import { A11yHelperService } from '../../shared/services/a11y-helper.service';

@Injectable({
  providedIn: 'root',
})
export class CdStateService {
  private _cdState;
  public appVersion;
  public isSafari = false;
  public isFirefox = false;
  public iteratorLabel = 1;
  public iteratorDock = 1;
  public labelIndex;
  public mediaList: Array<any> = DummyMediaData.dummyMediaList;
  public mediaData = DummyMediaData;
  current_x_axis = APP_CONFIG.DROPZONE_CORDINATES.INITIAL_X_AXIS;
  current_y_axis = APP_CONFIG.DROPZONE_CORDINATES.INITIAL_Y_AXIS;
  public activeMedia;
  public objectSelected = false;
  public selectedObject = { objRef: {}, type: '' };
  public labelHeight = 60;
  public leaderLineNodes = [];
  public currentStartNode;
  public dropZoneIndex;
  public imageDeleted = false;
  isLabelDropped = false;
  eztoHeight: any;
  eztoDim = { width: 0, height: 0 };
  public removedDuplicates = { removedLabels: [], removedDocks: [] };

  undoTestMode: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  stateUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  imageDataUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  bgMoved: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  bgMovedBy: BehaviorSubject<any> = new BehaviorSubject<any>({ x: 0, y: 0 });
  dockMoved: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  labelTextUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(1);
  selectionUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({ objRef: {}, type: '' });
  heightAdjustingOfDock: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  leaderLineNodeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  selectedGroup = [];
  bucketArrayLength: any;
  bgImageDataUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  guideLineDelete: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  labelDeleted: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  updateDockHeightOnAddingMedia: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  updateGroupLabels: Subject<any> = new Subject<any>();
  groupLengthUpdate: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  expandToolsPanel: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);
  editDescriptionButtonDisable: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);
  checkHeight: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  updateHeightOnGroupDeletion: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  groupHasImage: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  groupContainerWidthUpdate: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  disablResetAll: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  makeLabelEnable: BehaviorSubject<any> = new BehaviorSubject<any>({});
  highlightLabel = new Subject();
  highlightDropzone = new Subject();
  updateDockLabelData = new Subject();
  updateImageDescription = new Subject();
  editorBlur = new Subject();
  editorInFocus = false;
  groupImageDescUpdate = new Subject();
  highlightErrorLabel = new Subject();
  removeHighlight = new Subject();

  BuketAdded = false;
  public iterateResponseLabel = 1;
  public isDislayEachLabel: boolean = false;

  constructor(private injector: Injector, private mediaService: MediaService, private a11yHelper: A11yHelperService) { }

  setActivity(typeOfActivity: string, typeOfInteraction: string, typeOfOccurrence: string) {
    this._cdState.activity.name = typeOfActivity;
    this._cdState.activity.options.labelInteraction = typeOfInteraction;
    this._cdState.activity.options.typeOfOccurrence = typeOfOccurrence;
    if (typeOfActivity === 'grouping') {
      this._cdState.dockData.docks[0].linkedLabel = [];
      this._cdState.dockData.docks[1].linkedLabel = [];
      this._cdState.labelData.labels[0].dockedTo = [];
      this._cdState.labelData.labels[1].dockedTo = [];
      this._cdState.canvas.width = 900;
    }
  }

  initState() {
    const new_x_axis = this.current_x_axis;
    const new_y_axis = this.current_y_axis;
    const activity = {
      name: null,
      options: {
        labelInteraction: null,
        typeOfOccurrence: null,
      },
    };
    const canvas = {
      width: this.eztoDim.width < 800 ? 800 : this.eztoDim.width,
      height: this.eztoDim.height < 600 ? 600 : this.eztoDim.height,
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
    const label1 = this.getLabelData(new_x_axis, new_y_axis);
    const dock1 = this.createNewDoc(new_x_axis, new_y_axis, label1.id);
    const label2 = this.getLabelData(new_x_axis, new_y_axis);
    const dock2 = this.createNewDoc(
      new_x_axis,
      new_y_axis + APP_CONFIG.DROPZONE_CORDINATES.Y_AXIS - APP_CONFIG.NEW_DOCK_SEPARATION_GAP,
      label2.id
    );
    const labelData = {
      labels: [label1, label2],
      width: 150,
      height: 60,
      totalLabels: 2,
      idCount: this.iteratorLabel,
      shuffleForStudent: true,
    };
    const dockData = {
      sizeSameAsLabels: null,
      docks: [dock1, dock2],
      idCount: this.iteratorDock,
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
    this.current_x_axis = new_x_axis;
    this.current_y_axis = new_y_axis;
    //this.iteratorLabel++;
    //this.iteratorDock++;

    this._cdState = {
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
    console.log(this._cdState);
    this.bucketArrayLength = dockData.docks.length;
  }

  toggleShuffleForStudent() {
    this._cdState.labelData.shuffleForStudent = !this._cdState.labelData.shuffleForStudent;
  }

  getLabelData(new_x_axis?, new_y_axis?) {
    const labels = {
      id: this.iteratorLabel,
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
      // position: { x: new_x_axis, y: new_y_axis }, // this will be relative to canvas top left corner.
      dockedTo: [this.iteratorDock],
      height: 60,
      width: 150,
    };
    this.iteratorLabel++;
    return labels;
  }

  createNewDoc(new_x_axis, new_y_axis, labelId) {
    const docData = {
      id: this.iteratorDock,
      linkedLabel: [labelId], // this can be array depenging on the activity type.
      position: { x: new_x_axis, y: new_y_axis }, // this will be relative to canvas top left corner.
      width: APP_CONFIG.NEW_DOCK_WIDTH,
      height: this.labelHeight, // docks items will have width and height property for each item, because it depends on activity type.
      // leaderLine: {
      //   // THIS STRUCTURE IS NOT COMPLETE YET.
      //   direction: '', // top / left / right / bottom,
      //   position: { x: 0, y: 0 }, // this will be relative to canvas top left corner.
      //   branches: [
      //     {
      //       position: { x: 100, y: 300 }, // this will be relative to canvas top left corner.
      //       color: '',
      //     },
      //   ],
      // },
      hasError: false,
      media: {
        mediaId: '',
        altText: '',
        description: '',
        position: { x: 0, y: 0 }, // this will be relative to the frame top left corner.
        width: 180,
        height: 220,
      },
      headerText: '', // will be present only for grouping type activity.
      image: {
        width: 180,
        height: 220,
      },
    };
    //this.iteratorDock++;
    this.iteratorDock++;

    return docData;
  }

  findMaxId(docks) {
    return Math.max.apply(
      Math,
      docks.map(function (o) {
        return o.id;
      })
    );
  }

  findCount(idArray, id) {
    return idArray.filter((x) => x === id).length;
  }

  removeArrayEle(array, item) {
    var index = array.indexOf(item);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  checkForDuplicates(state, checkFor) {
    let duplicates = [];
    let list;
    if (checkFor === 'docks') {
      list = state.dockData.docks;
    } else {
      list = state.labelData.labels;
    }

    for (let item of list) {
      for (let item2 of list) {
        if (item !== item2 && item.id === item2.id) {
          duplicates.push(item);
        }
      }
    }

    list = list.filter((item) => {
      if (!duplicates.includes(item)) {
        return true;
      } else {
        return false;
      }
    });

    if (checkFor === 'docks') {
      state.dockData.docks = list;
    } else {
      state.labelData.labels = list;
    }

    return duplicates;
  }

  deleteDocks(toDelete, ele) {
    for (var i = toDelete.length - 1; i >= 0; i--) {
      ele.splice(toDelete[i], 1);
    }
  }

  checkForUnLinkedLabelsAndDocks(state, removedDocks, removedLabels) {
    let dockData = state.dockData;
    let labelData = state.labelData;

    let count = 0;
    let dockOrLabelRemoved = false;

    do {
      dockOrLabelRemoved = false;

      dockData.docks = dockData.docks.filter((dock) => {
        let labelFound = false;
        for (let label of labelData.labels) {
          if (label.id === dock.linkedLabel[0]) {
            labelFound = true;
            break;
          }
        }
        if (labelFound) {
          return true;
        } else {
          dockOrLabelRemoved = true;
          removedDocks.push(dock);
        }
      });


      labelData.labels = labelData.labels.filter((label) => {
        if (!label.distractor) {
          label.dockedTo = label.dockedTo.filter((dockId) => {
            let dockFound = false;
            for (let dock of dockData.docks) {
              if (dock.id === dockId) {
                dockFound = true;
                break;
              }
            }
            if (dockFound) {
              return true;
            }
          });
          if (label.dockedTo.length > 0) {
            return true;
          } else {
            dockOrLabelRemoved = true;
            removedLabels.push(label);
          }
        } else {
          return true;
        }
      });
      count++;
    } while (count < 5 && dockOrLabelRemoved);
  }

  setState(state) {
    this._cdState = JSON.parse(state);
    if (this._cdState.labelData.shuffleForStudent === undefined) {
      this._cdState.labelData.shuffleForStudent = true;
    }
    if (this._cdState.activity.name === 'labeling') {
      let removedDocks = this.checkForDuplicates(this._cdState, 'docks');
      let removedLabels = this.checkForDuplicates(this._cdState, 'labels');
      this.checkForUnLinkedLabelsAndDocks(this._cdState, removedDocks, removedLabels);
      this.removedDuplicates = { removedLabels, removedDocks };
    }
    this.iteratorLabel = this.findMaxId(this._cdState.labelData.labels) + 1;
    this.iteratorDock = this.findMaxId(this._cdState.dockData.docks) + 1;
    this.labelHeight = this._cdState.dockData.biggestLabelHeight;
    if (EZ.mode === EZ.MODE_DESIGN) {
      this.setLeaderLineNodes();
      for (let dock of this._cdState.dockData.docks) {
        if (dock.media.mediaId !== undefined && dock.media.mediaId !== '') {
          this.groupHasImage.next(true);
          //this.groupContainerWidthUpdate.next(true);
          break;
        }
      }
    }

    // test mode
    if (EZ.mode === EZ.MODE_TEST || EZ.mode === EZ.MODE_PREGRADE || EZ.mode === EZ.MODE_POST_TEST) {
      if (!this._cdState.response) {
        this._cdState.response = {
          labels: [],
          docks: [],
        };
        this._cdState.labelData.labels.forEach((element) => {
          this.isDislayEachLabel =
            this._cdState.activity.options.typeOfOccurrence === 'display-each-instance' ? true : false;
          if (this.isDislayEachLabel) {
            if (element.distractor) {
              this._cdState.response.labels.push(
                this.createresponseObjForLabels(this.iterateResponseLabel, element.id)
              );
              this.iterateResponseLabel++;
            } else {
              element.dockedTo.forEach((val) => {
                this._cdState.response.labels.push(
                  this.createresponseObjForLabels(this.iterateResponseLabel, element.id)
                );
                this.iterateResponseLabel++;
              });
            }
          } else {
            this._cdState.response.labels.push(this.createresponseObjForLabels(this.iterateResponseLabel, element.id));
            this.iterateResponseLabel++;
          }
        });
        let docks = JSON.parse(JSON.stringify(this._cdState.dockData.docks));
        docks = docks.sort(function (a, b) {
          if (a.position.y === b.position.y) {
            return a.position.x - b.position.x;
          } else {
            return a.position.y - b.position.y;
          }
        });
        docks.forEach((element) => {
          this._cdState.response.docks.push(this.createresponseObjFordocks(element.id));
        });

        //shuffle labels here.

        let shuffleForStudent = this._cdState.labelData.shuffleForStudent;
        if (shuffleForStudent) {
          this._cdState.response.labels = this.shuffleLabels(this._cdState.response.labels);
        }

        if (!this._cdState.feedback) {
          this._cdState.feedback = {};
        }
      }
      this.a11yHelper.labelCount = this._cdState.response.labels.length;
      this.a11yHelper.dockCount = this._cdState.response.docks.length;
    }

    if (EZ.mode === EZ.MODE_PREVIEW) {
      if (this._cdState.activity.name === 'labeling') {
        let docks = JSON.parse(JSON.stringify(this._cdState.dockData.docks));
        docks = docks.sort(function (a, b) {
          return a.position.x - b.position.x;
        });
        docks = docks.sort(function (a, b) {
          return a.position.y - b.position.y;
        });

        this._cdState.dockData.docks = docks;
      }
      this.a11yHelper.dockCount = this._cdState.dockData.docks.length;
      this.a11yHelper.setLabelCount(this._cdState);
    }

    if (EZ.mode === EZ.MODE_PREGRADE || EZ.mode === EZ.MODE_POST_TEST) {
      this.getScore();
    }
    if (EZ.mode === EZ.MODE_TEST || EZ.mode === EZ.MODE_DESIGN)
      this.checkHeight.next(true);

    if (EZ.mode !== EZ.MODE_DESIGN) {
      try {
        this.updateAllDocksHeight();
      } catch (error) {
        console.log("Error in updating all docks height : ", error);
      }
    }
  }

  updateAllDocksHeight() {
    let maximumDockHeight = 0;
    let allCalculatedDockHeight = [];

    let docks = this._cdState.dockData.docks;
    let labels = this._cdState.labelData.labels;
    maximumDockHeight = Math.max(...docks.map(dock => dock.height));

    for (let dock of docks) {
      let linkedLabelsArray = dock.linkedLabel;
      let heightOfIndividualDock = 0;
      for (let singleLabelId of linkedLabelsArray) {
        let label = labels.find((label) => label.id === singleLabelId);
        heightOfIndividualDock += (label.height + APP_CONFIG.NEW_DOCK_SEPARATION_GAP);
      }
      allCalculatedDockHeight.push(heightOfIndividualDock);
    }

    let calculatedHeightOfDocks = Math.max(...allCalculatedDockHeight);

    let dockHeightToUse = calculatedHeightOfDocks > maximumDockHeight ? calculatedHeightOfDocks : maximumDockHeight;

    for (let dock of docks) {
      dock.height = dockHeightToUse;
    }
  }

  randomlyShuffleArray(array) {
    let currentIndex = array.length,
      randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  shuffleLabels(array) {
    let result = [];
    let orgIdArray = array.map((val) => val.orgId);
    let uniqueArray = [...new Set(orgIdArray)];
    let uniqueRandomisedArray = this.randomlyShuffleArray(uniqueArray);

    uniqueRandomisedArray.forEach((element) => {
      const filteredElements = array.filter((val) => val.orgId === element);
      filteredElements.forEach((singleElement) => {
        result.push(singleElement);
      });
    });

    return result;
  }

  createresponseObjForLabels(id, orgId) {
    const responseLabel = {
      id: id,
      orgId: orgId,
      dockedTo: [],
    };
    return responseLabel;
  }
  createresponseObjFordocks(id) {
    const responseDock = {
      id: id,
      linkedLabel: [],
    };
    return responseDock;
  }
  shuffle(array: any) {
    return array.sort(() => Math.random() - 0.5);
  }

  setLeaderLineNodes() {
    this.leaderLineNodes.length = 0;
    this._cdState.dockData.docks.forEach((dock) => {
      if (dock.leaderLine && dock.leaderLine.branches) {
        let parent = dock.leaderLine;
        let leaderLineHandler = (node) => {
          let prevParent;
          this.leaderLineNodes.push({ parent, nodeRef: node, dockRef: dock });
          if (node.branches) {
            prevParent = parent;
            parent = node;
            node.branches.forEach(leaderLineHandler);
            parent = prevParent;
          }
        };
        dock.leaderLine.branches.forEach(leaderLineHandler);
      }
    });
  }

  getState() {
    this._cdState.dockData.biggestLabelHeight = this.labelHeight;
    return this._cdState;
  }

  getScore() {
    try {
      if (EZ.mode !== EZ.MODE_DESIGN && EZ.mode !== EZ.MODE_PREVIEW && !!this._cdState.response) {
        const feedback = {};
        const response = this._cdState.response;
        const activity = this._cdState.activity;
        let totalGrade = 0;
        let correct = 0;
        let wrong = 0;
        let score = 0;
        for (let i = 0; i < response.docks.length; i++) {
          const respDock = response.docks[i];
          const authDock = this._cdState.dockData.docks.find((dock) => dock.id === respDock.id);
          totalGrade = totalGrade + authDock.linkedLabel.length;
          for (let j = 0; j < respDock.linkedLabel.length; j++) {
            const droppedLabelId = respDock.linkedLabel[j];
            const labelObj = response.labels.find((label) => label.id === droppedLabelId);

            const combId = respDock.id + '_' + labelObj.id;

            let isCorrect = false;
            if (authDock.linkedLabel.includes(labelObj.orgId)) {
              isCorrect = true;
              correct++;
            } else {
              wrong++;
            }
            feedback[combId] = isCorrect;
          }
        }
        if (activity.name === 'labeling') {
          score = Number(((correct * 100) / totalGrade).toFixed(2));
        } else {
          if (
            activity.options.labelInteraction === 'one-label-multiple-dock' &&
            activity.options.typeOfOccurrence === 'display-once'
          ) {
            score = Number((((correct - wrong) * 100) / totalGrade).toFixed(2));
          } else {
            score = Number(((correct * 100) / totalGrade).toFixed(2));
          }
        }
        this._cdState.feedback = feedback;
        score = score < 0 ? 0 : score > 100 ? 100 : score;
        console.log('score:', score);
        return score;
      } else {
        return 0;
      }
    } catch (e) {
      return 0;
    }
  }

  getCompletion(stateStr) {
    try {
      const state = stateStr ? JSON.parse(stateStr) : this._cdState;
      const activity = state.activity;
      const response = state.response;
      if (!response) {
        return 0;
      }
      let completion = 0;
      let totalLabelsToDrop = 0;
      let droppedLabels = 0;
      for (let i = 0; i < response.docks.length; i++) {
        const respDock = response.docks[i];
        const authDock = this._cdState.dockData.docks.find((dock) => dock.id === respDock.id);
        totalLabelsToDrop = totalLabelsToDrop + authDock.linkedLabel.length;
        droppedLabels = droppedLabels + respDock.linkedLabel.length;
      }
      if (activity.name === 'labeling') {
        completion = Number(((droppedLabels * 100) / totalLabelsToDrop).toFixed(2));
      } else if (droppedLabels > 0) {
        completion = 100;
      }
      completion = completion < 0 ? 0 : completion > 100 ? 100 : completion;
      return completion;
    } catch (e) {
      return 0;
    }
  }

  addLabelData(isDistractor, index) {
    const new_x_axis = this.current_x_axis + APP_CONFIG.DROPZONE_CORDINATES.X_AXIS;
    const new_y_axis = this.current_y_axis + APP_CONFIG.DROPZONE_CORDINATES.Y_AXIS;
    const newLabelData = this.getLabelData(new_x_axis, new_y_axis);
    if (this._cdState.activity.name === 'grouping') {
      newLabelData.dockedTo = [];
    }
    const state = this._cdState;
    if (this._cdState.activity.name !== 'grouping') {
      // this.linkeLabelIdArray.push(newLabelData.id)
      this.addDockToLabel(state, newLabelData.id);
    }
    const labels = state.labelData.labels;
    labels.splice(index + 1, 0, newLabelData);
    // labels.push(newLabelData);
    state.labelData.idCount = this.iteratorLabel;
    //this.iteratorLabel++;
    console.log(state);
    this.stateUpdated.next(true);
  }

  setLabelDataForDragAndDropCase(data) {
    let oldLabels = data.stateFields.labelData.labels;
    let currentLabels = this._cdState.labelData.labels;
    for (let i = 0; i < currentLabels.length; i++) {
      let currentLabel = currentLabels[i];
      let oldLabel = oldLabels[i];
      currentLabel.dockedTo = oldLabel.dockedTo;
    }
  }

  setDockDataForDragAndDropCase(data) {
    let oldDocks = data.stateFields.dockData.docks;
    let currentDocks = this._cdState.dockData.docks;
    for (let i = 0; i < currentDocks.length; i++) {
      let currentDock = currentDocks[i];
      let oldDock = oldDocks[i];
      currentDock.linkedLabel = oldDock.linkedLabel;
    }
  }

  setDataOfFields(data) {
    this.setFrameData(data.stateFields.frameData);
    this.setLabelData(data.stateFields.labelData);
    this.setCanvasData(data.stateFields.canvas);
    this.setDockData(data.stateFields.dockData);
    this.setLabelHeight(data.variableFields.labelHeight);
    this.setLeaderLineNodes();
  }

  setResponseData(response) {
    const tempResponse = JSON.parse(JSON.stringify(response));
    this.updateArrayWithoutLosingRef(this._cdState.response.docks, tempResponse.docks);
    this.updateArrayWithoutLosingRef(this._cdState.response.labels, tempResponse.labels);
  }

  setCanvasData(canvas) {
    this.updateObjKeepingRef(this._cdState.canvas, canvas);
  }

  setLabelHeight(labelHeight) {
    this.labelHeight = labelHeight;
  }

  setFrameData(frameData) {
    this.updateObjKeepingRef(this._cdState.frameData.frames[0], frameData.frames[0]);
  }

  setLabelData(labelData) {
    this.updateArrayWithoutLosingRef(this._cdState.labelData.labels, labelData.labels);
  }

  setDockData(dockData) {
    this.updateArrayWithoutLosingRef(this._cdState.dockData.docks, dockData.docks);
  }

  updateArrayWithoutLosingRef(reference, array) {
    Object.assign(reference, array, { length: array.length });
    // [].splice.apply(reference, [0, reference.length].concat(array));
  }

  addDropZone(index) {
    const state = this._cdState;
    let dockedTo = state.labelData.labels[index].dockedTo;
    const label = state.labelData.labels[index];
    if (Array.isArray(dockedTo) && dockedTo.length >= 5) {
      return;
    }

    if (Array.isArray(dockedTo)) {
      dockedTo.push(state.dockData.idCount);
    } else {
      dockedTo = [...[dockedTo], state.dockData.idCount];
    }
    // this.linkeLabelIdArray.push(label.id)
    this.addDockToLabel(state, label.id);
    state.labelData.labels[index].dockedTo = dockedTo;
    this.stateUpdated.next(true);
  }

  /**
   * Method to deep update the values of the source object from new object without changing source  object reference
   * @param {*} sourceObj
   * @param {*} newObj
   */
  updateObjKeepingRef(sourceObj: any, newObj: any): void {
    Object.keys(newObj).forEach((key) => {
      // if value is object and instance is not Date
      if (newObj[key] && typeof newObj[key] === 'object' && sourceObj[key] && !(newObj[key] instanceof Date)) {
        this.updateObjKeepingRef(sourceObj[key], newObj[key]);
      } else {
        // updating properties
        sourceObj[key] = newObj[key];
      }
    });
  }

  getDataOfFields(stateFieldsTemp?, variableFieldsTemp?) {
    let stateFields = stateFieldsTemp ? stateFieldsTemp : ['labelData', 'dockData', 'frameData', 'canvas'];
    let variableFields = variableFieldsTemp ? variableFieldsTemp : ['labelHeight', 'leaderLineNodes'];
    let data = { stateFields: {}, variableFields: {} };

    for (let field of stateFields) {
      if (this._cdState[field]) {
        data.stateFields[field] = JSON.parse(JSON.stringify(this._cdState[field]));
      }
    }

    for (let field of variableFields) {
      if (this[field]) {
        data.variableFields[field] = JSON.parse(JSON.stringify(this[field]));
      }
    }

    return data;
  }

  markAsLabel(index) {
    const state = this._cdState;
    this.addDockToLabel(state, index);
    state.labelData.labels[index].distractor = false;
    this.stateUpdated.next(true);
  }

  /**
   * To get right aligned closest dock.
   * @returns dock , NOTE:If id of dock is -1,means no dock is present on right side.
   */
  getClosestRightAlignedDockToBg(xPos, width) {
    let docks = this._cdState.dockData.docks;
    let result = { position: { x: this._cdState.canvas.width, y: 0 }, id: -1 };
    for (let dock of docks) {
      let dockX = dock.position.x;
      let resultX = result.position.x;
      if (xPos + width < dockX && dockX <= resultX) {
        result = dock;
      }
    }
    return result;
  }

  /**
   * Checks if 2 rect overlaps in cartesian plane.
   * @returns boolean.
   */
  checkIfDocksOverlap(dock1, dock2) {
    let RectA = {
      left: dock1.position.x - 20,
      top: dock1.position.y - 20,
      right: dock1.position.x + dock1.width + 20,
      bottom: dock1.position.y + dock1.height + 20,
    };
    let RectB = {
      left: dock2.position.x,
      top: dock2.position.y,
      right: dock2.position.x + dock2.width,
      bottom: dock2.position.y + dock2.height,
    };

    return RectA.left < RectB.right && RectA.right > RectB.left && RectA.top < RectB.bottom && RectA.bottom > RectB.top;
  }

  /**
   * Auto adjusts docks position.
   */
  autoArrangeNewDockCord(startDock) {
    let newDockCord = {
      width: startDock.width,
      height: startDock.height,
      position: {
        x: startDock.position.x,
        y: startDock.position.y + APP_CONFIG.DOCK_VALUE_TO_TRAVERSE_WITH,
      },
    };

    let docks = this._cdState.dockData.docks;
    let canvas = this._cdState.canvas;

    for (let dock of docks) {
      //check if space is not present below.
      if (newDockCord.position.y + 2 * APP_CONFIG.NEW_DOCK_SEPARATION_GAP >= canvas.height) {
        let closestRightAlignedDock = this.getClosestRightAlignedDockToBg(newDockCord.position.x, newDockCord.width);
        //check if no dock is present on right side.
        if (closestRightAlignedDock.id === -1) {
          // newDockCord.position.y += dock.height;
          newDockCord.position.y =
            docks[docks.length - 1].position.y + dock.height + APP_CONFIG.NEW_DOCK_SEPARATION_GAP;
          return newDockCord;
        } else if (closestRightAlignedDock.id !== startDock.id) {
          return this.autoArrangeNewDockCord(closestRightAlignedDock);
        }
        break;
      } //end space check if

      if (this.checkIfDocksOverlap(dock, newDockCord)) {
        return this.autoArrangeNewDockCord(newDockCord);
      }
    }
    return newDockCord;
  }

  //finds new x and y cordinates.
  findXAndYAxisForNewDock() {
    let backgroundImage = this._cdState.frameData.frames[0];
    let bgWidth = backgroundImage.width;
    let xPos = backgroundImage.position.x;
    let newDockCord;
    let canvas = this._cdState.canvas;

    let closestRightAlignedDockToBg = JSON.parse(JSON.stringify(this.getClosestRightAlignedDockToBg(xPos, bgWidth)));
    closestRightAlignedDockToBg.position.y = 20;
    if (closestRightAlignedDockToBg.id === -1) {
      let boundry = this.getMinAndMaxBoundries();
      let gap = APP_CONFIG.NEW_DOCK_WIDTH + APP_CONFIG.NEW_DOCK_SEPARATION_GAP;
      if (boundry.maxX - (xPos + bgWidth) < gap) {
        canvas.width += gap;
      }
      newDockCord = {
        width: APP_CONFIG.NEW_DOCK_WIDTH,
        height: this._cdState.dockData.docks[0].height,
        position: {
          x: xPos + bgWidth + APP_CONFIG.NEW_DOCK_SEPARATION_GAP,
          y: APP_CONFIG.NEW_DOCK_INITIAL_LINE,
        },
      };
      closestRightAlignedDockToBg = newDockCord;
    }
    newDockCord = this.autoArrangeNewDockCord(closestRightAlignedDockToBg);
    let axis = { x: newDockCord.position.x, y: newDockCord.position.y };
    return axis;
  }

  addDockToLabel(state, labelId?) {
    let axis = this.findXAndYAxisForNewDock();
    const docks = this._cdState.dockData.docks;
    const tempDocks = JSON.parse(JSON.stringify(docks));
    tempDocks.sort((a, b) => {
      return a.position.y - b.position.y;
    });
    const length = tempDocks.length;
    const new_x_axis = axis.x;
    const new_y_axis = axis.y;
    // const new_y_axis = tempDocks[length - 1].position.y + this.labelHeight + 20;
    const maximumHeight = new_y_axis + docks[0].height + APP_CONFIG.NEW_DOCK_SEPARATION_GAP;

    if (
      maximumHeight > this._cdState.canvas.height
      // this._cdState.canvas.height + APP_CONFIG.HEADER_ELE_HEIGHT + APP_CONFIG.RULER_ELE + APP_CONFIG.APP_BORDER
    ) {
      this._cdState.canvas.height += docks[0].height + 2 * APP_CONFIG.NEW_DOCK_SEPARATION_GAP;
      console.log(this._cdState.canvas.height);
      // EZ.resize(this._cdState.canvas.width, this._cdState.canvas.height);
      this.updateIframeSize(this._cdState.canvas.width, this._cdState.canvas.height);
    }
    const newDockData = this.createNewDoc(new_x_axis, new_y_axis, labelId);
    if (this._cdState.activity.name === 'grouping') {
      newDockData.linkedLabel = [];
    }

    this.current_x_axis = new_x_axis;
    this.current_y_axis = new_y_axis;

    state.dockData.docks.push(newDockData);
    state.dockData.idCount = this.iteratorDock;
    // this.iteratorDock++;
  }

  markAsDistractor(index) {
    const state = this._cdState;
    state.labelData.labels[index].distractor = true;
    const docksToDelete = state.labelData.labels[index].dockedTo;
    if (Array.isArray(docksToDelete)) {
      for (const dockToDelete of docksToDelete) {
        this.deleteDock(state, dockToDelete);
      }
    } else {
      this.deleteDock(state, docksToDelete);
    }
    if (this._cdState.activity.name === 'grouping') {
      this.labelDeleted.next({ deleteLabel: true, labelId: state.labelData.labels[index].id });
    }
    state.labelData.labels[index].dockedTo = [];
    this.stateUpdated.next(true);
  }

  deleteLabelOrDistractor(index) {
    const state = this._cdState;
    const docks = state.dockData.docks;
    const docksToDelete = state.labelData.labels[index].dockedTo;
    this.adjustHeight(state);
    if (Array.isArray(docksToDelete)) {
      for (const dockToDelete of docksToDelete) {
        this.deleteDock(state, dockToDelete);
      }
    } else {
      this.deleteDock(state, docksToDelete);
    }
    if (this._cdState.activity.name === 'grouping') {
      this.labelDeleted.next({ deleteLabel: true, labelId: state.labelData.labels[index].id });
    }
    state.labelData.labels.splice(index, 1);
    let maxHeight = Math.max.apply(
      Math,
      state.labelData.labels.map((label) => label.height)
    );
    docks.forEach((dock) => {
      dock.height = maxHeight;
    });
  }

  deleteDock(state, index) {
    const docks = state.dockData.docks;
    let indexToDelete = 0;
    let match = false;
    let maxYcordinate = 0;
    if (this._cdState.activity.name !== 'grouping') {
      for (const dock of docks) {
        if (dock.id === index) {
          indexToDelete = docks.indexOf(dock);
          match = true;
          break;
        }
      }
      if (match) {
        const deletedDock = docks.splice(indexToDelete, 1)[0];
        for (let i = 0; i < this.leaderLineNodes.length;) {
          const node = this.leaderLineNodes[i];
          if (node.dockRef === deletedDock) {
            this.leaderLineNodes.splice(i, 1);
          } else {
            i++;
          }
        }
      }
      const bgData = state.frameData.frames[0];
      const bgPositionHeight = bgData.position.y + bgData.height;
      let maxYPos = Math.max.apply(
        Math,
        docks.map((dock) => dock.position.y)
      );
      if (
        state.canvas.height - (maxYPos + this.labelHeight) > this.labelHeight &&
        state.canvas.height - bgPositionHeight > this.labelHeight
      ) {
        let heightOfCanv = maxYPos + this.labelHeight + 20;
        const newHeight = heightOfCanv > this.eztoHeight ? heightOfCanv : this.eztoHeight;
        this.updateIframeSize(state.canvas.width, newHeight);
      }
    }
  }

  // updateDockCordinatesOnMouseMove(offset, index) {
  //   let state = this._cdState;
  //   let docks = state.dockData.docks;
  //   for (let dock of docks) {
  //     if (dock.id === parseInt(index)) {
  //       dock.position.x = offset.x;
  //       dock.position.y = offset.y;
  //     }
  //   }

  // }

  getMinAndMaxBoundries() {
    let svgCanavsArea = document.getElementById('svg-canvas');

    let minX = 20;
    let maxX = svgCanavsArea.clientWidth - 20;
    let minY = 20;
    let maxY = svgCanavsArea.clientHeight - 20;

    return { minX, maxX, minY, maxY };
  }

  getBoundries() {
    let leftBoundry = this._cdState.canvas.width;
    let rightBoundry = 0;
    let topBoundry = this._cdState.canvas.height;
    let bottomBoundry = 0;

    let frames = this._cdState.frameData.frames;
    let docks = this._cdState.dockData.docks;

    let boundryCheck = (item) => {
      // console.log("Test string:", leftBoundry, rightBoundry, topBoundry, bottomBoundry);
      // console.log("Test item:", item);
      if (item.position.x < leftBoundry) {
        leftBoundry = item.position.x;
      }
      if (item.position.x + item.width > rightBoundry) {
        rightBoundry = item.position.x + item.width;
      }
      if (item.position.y < topBoundry) {
        topBoundry = item.position.y;
      }
      if (item.position.y + item.height > bottomBoundry) {
        bottomBoundry = item.position.y + item.height;
      }
    };

    frames.forEach(boundryCheck);
    docks.forEach(boundryCheck);

    return { left: leftBoundry, right: rightBoundry, top: topBoundry, bottom: bottomBoundry };
  }

  getDockObjects(bgImageObj) {
    const topToBottom = [],
      leftToRight = [],
      nodesOnImage = [];
    this._cdState.dockData.docks.forEach((dock) => {
      topToBottom.push(dock);
      leftToRight.push(dock);
      let leaderLineHandler = (dot) => {
        if (
          dot.position.x < bgImageObj.position.x + bgImageObj.width + 20 &&
          dot.position.y < bgImageObj.position.y + bgImageObj.height + 20 &&
          dot.position.x > bgImageObj.position.x - 20 &&
          dot.position.y > bgImageObj.position.y - 20
        ) {
          nodesOnImage.push(dot);
        } else {
          topToBottom.push(dot);
          leftToRight.push(dot);
        }
        if (dot.branches) {
          dot.branches.forEach(leaderLineHandler);
        }
      };
      if (dock.leaderLine && dock.leaderLine.branches) {
        dock.leaderLine.branches.forEach(leaderLineHandler);
      }
    });
    this.sortByYPosition(topToBottom);
    this.sortByXPosition(leftToRight);
    return { topToBottom, leftToRight, nodesOnImage };
  }

  sortByXPosition(objs, leftToRight?) {
    objs.sort((a, b) => {
      return a.position.x < b.position.x ? -1 : a.position.x > b.position.x ? 1 : 0;
    });
    if (!leftToRight) {
      objs.reverse();
    }
  }

  sortByYPosition(objs, topToBottom?) {
    objs.sort((a, b) => {
      return a.position.y < b.position.y ? -1 : a.position.y > b.position.y ? 1 : 0;
    });
    if (!topToBottom) {
      objs.reverse();
    }
  }

  getDocksAndBGObjects(self) {
    const topToBottom = [],
      leftToRight = [];
    this._cdState.dockData.docks.forEach((dock) => {
      let isSelf = true;
      if (dock !== self) {
        isSelf = false;
        topToBottom.push(dock);
        leftToRight.push(dock);
      }
      let leaderLineHandler = (dot) => {
        dot.isSelf = isSelf ? true : false;
        topToBottom.push(dot);
        leftToRight.push(dot);
        if (dot.branches) {
          dot.branches.forEach(leaderLineHandler);
        }
      };
      if (dock.leaderLine && dock.leaderLine.branches) {
        dock.leaderLine.branches.forEach(leaderLineHandler);
      }
    });
    this._cdState.frameData.frames.forEach((frame) => {
      topToBottom.push(frame);
      leftToRight.push(frame);
    });
    this.sortByYPosition(topToBottom);
    this.sortByXPosition(leftToRight);
    return { topToBottom, leftToRight };
  }

  getBGObject() {
    return this._cdState.frameData.frames[0];
  }

  getDocksAndBg() {
    const docksAndBg = [];
    this._cdState.dockData.docks.forEach((dock) => docksAndBg.push(dock));
    docksAndBg.push(this._cdState.frameData.frames[0]);
    return docksAndBg;
  }

  updateSelectedObject(selection) {
    this.selectedObject = selection;
    if (
      this._cdState.dockData.docks.length > 2 ||
      selection.type === 'backgroundImage' ||
      selection.type === 'image' ||
      selection.type === 'leaderLineNode' ||
      selection.type === 'guideLine'
    ) {
      this.objectSelected = true;
    } else {
      this.objectSelected = false;
    }
    this.selectionUpdated.next(selection);
    // console.log('Selection updated!:', selection);
  }

  deselectObject() {
    this.objectSelected = false;
    this.selectedObject = { objRef: {}, type: '' };
    this.selectionUpdated.next(this.selectedObject);
  }

  updateDocksByCord(docks, changeInWidthAndHeight, imagePosition) {
    let changeInWidth = changeInWidthAndHeight.changeInWidth;
    let changeInHeight = changeInWidthAndHeight.changeInHeight;
    let xDocks = docks.xDocks;
    let yDocks = docks.yDocks;
    if (changeInWidth > 0) {
      for (let dock of xDocks) {
        if (dock.position.x - (imagePosition.x + imagePosition.width) <= APP_CONFIG.NEW_DOCK_SEPARATION_GAP) {
          dock.position.x += changeInWidth;
          if (dock.leaderLine) {
            dock.leaderLine.position.x += changeInWidth;
          }
        }
      }
    }
    if (changeInHeight > 0) {
      for (let dock of yDocks) {
        if (dock.position.y - (imagePosition.y + imagePosition.height) <= APP_CONFIG.NEW_DOCK_SEPARATION_GAP) {
          dock.position.y += changeInHeight;
          if (dock.leaderLine) {
            dock.leaderLine.position.y += changeInHeight;
          }
        }
      }
    }
  }

  getDocksToMoveOnImageShift(imageWidth, imageHeight) {
    let xDocks = [];
    let yDocks = [];
    let docks = this._cdState.dockData.docks ? this._cdState.dockData.docks : [];
    let backgroundImage = this._cdState.frameData.frames[0] ? this._cdState.frameData.frames[0] : {};
    let bgX = backgroundImage.position.x;
    let bgY = backgroundImage.position.y;
    let bgWidth = imageWidth;
    let bgHeight = imageHeight;

    for (let dock of docks) {
      let dockX = dock.position.x;
      let dockY = dock.position.y;
      let dockYWithHeight = dockY + dock.height + APP_CONFIG.NEW_DOCK_SEPARATION_GAP;

      if (bgY <= dockYWithHeight && dockYWithHeight <= bgY + bgHeight && bgX <= dockX) {
        xDocks.push(dock);
      }
      if (bgX <= dockX && dockX <= bgX + bgWidth && bgY <= dockY) {
        yDocks.push(dock);
      }
    }
    return { xDocks, yDocks };
  }

  updateImageObject(selectedObject) {
    let media = {
      mediaId: '',
      altText: '',
      description: '',
      position: { x: 0, y: 0 }, // this will be relative to the frame top left corner.
      width: 0,
      height: 0,
    };
    selectedObject.group.image.width = APP_CONFIG.DEFAULT_IMAGE_WIDTH_GROUPING;
    selectedObject.group.image.height = APP_CONFIG.DEFAULT_IMAGE_HEIGHT_GROUPING;
    if (!selectedObject.group) {
      selectedObject.media = media;
      selectedObject.isImageAdded = false;
    } else {
      selectedObject.group.media = media;
      selectedObject.group.isImageAdded = false;
    }
  }

  deleteLeaderLineNode(selectedObject) {
    let index = this.leaderLineNodes.indexOf(selectedObject);
    const deletedNode = this.leaderLineNodes.splice(index, 1)[0];
    if (deletedNode.nodeRef.branches && deletedNode.nodeRef.branches.length) {
      for (let i = 0; i < deletedNode.nodeRef.branches.length; i++) {
        const node = deletedNode.nodeRef.branches[i];
        const nodeDetails = this.leaderLineNodes.filter((item) => item.nodeRef === node)[0];
        this.deleteLeaderLineNode(nodeDetails);
      }
    }
  }

  deleteAllLeaderLines() {
    let docks = this._cdState.dockData.docks;
    for (let dock of docks) {
      if (dock.leaderLine) {
        delete dock.leaderLine;
      }
    }
    this.setLeaderLineNodes();
    this.leaderLineNodeUpdated.next(true);
  }

  getMagnifySettingWithoutRef() {
    return JSON.parse(JSON.stringify(this._cdState.magnifySettings));
  }

  deleteLeaderLineFromState(selectedObject) {
    const nodeParent = selectedObject.parent;
    const index = nodeParent.branches.indexOf(selectedObject.nodeRef);
    nodeParent.branches.splice(index, 1);
  }

  checkNodeOverlapsADock(node) {
    let result = false,
      overLapedDock;
    for (let i = 0; i < this._cdState.dockData.docks.length; i++) {
      const dock = this._cdState.dockData.docks[i];
      // x y pos after considering 20px gap.
      const x1 = dock.position.x - 20;
      const x2 = dock.position.x + dock.width + 20;
      const y1 = dock.position.y - 20;
      const y2 = dock.position.y + this.labelHeight + 20;
      const x = node.x;
      const y = node.y;
      if (x > x1 && x < x2 && y > y1 && y < y2) {
        result = true;
      }
      if (result) {
        overLapedDock = dock;
        break;
      }
    }
    return { isOverlap: result, overLapedDock };
  }

  public drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    console.log(event.container.data);
    console.log(event.previousContainer.data);
  }
  updateIframeSize(width: number, height: number) {
    // const appBorder = 2;
    // const headerElHeight = 45;
    // const rulerEl = 27;
    // const toolElWidth = 360;
    this._cdState.canvas.width = width;
    this._cdState.canvas.height = height;
    let iFrameWidth;
    let iFrameHeight;
    switch (EZ.mode) {
      case 'design':
        iFrameWidth =
          this._cdState.canvas.width + APP_CONFIG.TOOL_ELE_WIDTH + APP_CONFIG.RULER_ELE + APP_CONFIG.APP_BORDER;
        iFrameHeight =
          this._cdState.canvas.height + APP_CONFIG.HEADER_ELE_HEIGHT + APP_CONFIG.RULER_ELE + APP_CONFIG.APP_BORDER;
        break;

      case 'preview':
      case 'sample':
      case 'review':
      case 'test':
        iFrameWidth = width;
        iFrameHeight = height + APP_CONFIG.HEADER_ELE_HEIGHT_TEST + APP_CONFIG.SKIP_LINK_HEIGHT;
        break;

      // case 'sample':
      //   iFrameWidth = width;
      //   iFrameHeight = height;

      // case 'review':
      //   iFrameWidth = width;
      //   iFrameHeight = height;

      default:
        break;
    }

    EZ.resize(iFrameWidth, iFrameHeight);
  }

  checkForMaxBoundryHeight() {
    let mainDivContainer = document.getElementById('js-groupActivityContainer')?.offsetHeight;
    let canvasHeight = this._cdState.canvas.height;

    if (mainDivContainer > canvasHeight) {
      let difference = mainDivContainer - canvasHeight;
      this._cdState.canvas.height = canvasHeight + difference;
    }

    if (mainDivContainer < canvasHeight) {
      if ((EZ.mode === 'test' || EZ.mode === 'preview') && mainDivContainer > 650) {
        this._cdState.canvas.height = canvasHeight - 1;
        this.checkForMaxBoundryHeight();
      } else {
        if (canvasHeight > this.eztoHeight) {
          this._cdState.canvas.height = canvasHeight - 1;
          this.checkForMaxBoundryHeight();
        }
      }
    }
    this.updateIframeSize(this._cdState.canvas.width, this._cdState.canvas.height);
    this.stateUpdated.next(true);
  }

  /**
   * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
   * marginWidth and marginHeight being calculated here are in percentage.
   * @return {Object} { width, height }
   */
  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    let marginWidth = (APP_CONFIG.IMAGE_GROUPING_MARGIN * srcWidth) / 100; // x% of scrWidth
    let marginHeight = (APP_CONFIG.IMAGE_GROUPING_MARGIN * srcHeight) / 100; // y% of srcHeight
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio - marginWidth, height: srcHeight * ratio - marginHeight };
  }

  getUpdatedImageSize(imgWidth, imgHeight, frameWidth, frameHeight) {
    const imageAspectRatio = imgWidth / imgHeight;
    const frameAspectRatio = frameWidth / frameHeight;
    let uWidth, uHeight;

    if (frameWidth > frameHeight) {
      if (imageAspectRatio > frameAspectRatio) {
        uWidth = frameWidth;
        uHeight = frameWidth * (1 / imageAspectRatio);
      } else {
        uHeight = frameHeight;
        uWidth = frameHeight * imageAspectRatio;
      }
    } else {
      if (imageAspectRatio > frameAspectRatio) {
        uWidth = frameWidth;
        uHeight = frameWidth * (1 / imageAspectRatio);
      } else {
        uHeight = frameHeight;
        uWidth = frameHeight * imageAspectRatio;
      }
    }
    return { width: uWidth, height: uHeight };
  }

  adjustHeight(state) {
    let heightOfCanvas = state.canvas.height;
    const length = state.dockData.docks.length;
    const lastyPosOfDoc = state.dockData.docks[length - 1];
    if (heightOfCanvas > lastyPosOfDoc + this.labelHeight) {
      const diff = heightOfCanvas - lastyPosOfDoc + this.labelHeight;
      heightOfCanvas += diff;
    }
    this.updateIframeSize(state.canvas.width, heightOfCanvas);
  }

  clearGuides() {
    this._cdState.canvas.guide.vGuide = [];
    this._cdState.canvas.guide.hGuide = [];
  }

  updateMagnifySize(width: number, height: number) {
    this._cdState.magnifySettings.width = width;
    this._cdState.magnifySettings.height = height;
  }

  setMagnifyScale(scale) {
    this._cdState.magnifySettings.scale = scale;
  }

  getElementClientPosition(pos: any, w: number, h: number) {
    return {
      top: pos.y,
      left: pos.x,
      right: pos.x + w,
      bottom: pos.y + h,
    };
  }

  // To get all docks position
  getDockPosition(docks: any) {
    const docksPos = [];
    docks.forEach((item) => {
      const dock = this.getElementClientPosition(item.position, item.width, item.height);
      const leader = this.getLeaderLinePosition(item);
      if (dock) {
        docksPos.push(dock);
      }
      if (leader.length > 0) {
        docksPos.push(...leader);
      }
    });
    return [...docksPos];
  }

  // To get all background image position
  getFrameImagePosition(images: any) {
    const imagePos = [];
    images.forEach((item) => {
      const image = this.getElementClientPosition(item.position, item.width, item.height);
      if (image) {
        imagePos.push(image);
      }
    });
    return imagePos;
  }

  // To get all leaderLine position which attached to the dock
  getLeaderLinePosition(dock: any) {
    const leaderLinePos = [];

    let getAllPosition = (arr, key) => {
      arr.forEach((item) => {
        for (let keys in item) {
          if (keys === key) {
            // since leader line using circle svg element i.e we are passing with and height as 12
            const pos = this.getElementClientPosition(item.position, 12, 12);
            leaderLinePos.push(pos);
          } else if (Array.isArray(item[keys])) {
            getAllPosition(item[keys], key);
          }
        }
      });
    };
    if (dock.leaderLine && dock.leaderLine.branches) {
      getAllPosition(dock.leaderLine.branches, 'position');
    }

    return leaderLinePos;
  }

  // To check weather all the svg node elements are in the viewport of svg
  checkIsElementInViewport(width, height) {
    const currentActivity = this._cdState.activity.name;
    if (currentActivity === 'labeling') {
      return this.labelActivityViewport(width, height);
    } else if (currentActivity === 'grouping') {
      return this.groupActivityViewport(width, height);
    }
  }

  groupActivityViewport(width, height) {
    const groupContainer = document.getElementById('js-groupActivityContainer');
    const isInViewport = [];
    if (groupContainer) {
      const element = {
        right: parseInt(groupContainer.getBoundingClientRect().width.toString()),
        bottom: parseInt(groupContainer.getBoundingClientRect().height.toString()),
      };
      const inViewport = this.isInViewport(element, width, height);
      if (!inViewport.height) {
        isInViewport.push({ height: false });
        return isInViewport[0];
      }
      return true;
    }
  }

  labelActivityViewport(width, height) {
    const docks = this.getDockPosition(this._cdState.dockData.docks);
    const stageImage = this.getFrameImagePosition(this._cdState.frameData.frames);
    const elPos = [...docks, ...stageImage];
    const isInViewport = [];
    for (let i = 0; i < elPos.length; i++) {
      const inViewport = this.isInViewport(elPos[i], width, height);
      if (!inViewport.width || !inViewport.height) {
        isInViewport.push(inViewport);
        return isInViewport[0];
      }
    }
    return true;
  }

  isInViewport(element, width?, height?) {
    const svgWidth = width - 244;
    const svgHeight = height;
    return { width: element.right <= svgWidth, height: element.bottom <= svgHeight };
  }

  removeAllguides() {
    let margins = document.getElementsByClassName('ruler-guide');
    for (let margin of Array.from(margins)) {
      margin.remove();
    }
    this._cdState.canvas.guide.hGuide.length = 0;
    this._cdState.canvas.guide.vGuide.length = 0;
  }

  stripHtmlTags(content) {
    const element = document.createElement('div');
    element.innerHTML = content;
    return element.innerText;
  }

  updateTinyMcePlaceHolder(activeEditor, text?: string) {
    const editor = activeEditor.richTextEditorComponent.editor.getBody();
    if (editor) {
      if (text) {
        editor.setAttribute('placeholder', text);
      } else {
        editor.removeAttribute('placeholder');
      }
    }
  }
  updatedImageList() {
    let imageList = [];
    this.mediaService.mediaList.forEach((media) => {
      if (media.type === 'image') {
        imageList.push(media);
      }
    });
    return imageList;
  }

  getListOfMediaUsed(state) {
    const usedMedia = [];
    if (state.frameData.frames[0].media.mediaId) {
      usedMedia.push(state.frameData.frames[0].media.mediaId);
    }
    for (const label of state.labelData.labels) {
      if (label.image.mediaId) {
        usedMedia.push(label.image.mediaId);
      }
      if (label.audio.mediaId) {
        usedMedia.push(label.audio.mediaId);
      }
    }
    for (const dock of state.dockData.docks) {
      if (dock.media.mediaId) {
        usedMedia.push(dock.media.mediaId);
      }
    }
    return usedMedia;
  }

  updateMediaConsumption() {
    try {
      const listOfMediaUsed = this.getListOfMediaUsed(this._cdState);
      this.mediaService.updateMediaConsumption(listOfMediaUsed);
    } catch (e) {
      console.log("Error while updating asset consumption.", e);
    }
  }

  // set image short and long Description
  setImageAltText(originalSource: any, stateSource: any, altType: 'altText' | 'description') {
    const isEditedDescription =
      originalSource[altType] !== stateSource[altType] && stateSource[altType] !== '' ? true : false;
    let altText = originalSource[altType];

    if (isEditedDescription) {
      altText = stateSource[altType];
    }
    return altText;
  }
}
