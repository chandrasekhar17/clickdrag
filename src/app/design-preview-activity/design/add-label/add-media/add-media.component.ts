import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-media',
  templateUrl: './add-media.component.html',
  styleUrls: ['./add-media.component.scss']
})
export class AddMediaComponent implements OnInit {
  mediaList;
  showSearch;
  isHeaderFilter;
  listOfMedia: Array<any>;
  mediaId;
  labelText;
  note;
  feedback;
  dropzoneDescription;
  constructor() { }

  ngOnInit(): void {
    this.listOfMedia = this.mediaList;
  }

  valueChangeForFilter(event) {
    if (event.counterOfCheck === 0 || event.counterOfCheck === 2) {
      this.listOfMedia = this.mediaList;
    } else {
      if (event.value.viewValue === 'image') {
        if (event.value.checked) {
          this.listOfMedia = this.mediaList.filter(item => item.type === 'image');
        } else {
          this.listOfMedia = this.mediaList.filter(item => item.type === 'audio');
        }
      } else if (event.value.viewValue === 'audio') {
        if (event.value.checked) {
          this.listOfMedia = this.mediaList.filter(item => item.type === 'audio');
        } else {
          this.listOfMedia = this.mediaList.filter(item => item.type === 'image');
        }
      }
    }
  }

}
