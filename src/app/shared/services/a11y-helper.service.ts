import { Injectable } from '@angular/core';
import { A11yLabel } from '../constants/a11yLabel';

@Injectable({
  providedIn: 'root',
})
export class A11yHelperService {
  public labelCount: number = 0;
  public dockCount: number = 0;

  constructor() { }

  getAnnounceMsg(templateKey: string, replaceLabel: any);

  getAnnounceMsg(templateKey: string);

  getAnnounceMsg(templateKey: string, ...args) {
    let template = A11yLabel[templateKey];
    if (args[0]) {
      Object.keys(args[0]).forEach((key) => {
        template = template.replace(`{{${key}}}`, args[0][key]);
      });
    }
    return template;
  }

  // set label count in EZ.MODE_PREVIEW
  setLabelCount(state) {
    const isDisplayEachLabel = state.activity.options.typeOfOccurrence === 'display-each-instance' ? true : false;
    let labelCount: number = 0;

    state.labelData.labels.forEach((element) => {
      if (isDisplayEachLabel) {
        if (element.distractor) {
          labelCount++;
        } else {
          element.dockedTo.forEach((val) => {
            labelCount++;
          });
        }
      } else {
        labelCount++;
      }
    });

    this.labelCount = labelCount;
  }

  getGroupTitle(headerText: any): string {
    return headerText === "" ? "Group" : headerText;
  }

  skipLink(id: string) {
    let element = document.getElementById(id);
    element.setAttribute('tabIndex', '-1');
    element.classList.add('focus-blink');
    element.focus();
    setTimeout(() => {
      element.classList.remove('focus-blink');
    }, 3000);
  }

  // update aria attributes for clone element while selected for drag
  updateA11yAttributes(element) {
    const childClassNames = ['.label-text', 'img', '.ahe-ui-link', '.btn'];
    element.removeAttribute('aria-label');
    element.removeAttribute('aria-roledescription');
    element.removeAttribute('aria-grabbed');
    element.removeAttribute('aria-disabled');
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute('aria-pressed', 'true');

    childClassNames.forEach(item => {
      element.querySelectorAll(item).forEach(el => {
        el.setAttribute('aria-hidden', 'true');
      });
    })
  }

}
