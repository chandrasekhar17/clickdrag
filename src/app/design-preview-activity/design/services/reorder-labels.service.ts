import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReorderLabelsService {

  reorderLabels: BehaviorSubject<any> = new BehaviorSubject<any>(false);


  constructor() { }

  toggleReorderLabels() {
    this.reorderLabels.next(!this.reorderLabels.value);
  }

}
