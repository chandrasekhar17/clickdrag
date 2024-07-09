import { ElementRef } from '@angular/core';

export interface ModalOptions {
  type: 'warning' | 'error' | 'custom';
  titleText?: string;
  contentText?: string,
  cancelButtonText?: string;
  confirmButtonText?: string;
  showFooter?: boolean;
  panelClass?: string;
}
