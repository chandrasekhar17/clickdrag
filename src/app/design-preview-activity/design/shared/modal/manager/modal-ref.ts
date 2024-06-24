import { ComponentRef } from '@angular/core';

import { ModalComponent } from '../modal.component';
import { ModalOptions } from './modal-options';

export class ModalRef<T> {
    constructor(
        public componentRef: ComponentRef<ModalComponent>,
        private _modalContentComponentRef: ComponentRef<T>,
        public options: ModalOptions,
        public priority: number = 1
    ) {
        this.configureModal(options);
        this.close();
    }

    get modalContent() {
        return this._modalContentComponentRef.instance;
    }

    close() {
        this.componentRef.instance.isOpen = false;
        this.componentRef.changeDetectorRef.detectChanges();
    }

    configureModal(options: { [key: string]: any }) {
        const modalInstance: { [key: string]: any } = this.componentRef.instance;

        if (options) {
            Object.keys(options).forEach((config) => (modalInstance[config] = options[config]));
        }
    }
}