/* eslint-disable @typescript-eslint/no-empty-function */
import { animate, AnimationEvent, keyframes, state, style, transition, trigger } from '@angular/animations';
import {
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
} from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ButtonPurpose } from '@mhe/ngx-shared/button';
import { MheOption } from '@mhe/ngx-shared/shared';
import { TranslateService } from '@mhe/ngx-shared/translate';
import {
  HTMLElementEvent,
  TemplateUuids,
  getFocusableElements,
  getOffsetTop,
  isElementFocusable,
  provideValueAccessor,
} from '@mhe/ngx-shared/utils';
import { differenceWith, isEqual, uniqBy } from 'lodash-es';
import { Subject, asyncScheduler, fromEvent, merge } from 'rxjs';
import { subscribeOn, takeUntil, tap } from 'rxjs/operators';
import { DropdownOption } from './dropdown-option';

// const DEFAULT_BUTTON_WIDTH = 100;
const DEFAULT_MENU_WIDTH = 250;
const MAX_DROPDOWN_HEIGHT = 250;
const DROPDOWN_SELECTED_STATE_TIME = 250;

@Component({
  providers: [provideValueAccessor(DropdownComponent)],
  selector: 'app-dropdown',
  templateUrl: 'dropdown.component.html',
  styleUrls: ['dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('optionSelection', [
      state(
        'selected',
        style({
          backgroundColor: '#e0e7e9',
        })
      ),
      transition('* => selected', [
        animate(
          `${DROPDOWN_SELECTED_STATE_TIME}ms`,
          keyframes([
            style({ backgroundColor: 'white', offset: 0 }),
            style({ backgroundColor: '#e0e7e9', offset: 1.0 }),
          ])
        ),
      ]),
    ]),
    trigger('hideDropdown', [
      state('dropdownHidden', style({ opacity: 0 })),
      transition('* => dropdownHidden', animate(`${DROPDOWN_SELECTED_STATE_TIME}ms`)),
    ]),
  ],
})
export class DropdownComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @Input() minWidth = 0;
  @Input() maxWidth = 250;
  @Input() splitActionText: string | null = null;
  @Input() disabled = false;
  @Input() image: string;
  @Input() optionPosition: 'left' | 'right' = 'left';
  @Input() toggleButtonAriaLabel = '';
  @Input() listboxLabel?: string;
  @Input() selected?: DropdownOption[] | MheOption[];
  @Input() isMenu?: boolean;
  @Input() icon = '';
  @Input() multiple = false;
  @Input() filterable = false;
  @Input() syncWidths = false;
  @Input() buttonWidth: number;
  @Input() searchable = false;
  @Input() selectAll = true;
  @Input() selectAllText = 'Select all';
  @Input() placeholder = 'Select';
  @Input() panelClass = '';
  @Input() closeOnBlur = false;

  /** Flattened list of all options */
  _flatOptions: DropdownOption[] | MheOption[] = [];
  /** Filtered list of options to display */
  _filteredOptions: DropdownOption[] | MheOption[] = [];
  /** Tracks which options are nested */
  _isChild: boolean[];
  /** Search term for filtering options */
  _searchTerm = '';

  @Input()
  get options(): DropdownOption[] | MheOption[] {
    return this._filteredOptions;
  }
  set options(options: DropdownOption[] | MheOption[]) {
    this._isChild = [];

    this._flatOptions = (options ?? []).reduce<DropdownOption[] | MheOption[]>((acc, cur) => {
      this._isChild.push(false);

      const children = cur.children ?? [];
      for (const _c of children) {
        this._isChild.push(true);
      }

      return [...acc, cur, ...children];
    }, []);

    this._filteredOptions = this.filterOptions(this._searchTerm);

    this.checkSelectAll();
  }

  // value
  @Input()
  get value() {
    return this.selected ?? [];
  }
  set value(value: MheOption[]) {
    this.selected = value;
  }

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Output() searchTerm: EventEmitter<string> = new EventEmitter();
  @Output() scrollBottomReached: EventEmitter<any> = new EventEmitter();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() splitActionClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('controlButton') controlButton: ElementRef;
  @ViewChild('splitActionButton') splitActionButton: ElementRef;
  @ViewChild('toggleButtonWithIcon') toggleButtonWithIcon: ElementRef;
  @ViewChild('dropdownMenuPortal', { static: true }) dropdownMenuPortal: EmbeddedViewRef<any>;

  private readonly doc: Document;
  private readonly destroy$ = new Subject<void>();

  // expose import to template
  _buttonPurpose = ButtonPurpose;

  allSelected = false;
  focusedOption: any = null;
  isExpanded = false;
  listItems: Element[];
  overlayRef: OverlayRef;
  searchIsFocused = false;
  selectedSuffix: string | undefined = 'selected';
  templateUuids = new TemplateUuids();
  triggerHideDropdown = false;
  triggerOptionSelectionAnimation = false;

  /** miscl. getters */
  get currentSelection(): string {
    return this.getDropdownDisplay(this.selected, this.placeholder);
  }

  // TODO: this smells like an anti-pattern
  get buttonId(): string {
    return this.templateUuids.get('buttonId');
  }

  get hasIcon() {
    return this.icon !== '';
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private overlay: Overlay,
    @Inject(DOCUMENT) _doc: Document
  ) {
    this.doc = _doc;
  }

  ngOnInit() {
    this.translateService.translate('ngx-shared-selected').subscribe((value) => {
      this.selectedSuffix = value;
    });
  }

  ngOnDestroy() {
    this.hideDropdown(true);
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.options) {
      const options: DropdownOption[] | MheOption[] = changes.options.currentValue ?? [];

      if (uniqBy(options, 'value').length !== options.length) {
        throw new Error('options must have unique values');
      }
    }

    if (changes.selected) {
      const selected: DropdownOption[] | MheOption[] = changes.selected.currentValue ?? [];

      if (!this.multiple && selected.length > 1) {
        throw new Error('selected must contain only one element unless multiple is true');
      }

      this.checkSelectAll();
    }
  }

  createDropdownPortal(shouldReverse: boolean) {
    const optionPosition = this.splitActionText ? 'right' : this.optionPosition;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.getPositionStrategy(optionPosition, shouldReverse),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: this.width(),
      panelClass: this.panelClass,
    });
  }

  getPositionStrategy(optionPosition: 'left' | 'right', shouldReverse: boolean) {
    let originPos: OriginConnectionPosition = { originX: 'center', originY: 'bottom' };
    let overlayPos: OverlayConnectionPosition = { overlayX: 'center', overlayY: 'top' };

    if (optionPosition === 'left') {
      originPos = {
        originX: 'start',
        originY: shouldReverse ? 'top' : 'bottom',
      };
      overlayPos = {
        overlayX: 'start',
        overlayY: shouldReverse ? 'bottom' : 'top',
      };
    } else if (optionPosition === 'right') {
      originPos = {
        originX: 'end',
        originY: shouldReverse ? 'top' : 'bottom',
      };
      overlayPos = {
        overlayX: 'end',
        overlayY: shouldReverse ? 'bottom' : 'top',
      };
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.controlButton || this.splitActionButton || this.toggleButtonWithIcon)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withPositions([{ ...originPos, ...overlayPos }]);

    return positionStrategy;
  }

  showDropdown() {
    const shouldReverse = this.shouldReverseDropdown();
    this.createDropdownPortal(shouldReverse);

    if (this.dropdownMenuPortal) {
      this.overlayRef.attach(this.dropdownMenuPortal);
      this.listItems = Array.from(this.overlayRef.hostElement.querySelectorAll('li[role="presentation"]'));

      const events = [fromEvent(this.doc, 'click')];

      if (this.closeOnBlur) {
        events.push(fromEvent(window, 'blur'));
      }

      merge(...events)
        .pipe(
          tap((event: Event) => {
            this.onClickedOutside(event);
          }),
          subscribeOn(asyncScheduler),
          takeUntil(this.overlayRef.detachments())
        )
        .subscribe();
    }
  }

  shouldReverseDropdown() {
    const mheDropdown = this.dropdownButton as HTMLElement;
    const offsetTop = getOffsetTop(mheDropdown);
    const relativeOffset = offsetTop + mheDropdown.offsetHeight + MAX_DROPDOWN_HEIGHT - window.scrollY;

    if (relativeOffset > window.innerHeight) {
      return true;
    }

    return false;
  }

  hideDropdown(returnFocus = true) {
    this.triggerHideDropdown = false;

    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
      this.overlayRef.dispose();

      if (returnFocus) {
        this.focusControlButton();
      }
    }

    this.isExpanded = false;
    this.close.emit();

    if (this.isMenu) {
      this.resetSelectedState();
    }
  }

  resetSelectedState() {
    this.selected = [];
  }

  width() {
    const elementRef = this.controlButton || this.splitActionButton || this.toggleButtonWithIcon;
    const clientRect = elementRef.nativeElement.getBoundingClientRect();
    let width = clientRect.width;

    if (this.syncWidths) {
      return width;
    }

    if (width < DEFAULT_MENU_WIDTH) {
      width = 'auto';
    }

    if (width > DEFAULT_MENU_WIDTH) {
      width = DEFAULT_MENU_WIDTH;
    }

    return width;
  }

  getContext(i: any, option: any) {
    return { isChild: this._isChild[i], option };
  }

  containsOption(target: DropdownOption | MheOption, options: DropdownOption[] | MheOption[] | undefined) {
    return options?.some((option) => option.value === target.value);
  }

  selectOption(selectedOption: DropdownOption | MheOption) {
    if (selectedOption.disabled || !!selectedOption.children) {
      return;
    }

    if (!this.multiple) {
      this.selected = [selectedOption];
      this.triggerOptionSelectionAnimation = true;
    } else {
      if (this.containsOption(selectedOption, this.selected)) {
        this.selected = this.selected?.filter((option) => option.value !== selectedOption.value);
      } else {
        this.selected = (this.selected ?? []).concat(selectedOption);
      }
    }

    this.updateDropdown();
  }

  optionSelectionAnimationDone(event: AnimationEvent) {
    if (event.toState === 'selected') {
      this.triggerHideDropdown = true;
      this.triggerOptionSelectionAnimation = false;
    }
  }

  hideDropdownAnimationDone(event: any) {
    if (event.toState === 'dropdownHidden') {
      this.hideDropdown();
    }
  }

  selectAllOptions() {
    if (this.allSelected) {
      this.selected = [];
    } else {
      this.selected = [...this.options];
    }

    this.updateDropdown();
  }

  private checkSelectAll() {
    if (this.selected?.length && this.options.length === this.selected.length) {
      this.allSelected = !differenceWith(this.options, this.selected, isEqual).length;
    } else {
      this.allSelected = false;
    }
  }

  updateDropdown() {
    this.checkSelectAll();
    this.selectionChange.emit(this.selected);
    this._onChange(this.selected);
  }

  getDropdownDisplay(selectedOptions: DropdownOption[] | MheOption[] | undefined, placeholder: string) {
    const selectedLength = selectedOptions?.length;

    if (!selectedLength) {
      return placeholder;
    }

    if (selectedLength === 1) {
      return selectedOptions[0].viewValue;
    }

    return `${selectedOptions.length} ${this.selectedSuffix}`;
  }

  hasPlaceholderText(selectedOptions: DropdownOption[] | MheOption[] | undefined): boolean {
    return selectedOptions?.length === 0;
  }

  linkClickHandler(e: MouseEvent, option: MheOption) {
    if (!(option.href || option.routerLink) || option.disabled) {
      e.preventDefault();
    }
  }

  linkFocusHandler(event: any, option: MheOption) {
    const dropdownItem = event.target.parentElement;

    if (option.disabled) {
      return;
    }

    this.listItems.forEach((listItem) => {
      listItem.classList.remove('focused');
    });
    dropdownItem.classList.add('focused');
  }

  toggleMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      this.showDropdown();
    } else {
      this.hideDropdown();
    }

    if (this.isExpanded && !this.multiple) {
      const initialSelection = this.getInitialSelectionLink();
      this.focusedOption = initialSelection;

      if (initialSelection) {
        setTimeout(() => {
          (initialSelection as any).focus();
        }, 0);
      }
    } else {
      this.focusControlButton();
    }
  }

  focusControlButton() {
    setTimeout(() => {
      if (this.hasIcon && this.toggleButtonWithIcon) {
        this.toggleButtonWithIcon.nativeElement.focus();
      } else if (this.splitActionText && this.splitActionButton) {
        this.splitActionButton.nativeElement.focus();
      } else if (this.controlButton) {
        this.controlButton.nativeElement.focus();
      }
    }, 0);
  }

  get dropdownButton() {
    const button = this.controlButton || this.toggleButtonWithIcon || this.splitActionButton;
    return button.nativeElement;
  }

  getInitialSelectionLink() {
    if (!this.listItems || this.listItems.length === 0) {
      return undefined;
    }

    let item = this.listItems[0];

    if (this.selected?.length) {
      const selectedValue = this.selected[0].value;

      this.listItems.forEach((listitem, index) => {
        const option = this._filteredOptions[index];

        if (option && option.value === selectedValue) {
          item = listitem;
        }
      });
    }

    return item.querySelector('.dropdown-item');
  }

  incrementSelectionLink() {
    const currIdx = this.listItems.findIndex((e, i) => e.classList.contains('focused'));
    let focusedOption;

    for (let i = currIdx + 1; i < this.listItems.length; i++) {
      const currentListItem = this.listItems[i];
      if (
        currentListItem.classList.contains('disabled') ||
        currentListItem.classList.contains('option-group-title')
      ) {
        continue;
      } else {
        focusedOption = this.listItems[i].querySelector('.dropdown-item');
        break;
      }
    }

    if (focusedOption) {
      this.focusedOption = focusedOption;
      this.focusedOption.focus();
    }
  }

  decrementSelectionLink() {
    const currIdx = this.listItems.findIndex((e, i) => e.classList.contains('focused'));
    let focusedOption;

    for (let i = currIdx - 1; i >= 0; i--) {
      const currentListItem = this.listItems[i];
      if (
        currentListItem.classList.contains('disabled') ||
        currentListItem.classList.contains('option-group-title')
      ) {
        continue;
      } else {
        focusedOption = currentListItem.querySelector('.dropdown-item');
        break;
      }
    }

    if (focusedOption) {
      this.focusedOption = focusedOption;
      this.focusedOption.focus();
    }
  }

  onKey(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        this.hideDropdown(true);
        break;
      case 'Tab':
        event.preventDefault();
        this.hideDropdown(false);
        this.tabToNextFocusable();
        break;
      case ' ':
      case 'Enter':
        if (this.isExpanded && !this.searchIsFocused) {
          this.focusedOption.click();
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        this.incrementSelectionLink();
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.decrementSelectionLink();
        event.preventDefault();
        break;
    }
  }

  tabToNextFocusable() {
    const focusableElems = getFocusableElements();
    const dropdownButtonIndex = focusableElems.findIndex((element) => element === this.dropdownButton);

    if (dropdownButtonIndex !== -1) {
      let nextIndex = dropdownButtonIndex + 1;

      if (nextIndex > focusableElems.length) {
        nextIndex = 0;
      }

      const nextFocusable = focusableElems[nextIndex];
      (nextFocusable as HTMLElement).focus();
    }
  }

  onClickedOutside(event: Event) {
    if (!this.overlayRef?.overlayElement?.contains(event?.target as Node)) {
      this.hideDropdown(false);

      if (!isElementFocusable(document.activeElement as HTMLElement)) {
        this.focusControlButton();
      }
    }
  }

  disabledProp(disabled: any) {
    return disabled ? '' : null;
  }

  getOptionLabel(option: { [key: string]: any }): string {
    const optionValueList = [option.viewValue];

    if (option.viewDescription) {
      optionValueList.push(option.viewDescription);
    }

    for (const i in option.viewIcons) {
      if (optionValueList) {
        optionValueList.push(option.viewIcons[i].label);
      }
    }

    return optionValueList.join(' ');
  }

  _onChange = (_: any) => { };

  _onTouch = () => { };

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this._onTouch = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
  }

  writeValue(val: DropdownOption[] | MheOption[]) {
    if (val !== this.selected) {
      const selectedChange = new SimpleChange(this.selected, val, true);
      this.selected = val;
      this.ngOnChanges({ selected: selectedChange });

      this._changeDetectorRef.markForCheck();
    }
  }

  onScroll(event: any) {
    if (event.target.scrollHeight - event.target.scrollTop < event.target.offsetHeight) {
      this.scrollBottomReached.emit(event);
    }
  }

  searchOptions(event: Event) {
    const { target } = event as HTMLElementEvent;
    this._searchTerm = target.value;

    if (this.searchable) {
      this.searchTerm.emit(this._searchTerm);
    } else {
      this._filteredOptions = this.filterOptions(this._searchTerm);
    }

    this.checkSelectAll();
  }

  trackById(index: any, item: DropdownOption | MheOption) {
    return item.value;
  }

  // currently, searchTerm filters on leaf nodes only
  private filterOptions(searchTerm: string): MheOption[] {
    const options = [...this._flatOptions];

    if (!searchTerm.trim().length) {
      return options;
    }

    return options.filter((option) => {
      if (option.children?.length) {
        return false;
      } else {
        return option.viewValue.toLowerCase().includes(searchTerm.trim().toLowerCase());
      }
    });
  }
}