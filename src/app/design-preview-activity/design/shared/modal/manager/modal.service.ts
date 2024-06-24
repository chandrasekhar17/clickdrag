import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';
import { uuid } from '@mhe/ngx-shared/utils';
import { merge } from 'rxjs';

import { ModalComponent } from '../modal.component';
import { ModalContent } from './modal-content';
import { ModalOptions } from './modal-options';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class ModalManagerService {
    private modals = new Map<string, ModalRef<any>>();
    private order: string[][] = [];
    private modalFactory = this.resolver.resolveComponentFactory<ModalComponent>(ModalComponent);

    constructor(
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private appRef: ApplicationRef
    ) {
        for (let i = 0; i < 99; i++) {
            this.order.push([]);
        }
    }

    open<T>(content: ModalContent<T>, options: ModalOptions, priority = 1): ModalRef<T> {
        const contentRef = this.resolveNgContent(content);
        const componentRef = this.modalFactory.create(this.injector, [[contentRef.location.nativeElement]]);
        if (priority > 99) {
            priority = 99;
        }
        const modalRef = new ModalRef(componentRef, contentRef, options, priority);

        setTimeout(() => {
            componentRef.instance.open.emit();
        }, 0);

        let openNewer = false;
        if (this.modals.size) {
            const oldHighestId = this.getHighest();

            if (oldHighestId) {
                const getOldHighestId = this.modals.get(oldHighestId);

                if (getOldHighestId) {
                    const oldHighestPriority = getOldHighestId.priority;

                    if (priority > oldHighestPriority) {
                        const modalGetOldHighestId = this.modals.get(oldHighestId);

                        if (modalGetOldHighestId) {
                            modalGetOldHighestId.close();
                            openNewer = true;
                        }
                    }
                }
            }
        }

        const modalId = this.addModal(modalRef, priority);
        const thing = merge(
            componentRef.instance.confirm,
            componentRef.instance.cancel,
            componentRef.instance.overlayClick,
            componentRef.instance.close,
            componentRef.instance.destroy$
        ).subscribe(() => {
            this.removeModal(modalId);
            thing.unsubscribe();
        });

        if (this.modals.size === 1 || openNewer) {
            modalRef.componentRef.instance.showModal();
        }

        return modalRef;
    }

    private clampPriority(priority: number) {
        if (typeof priority !== 'number' || priority < 1) {
            return 1;
        }

        if (priority > 99) {
            return 99;
        }

        return priority;
    }

    private addModal(modalRef: ModalRef<any>, priority: number) {
        const aUuid = uuid();

        this.modals.set(aUuid, modalRef);
        this.order[priority - 1].push(aUuid);

        return aUuid;
    }

    private removeModal(id: string) {
        const getModalId = this.modals.get(id);
        if (getModalId) {
            const priority = getModalId.priority;
            this.modals.delete(id);
            const orderGroup = this.order[priority - 1];
            orderGroup.splice(orderGroup.indexOf(id), 1);
        }

        // removeModal assumes the modal being removed is being shown
        this.showNext();
    }

    private showNext() {
        if (this.modals.size) {
            const getHighest = this.modals.get(this.getHighest());
            if (getHighest) {
                getHighest.componentRef.instance.showModal();
            }
        }
    }

    private getHighest() {
        let highestId = '';
        for (let i = 98; i >= 0; i--) {
            if (!highestId && this.order[i].length) {
                highestId = this.order[i][0] ?? '';
            }
        }

        return highestId;
    }

    private resolveNgContent<T>(content: ModalContent<T>) {
        const factory = this.resolver.resolveComponentFactory(content);
        const contentRef = factory.create(this.injector);
        this.appRef.attachView(contentRef.hostView);

        return contentRef;
    }
}