import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MagnifyPreviewComponent } from './magnify-preview.component';

describe('MagnifyPreviewComponent', () => {
  let component: MagnifyPreviewComponent;
  let fixture: ComponentFixture<MagnifyPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MagnifyPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MagnifyPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
