import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { GroupTextAreaComponent } from './group-text-area.component';

import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';

declare var EZ;

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
let cdState, cdStateService, modalService;
function initDependencies() {
  cdState = {
    _cdState: {
      labelData,
      dockData,
    },
  };
  cdStateService = {
    _cdState: cdState._cdState,
    getState: () => {
      return cdState._cdState;
    },
    editorInFocus: cdState.editorInFocus,
    updateTinyMcePlaceHolder: () => {
      return;
    },
    stripHtmlTags: () => {
      return '';
    },
  };
}
describe('GroupTextAreaComponent', () => {
  let component: GroupTextAreaComponent;
  let fixture: ComponentFixture<GroupTextAreaComponent>;

  beforeEach(async () => {
    initDependencies();
    await TestBed.configureTestingModule({
      declarations: [GroupTextAreaComponent],
      providers: [
        { provide: CdStateService, useValue: cdStateService },
        { provide: ModalService, useValue: modalService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.index = 0;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test validateLabelReqError function', () => {
    component.validateLabelReqError('hello');
    expect(component.groupLabelText).toBe('hello');
  });
});
