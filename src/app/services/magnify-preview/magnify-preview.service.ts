import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MagnifyPreviewService {
  status = new ReplaySubject();
  constructor() {}

  show(option: any) {
    this.status.next(option);
  }

  hide() {
    this.status.next(false);
  }

  getStatus(): Observable<any> {
    return this.status.asObservable();
  }
}
