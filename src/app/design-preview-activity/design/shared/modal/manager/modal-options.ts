import { ElementRef } from '@angular/core';

export interface ModalOptions {
    focusElementOnClose?: ElementRef;
    focusElementOnOverlayClick?: ElementRef;
    focusOnConfirm?: boolean;
    showTitlebar?: boolean;
    showFooter?: boolean;
    titleText?: string;
    cancelButtonText?: string;
    confirmButtonText?: string;
    disableCancel?: false;
    disableClose?: false;
    disableEscape?: false;
    footerMessage?: string;
    martinTop?: string | null;
    context?: any;
}