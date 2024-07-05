/* eslint-disable @angular-eslint/no-output-native */
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TemplateUuids } from '@mhe/ngx-shared/utils';
import { Subject, asyncScheduler, fromEvent } from 'rxjs';
import { subscribeOn, takeUntil, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

const KEYCODES = {
  ESC_KEY: 27,
  TAB_KEY: 9,
};

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnDestroy {
  @Input('isOpen')
  set isOpen(value: boolean) {
    if (value) {
      this.showModal();
    } else {
      this.hideModal();
    }
  }
  get isOpen() {
    return this._isOpen;
  }

  @Input()
  focusElementOnClose: ElementRef;
  @Input()
  focusElementOnOverlayClick: ElementRef;
  @Input()
  focusOnConfirm = false;
  @Input()
  showTitlebar = true;
  @Input()
  showFooter = true;
  @Input()
  contentText: string;
  @Input()
  titleText: string;
  @Input()
  cancelButtonText = 'Cancel';
  @Input()
  confirmButtonText = 'Confirm';
  @Input()
  disableCancel = false;
  @Input()
  disableConfirm = false;
  @Input()
  disableClose = false;
  @Input()
  disableEscape = false;
  @Input()
  footerMessage: string;
  @Input() panelClass = '';
  // Override for default margin-top of 30px.
  @Input()
  marginTop: string | null;

  @Input('description')
  set description(value: string | TemplateRef<any>) {
    if (value instanceof TemplateRef) {
      this.descriptionTemplateRef = value;
    }

    if (typeof value === 'string') {
      this.descriptionText = value;
    }

    this._description = value;
  }
  get description() {
    return this._description;
  }

  @Output()
  close = new EventEmitter();

  @Output()
  confirm = new EventEmitter();

  @Output()
  cancel = new EventEmitter();

  @Output()
  open = new EventEmitter();

  @Output()
  overlayClick = new EventEmitter();

  @ViewChild('cancelButton') cancelButton: ElementRef;
  @ViewChild('confirmButton') confirmButton: ElementRef;

  private _destroy$ = new Subject<void>();
  destroy$ = this._destroy$.asObservable();
  private _isOpen: boolean;
  private _description: string | TemplateRef<any>;
  private _doc: Document;

  descriptionText: string;
  descriptionTemplateRef: TemplateRef<any>;

  templateUUIDs = new TemplateUuids();

  // variables for attaching template to portal
  @ViewChild('modalTemplatePortal', { static: true })
  modalTemplatePortal: EmbeddedViewRef<any>;
  overlayRef: OverlayRef;
  focusTrap: FocusTrap;

  @HostListener('document:keydown', ['$event'])
  keydownEvent(event: KeyboardEvent) {
    this.keydown(event);
  }

  constructor(
    private overlay: Overlay,
    private focusTrapFactory: FocusTrapFactory,
    private translate: TranslateService,
    @Inject(DOCUMENT) doc: any
  ) {
    this._doc = doc;
  }

  ngOnInit() {
    this.translate.get(this.confirmButtonText).subscribe((res) => {
      this.confirmButtonText = res;
    });
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.focusTrap.destroy();
    }
    this._destroy$.next();
    this._destroy$.unsubscribe();
  }

  createModal() {
    let positionStrategy = this.overlay.position().global().centerHorizontally();

    if (this.marginTop) {
      positionStrategy = positionStrategy.top(this.marginTop);
    }

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'mhe-overlay-dark-backdrop',
      panelClass: this.panelClass,
    });
  }

  showModal() {
    if (!this.overlayRef) {
      this.createModal();
    }

    if (this.modalTemplatePortal) {
      this.overlayRef.attach(this.modalTemplatePortal);

      // create a focus trap using the factory
      const modalEl = this.overlayRef.hostElement.querySelector('.modal-dialog') as HTMLElement;
      this.focusTrap = this.focusTrapFactory.create(modalEl);
    }

    fromEvent(this._doc, 'click')
      .pipe(
        tap((event) => {
          const modalContent = this.overlayRef && this.overlayRef.hostElement.querySelector('.modal-content');
          const internalClick = modalContent?.contains(event.target as HTMLElement);
          if (!modalContent || internalClick === true || internalClick === undefined) {
            return;
          }
          this.onOverlayClick(event);
        }),
        subscribeOn(asyncScheduler),
        takeUntil(this.overlayRef.detachments())
      )
      .subscribe();
  }

  hideModal() {
    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
      this.focusTrap.destroy();
    }

    if (this.focusElementOnClose) {
      this.focusElementOnClose.nativeElement.focus();
    }
  }

  onCancel() {
    this.cancel.emit(this);
  }

  onConfirm() {
    this.confirm.emit(this);
  }

  onOverlayClick(event: any) {
    if (this.focusElementOnOverlayClick) {
      this.focusElementOnOverlayClick.nativeElement.focus();
    }

    this.overlayClick.emit(this);
  }

  onClose() {
    this.close.emit(this);
  }

  private keydown(event: KeyboardEvent): void {
    if (event.keyCode === KEYCODES.ESC_KEY && !this.disableEscape) {
      this.onCancel();
    }
  }

  isValidFooterMessage(footerMessage: string) {
    return typeof footerMessage === 'string' && footerMessage.length > 0;
  }

  getModalDescriptionUUID() {
    return this.templateUUIDs.get(this._description ? 'dialog-description' : 'dialog-content');
  }
}