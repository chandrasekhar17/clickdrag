import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScramblerService {
  props = [];
  constructor() {
    this.setProps();
  }

  scramble(str) {
    let scrambledStr = str;
    for (var i = 0; i < this.props.length; i++) {
      scrambledStr = scrambledStr.replace(RegExp(this.props[i], 'g'), '"_' + i + '":');
    }
    scrambledStr = scrambledStr.match(/.{1,2}/g).reverse().join('').replace(/[^{}\[\]":,]+/g, function () {
      return encodeURIComponent(arguments[0]);
    });
    return scrambledStr;
  }

  unscramble(str) {
    const scrambledStr = decodeURIComponent(str);//.replace(/~~&~~/g,'&');
    const regLen = scrambledStr.length % 2;
    let regex;
    if (regLen === 0) {
      regex = new RegExp(".{1,2}");
    } else {
      regex = new RegExp(".{1," + regLen + "}");
    }
    const end = scrambledStr.match(regex);
    const start = scrambledStr.replace(regex, '');
    let stateStr = "";
    if (start) {
      stateStr = start.match(/.{1,2}/g).reverse().join('');
    }
    if (end) {
      stateStr = stateStr + end[0];
    }
    const unscrambledStr = stateStr.replace(/"_(\d+)":/g, (match, i) => {
      return this.props[i];
    });
    return unscrambledStr;
  }

  setProps() {
    // Never change the order of the below array items. 
    // Never remove an item from the below array.
    // If needed to add item, add it at the end.
    // Do not repeat items.
    this.props = [
      '"id":',
      '"position":',
      '"width":',
      '"height":',
      '"canvas":',
      '"activity":',
      '"name":',
      '"options":',
      '"labelInteraction":',
      '"typeOfOccurrence":',
      '"showGrid":',
      '"hideGuide":',
      '"lockGuide":',
      '"snapGuide":',
      '"guide":',
      '"vGuide":',
      '"hGuide":',
      '"frameData":',
      '"frames":',
      '"type":',
      '"mediaAdded":',
      '"media":',
      '"path":',
      '"altText":',
      '"description":',
      '"labelData":',
      '"labels":',
      '"totalLabels":',
      '"idCount":',
      '"dockData":',
      '"sizeSameAsLabels":',
      '"docks":',
      '"notesSettings":',
      '"displayOnHover":',
      '"feedbackSettings":',
      '"magnifySettings":',
      '"enabled":',
      '"scale":',
      '"text":',
      '"richText":',
      '"note":',
      '"feedback":',
      '"dropzoneDescription":',
      '"mediaType":',
      '"image":',
      '"audio":',
      '"distractor":',
      '"dockedTo":',
      '"linkedLabel":',
      '"headerText":',
      '"biggestLabelHeight":'
    ];
  }
}
