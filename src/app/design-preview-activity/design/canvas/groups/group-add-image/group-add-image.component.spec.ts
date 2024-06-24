import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { GroupAddImageComponent } from './group-add-image.component';

const media = [
  {
    mediaId: '',
    type: '',
    title: '',
    path: '',
    altText: '',
    description: '',
    thumbnail: '',
    caption: '',
    transcript: '',
    icon: '',
    isItemMedia: false,
  },
];
const label = [
  {
    id: 1,
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
      position: { x: 0, y: 0 },
      width: 120,
      height: 120,
    },
    audio: {
      mediaId: '',
      altText: '',
      description: '',
      position: { x: 0, y: 0 },
      width: 50,
      height: 20,
    },
    distractor: false,
    dockedTo: 1,
    height: 60,
    width: 150,
  },
];
const dock = [
  {
    id: 1,
    linkedLabel: 1, // this can be array depenging on the activity type.
    position: { x: 440, y: 20 }, // this will be relative to canvas top left corner.
    width: 150,
    height: 60,
    hasError: false,
    media: {
      mediaId: '',
      altText: '',
      description: '',
      position: { x: 0, y: 0 },
      width: 180,
      height: 220,
    },
    headerText: '',
    image: {
      width: 180,
      height: 220,
    },
  },
];
const labelData = {
  labels: label,
  width: 150,
  height: 60,
  totalLabels: 2,
  idCount: 2,
  shuffleForStudent: true,
};
const dockData = {
  sizeSameAsLabels: null,
  docks: dock,
  idCount: 2,
};
let group,cdState, modalService, mediaService, cdStateService;
function initDependencies() {
  cdState = {
    _cdState: {
      labelData,
      dockData,
    },
  };
  group={
    hasError: false,
    headerText: "",
    height: 60,
    id: 1,
    image: {width: 180, height: 220},
    linkedLabel: [],
    media: {mediaId: '', altText: '', description: '', position: {x: 404, y: 20}, width: 180,},
    position: {x: 404, y: 20},
    width: 150
  }
  cdStateService = {
    _cdState: cdState._cdState,
    getState: () => {
      return cdState._cdState;
    },
  };
  modalService = {
    showAddLabelModal: () => {
      return;
    },
    addMediaPopup: () => {
      return;
    },
    popupModalRef: {
      componentRef: {
        instance: {
          onClose: () => {
            return;
          },
        },
      },
    },
  };
  mediaService = {
    getMediaLongDescription: (mediaId) => {
      return '';
    },
    getMediaShortDescription: (mediaId) => {
      return '';
    },
    getMediaDetails: (mediaId) => {
      return media;
    },
    addMedia: (mediaId) => {
      return media;
    },
  };
}

describe('GroupAddImageComponent', () => {
  let component: GroupAddImageComponent;
  let fixture: ComponentFixture<GroupAddImageComponent>;

  beforeEach(async(async () => {
    initDependencies();
    await TestBed.configureTestingModule({
      declarations: [GroupAddImageComponent],
      providers: [
        { provide: CdStateService, useValue: cdStateService },
        { provide: ModalService, useValue: modalService },
        { provide: MediaService, useValue: mediaService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAddImageComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
    component.index=0;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should test ngOninit function',()=>{
  //   component.ngOnInit();
  // });

  // it('should update the selection',()=>{
  //   cdStateService.selectionUpdated
  // })

});
