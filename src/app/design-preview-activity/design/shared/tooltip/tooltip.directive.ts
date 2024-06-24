import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Subject } from 'rxjs';

import { TooltipPlacement } from './placement';
import { TooltipComponent } from './tooltip.component';

let nextId = 0;

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();
  private tooltipWindowId = `mhe-tooltip-${nextId++}`;
  private overlayRef: OverlayRef;
  private tooltipRef: ComponentRef<TooltipComponent> | null;
  private boundKeyDownFunc = this.onKeyDown.bind(this);
  private tooltipMessage: string;
  private isTap = false;
  private observer: MutationObserver;

  @Input() mheTooltip = '';
  @Input() placement: TooltipPlacement = 'top';
  @Input() disableDefaultActions = false;
  @Input() disableTooltip = false;
  @Input() panelClass = '';
  @Input() alternateAriaLabel = '';

  @Output() shown = new EventEmitter();
  @Output() hidden = new EventEmitter();
  @Output() toggleShown = new EventEmitter<string>();

  @HostListener('touchstart') onTouch() {
    this.isTap = true;
  }

  @HostListener('touchend')
  @HostListener('touchcancel')
  onTouchEnd() {
    this.isTap = false;
  }

  @HostListener('focusin') onFocus() {
    this.toggle();
  }

  @HostListener('focusout') onBlur() {
    this.close();
  }

  @HostListener('mouseenter', ['$event.target']) onMouseover(target: any) {
    if (target && target.disabled) {
      return;
    }
    this.open();
  }

  @HostListener('mouseleave') onmouseout() {
    this.close();
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private renderer: Renderer2
  ) {
    this.observer = this.createDisabledMutationObserver();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.onPlacementChange(changes.placement);
    this.onMessageChange(changes.mheTooltip);
    this.setAriaLabel();
  }

  ngOnDestroy() {
    this.close();
    this.observer.disconnect();

    this.destroy$.next();
    this.destroy$.complete();
  }

  close() {
    if (this.tooltipRef) {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
      this.tooltipRef.destroy();
      this.overlayRef.dispose();
      this.tooltipRef = null;
      window.removeEventListener('keydown', this.boundKeyDownFunc);
      this.hidden.emit('TooltipDirective');
    }
  }

  isOpen(): boolean {
    return this.tooltipRef != null;
  }

  open() {
    if (this.isOpen() || this.disableTooltip || this.mheTooltip.length === 0 || this.isTap) {
      return;
    }

    this.createTooltip();

    window.addEventListener('keydown', this.boundKeyDownFunc);
    this.shown.emit('TooltipDirective');
    this.toggleShown.emit('TooltipDirective');
  }

  toggle() {
    if (this.tooltipRef) {
      this.close();
    } else {
      this.open();
    }
  }

  private createTooltip() {
    const overlayConfig = this.getOverlayConfig();
    this.overlayRef = this.overlay.create(overlayConfig);

    const containerPortal = new ComponentPortal(TooltipComponent);
    const componentRef = this.overlayRef.attach(containerPortal);

    const hostEl = this.elementRef;
    const tooltipEl = componentRef.instance.el;

    componentRef.instance.id = this.tooltipWindowId;
    componentRef.instance.placement = this.placement;
    componentRef.instance.close = () => {
      this.close();
    };
    componentRef.instance.afterViewInit.subscribe(() => {
      this.updatePositionStrategy(this.placement, hostEl, tooltipEl);
    });

    this.setTooltipMessage(componentRef, this.mheTooltip);

    this.updatePositionStrategy(this.placement, hostEl, tooltipEl);

    this.tooltipRef = componentRef;

    this.tooltipRef.hostView.detectChanges();
  }

  getOverlayConfig(): OverlayConfig {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: this.panelClass,
    });

    return overlayConfig;
  }

  updatePositionStrategy(placement: TooltipPlacement, hostEl: ElementRef, tooltipEl: ElementRef) {
    const position = this.getPosition(placement, hostEl, tooltipEl);
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([position])
      .withPush(false);

    this.overlayRef.updatePositionStrategy(positionStrategy);
  }

  private getPosition(
    placement: TooltipPlacement,
    hostEl: ElementRef,
    tooltipEl: ElementRef
  ): ConnectedPosition {
    const offset = 5;

    switch (placement) {
      case 'left':
        return {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -offset,
        };

      case 'right':
        return {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: offset,
        };

      case 'bottom':
        return {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: offset,
        };

      case 'top':
      default:
        return {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -offset,
        };
    }
  }

  private onPlacementChange(change: SimpleChange) {
    if (this.tooltipRef && change) {
      this.tooltipRef.instance.placement = change.currentValue;
    }
  }

  private onMessageChange(change: SimpleChange) {
    if (this.tooltipRef && change) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.setTooltipMessage(this.tooltipRef, change.currentValue);
    }
  }

  private setTooltipMessage(
    componentRef: ComponentRef<TooltipComponent>,
    message: string | TemplateRef<any>
  ) {
    if (!componentRef) {
      return;
    }

    componentRef.instance.tooltipMessage = this.mheTooltip;
    this.tooltipMessage = this.mheTooltip;
  }

  /**
   * This is a workaround for FF to close tooltip when host button is programmatically disabled
   *  because `blur` event is not fired when element is disabled
   * Read more here: https://bugzilla.mozilla.org/show_bug.cgi?id=559561
   */
  private createDisabledMutationObserver(): MutationObserver {
    const observer = new MutationObserver((list) => {
      for (const record of list) {
        const target: any = record?.target;
        if (target?.disabled !== undefined) {
          const disabled = Boolean(target?.disabled);
          this.onDisabledChange(disabled);
        }
      }
    });

    observer.observe(this.elementRef.nativeElement, { attributeFilter: ['disabled'] });

    return observer;
  }

  private onDisabledChange(disabled: boolean) {
    if (disabled) {
      this.close();
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    if (!this.disableDefaultActions && event.key === 'Escape') {
      this.close();
    }
  }

  private setAriaLabel() {
    let element: HTMLElement | Element | null;

    if (this.elementRef.nativeElement.tagName.toLowerCase() === 'mhe-button') {
      element = this.elementRef.nativeElement.firstElementChild;
    } else {
      element = this.elementRef.nativeElement;
    }

    this.renderer.setAttribute(element, 'aria-label', this.alternateAriaLabel || this.mheTooltip);
  }
}

