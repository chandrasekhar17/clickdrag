import { Injectable, Injector } from '@angular/core';
import { CdStateService } from '../cd-state/cd-state.service';
import { UndoRedoService } from '../undo-redo/undo-redo.service';
// import { UndoRedoService } from '../undo-redo/undo-redo.service';

@Injectable({
  providedIn: 'root',
})
export class StageRulerService {
  _rulerSelector: HTMLElement;
  _rulerWrap: HTMLElement;
  _rulerLength;
  _rulerThickness = 0;
  _context: any;
  _guide: any[] = [];
  private _guideWrap: HTMLElement;
  state: any;

  constructor(private cdStateService: CdStateService, private injector: Injector) {
    this.state = this.cdStateService.getState();
  }

  initializeRuler(rulerSelector: HTMLElement) {
    this._rulerSelector = rulerSelector;
    this._rulerWrap = this.createHtmlNode('div', 'rulerWrap');
    this._guideWrap = this.createHtmlNode('div', 'guide-wrap');
    const hRuler = this.drawRuler('horizontal');
    const vRuler = this.drawRuler('vertical');
    this.attacheMouseListener(hRuler, 'horizontal');
    this.attacheMouseListener(vRuler, 'vertical');
    this._rulerWrap.appendChild(hRuler);
    this._rulerWrap.appendChild(vRuler);

    this._rulerSelector.appendChild(this._rulerWrap);
    this._rulerWrap.appendChild(this._guideWrap);

    if (this.state.canvas.guide.hGuide.length > 0 || this.state.canvas.guide.vGuide.length > 0) {
      this.removeGuides();
      if (this.state.canvas.guide.hGuide.length > 0) {
        this.state.canvas.guide.hGuide.forEach((item) => {
          this.drawGuideLineState(item, false);
        });
      }
      if (this.state.canvas.guide.vGuide.length > 0) {
        this.state.canvas.guide.vGuide.forEach((item) => {
          this.drawGuideLineState(item, true);
        });
      }
    }

    this.cdStateService.stateUpdated.subscribe(() => {
      if (this.state.canvas.guide.hGuide.length > 0 || this.state.canvas.guide.vGuide.length > 0) {
        this.removeGuides();
        if (this.state.canvas.guide.hGuide.length > 0) {
          this.state.canvas.guide.hGuide.forEach((item) => {
            this.drawGuideLineState(item, false);
          });
        }
        if (this.state.canvas.guide.vGuide.length > 0) {
          this.state.canvas.guide.vGuide.forEach((item) => {
            this.drawGuideLineState(item, true);
          });
        }
      }
    });
  }

  drawRuler(type: 'horizontal' | 'vertical') {
    const rulerClass = type === 'horizontal' ? 'h-ruler' : 'v-ruler';
    const canvas: any = this.createHtmlNode('canvas', rulerClass);
    this._rulerWrap.appendChild(canvas);
    this._context = canvas.getContext('2d');
    if (type === 'horizontal') {
      this._rulerLength = canvas.width = this._rulerSelector.offsetWidth * 4;
      this._rulerThickness = canvas.height = 26;
    } else if (type === 'vertical') {
      this._rulerLength = canvas.height = this._rulerSelector.offsetHeight * 4;
      this._rulerThickness = canvas.width = 26;
    }
    this._context.strokeStyle = '#cfd6d8';
    this._context.font = '12px "proxima_novaregular"';
    this._context.fillStyle = '#46707d';
    this._context.beginPath();
    this.drawLines(type);
    this._context.stroke();
    return canvas;
  }

  drawLines(type: 'horizontal' | 'vertical') {
    let text: any = '';
    let drawable: boolean = false;
    for (let pos = 0; pos <= this._rulerLength; pos += 1) {
      drawable = false;
      text = '';
      if (pos % 100 === 0) {
        text = Math.round(Math.abs(pos));
        drawable = true;
      } else if (pos % 10 === 0) {
        drawable = true;
      }
      if (drawable) {
        const coordinates = this.getCoordinates(pos, type);
        this._context.moveTo(coordinates.xMove, coordinates.yMove);
        if (pos % 100 === 0) {
          // max line ex 100, 200, 300 ect in ruler
          this._context.lineTo(coordinates.xMaxLine, coordinates.yMaxLine);
        } else if (pos % 10 === 0) {
          const value = pos / 10;
          if (value % 2 === 0) {
            // mid line ex 10, 30, 50 ect in ruler
            this._context.lineTo(coordinates.xMidLine, coordinates.yMidLine);
          } else {
            // min line ex 20, 40, 60 ect in ruler
            this._context.lineTo(coordinates.xMinLine, coordinates.yMinLine);
          }
        }
        if (type === 'vertical') {
          this._context.save();
          this._context.translate(coordinates.xLabel, coordinates.yLabel);
          this._context.rotate(-Math.PI / 2);
          if (text === 0) {
            this._context.fillText(text, 0, 10);
          } else {
            this._context.fillText(text, 12, 10);
          }
          this._context.restore();
        } else {
          this._context.fillText(text, coordinates.xLabel, coordinates.yLabel);
        }
      }
    }
  }

  getCoordinates(position: number, type: 'horizontal' | 'vertical') {
    const xMove = type === 'horizontal' ? position : this._rulerThickness;
    const yMove = type === 'horizontal' ? this._rulerThickness : position;
    const xMaxLine = type === 'horizontal' ? position : 0;
    const yMaxLine = type === 'horizontal' ? 0 : position;
    const xMidLine = type === 'horizontal' ? position : 15;
    const yMidLine = type === 'horizontal' ? 15 : position;
    const xMinLine = type === 'horizontal' ? position : 20;
    const yMinLine = type === 'horizontal' ? 20 : position;
    const xLabel = type === 'horizontal' ? position + 3 : 0;
    const yLabel = type === 'horizontal' ? 12 : position + 10;
    return { xMove, yMove, xMaxLine, yMaxLine, xMidLine, yMidLine, xMinLine, yMinLine, xLabel, yLabel };
  }

  attacheMouseListener(ruler: HTMLElement, type: 'horizontal' | 'vertical') {
    if (this.state.activity.name === 'labeling') {
      ruler.addEventListener('mousedown', (e) => this.rulerMouseDown(e, type));
    }
  }

  rulerMouseDown(event: MouseEvent, type: 'horizontal' | 'vertical') {
    const isVertical = type === 'vertical' ? true : false;
    this.drawGuidelines(event, isVertical);
  }

  drawGuideLineState(guideItem, isVertical: boolean) {
    const guide = this.createHtmlNode('div', [`${isVertical ? 'v' : 'h'}-guide`, 'ruler-guide']);
    const svgEl = document.getElementById('svg-canvas').parentElement;
    const top = svgEl.offsetTop;
    const left = svgEl.offsetLeft;
    guide.addEventListener('mousedown', (e) => this.guideMouseDown(e));
    guide.addEventListener('mouseup', (e) => this.guideMouseUp(e));
    if (isVertical) {
      guide.style.left = guideItem + left + 'px';
    } else {
      guide.style.top = guideItem + top + 'px';
    }
    this._guideWrap.appendChild(guide);
    this._rulerWrap.appendChild(this._guideWrap);
  }

  drawGuidelines(event: MouseEvent, isVertical: boolean) {
    const guide = this.createHtmlNode('div', [`${isVertical ? 'v' : 'h'}-guide`, 'ruler-guide']);
    guide.addEventListener('mousedown', (e) => this.guideMouseDown(e));
    guide.addEventListener('mouseup', (e) => this.guideMouseUp(e));
    if (isVertical) {
      guide.style.left = event.offsetX + 'px';
    } else {
      guide.style.top = event.offsetY + 'px';
    }
    this._guideWrap.appendChild(guide);
    this._rulerWrap.appendChild(this._guideWrap);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      document.onmousemove = function moving(evt) {
        if (guide) {
          if (isVertical) {
            guide.style.left = evt.clientX - 1 + 'px';
          } else {
            guide.style.top = evt.clientY - 46 + 'px';
          }
        }
      };
    }
  }

  guideMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.state.canvas.lockGuide) {
      return;
    }
    document.onmousemove = function moving(evt) {
      if (event.srcElement) {
        if (event.srcElement.classList.contains('h-guide')) {
          event.srcElement.style.top = evt.clientY - 46 + 'px';
        } else {
          event.srcElement.style.left = evt.clientX - 1 + 'px';
        }
      }
    };
  }

  guideMouseUp(event) {
    const undoObj = {
      actionName: 'guides-move',
      actionData: {
        old: this.cdStateService.getDataOfFields(),
        new: {},
      },
    };
    event.stopPropagation();
    const isHGuide = event.srcElement.classList.contains('h-guide');
    const svgEl = document.getElementById('svg-canvas').parentElement;
    const top = svgEl.offsetTop;
    const left = svgEl.offsetLeft;
    if (isHGuide) {
      if (event.srcElement.offsetTop > top) {
        document.onmousemove = function () {};
        this.cdStateService.updateSelectedObject({
          objRef: event.srcElement,
          type: 'guideLine',
        });
      } else {
        event.currentTarget.remove();
        this.cdStateService.deselectObject();
      }
    } else {
      if (event.srcElement.offsetLeft > left) {
        document.onmousemove = function () {};
        this.cdStateService.updateSelectedObject({
          objRef: event.srcElement,
          type: 'guideLine',
        });
      } else {
        event.currentTarget.remove();
        this.cdStateService.deselectObject();
      }
    }
    this.saveGuidePosition();
    undoObj.actionData.new = this.cdStateService.getDataOfFields();
    const undoRedo = this.injector.get<UndoRedoService>(UndoRedoService);
    undoRedo.updateUndoArray(undoObj);
  }

  saveGuidePosition() {
    const guides = Array.from(this._guideWrap.children);
    this.cdStateService.clearGuides();
    for (let item of guides) {
      if (item.classList.contains('h-guide')) {
        this.state.canvas.guide.hGuide.push(this.getGuidePosition(item, 'h-guide'));
      } else if (item.classList.contains('v-guide')) {
        this.state.canvas.guide.vGuide.push(this.getGuidePosition(item, 'v-guide'));
      }
    }
    if (this.state.canvas.guide.hGuide.length > 0) {
      this.state.canvas.snapGuide = true;
    } else if (this.state.canvas.guide.vGuide.length > 0) {
      this.state.canvas.snapGuide = true;
    } else {
      this.state.canvas.snapGuide = false;
    }
  }

  getGuidePosition(guide, type) {
    const svgEl = document.getElementById('svg-canvas').parentElement;
    const top = svgEl.offsetTop;
    const left = svgEl.offsetLeft;
    let value = 0;
    if (type === 'h-guide') {
      value = guide.offsetTop - top;
    } else if (type === 'v-guide') {
      value = guide.offsetLeft - left;
    }
    return value;
  }

  createHtmlNode(tag: string, className?: any) {
    if (typeof tag !== 'string') {
      return;
    }
    const htmlNode = document.createElement(tag);
    if (className) {
      this.addClass(htmlNode, className);
    }
    return htmlNode;
  }

  addClass(element, classNames: any) {
    if (!(classNames instanceof Array)) {
      classNames = [classNames];
    }
    classNames.forEach((name: string) => {
      element.className += ' ' + name;
    });
    return element;
  }

  removeGuides(clearState?) {
    const guideNode = this._guideWrap;
    while (guideNode.hasChildNodes()) {
      guideNode.removeChild(guideNode.firstChild);
    }
    if (clearState) {
      this.state.canvas.guide.hGuide = [];
      this.state.canvas.guide.vGuide = [];
    }
  }

  hideGuides(isHide) {
    const guideNode = this._guideWrap;
    if (isHide) {
      this.addClass(guideNode, 'hide');
    } else {
      guideNode.classList.remove('hide');
    }
  }

  removeGuide(selectedGuide) {
    const guideNode = selectedGuide;
    if (guideNode) {
      guideNode.remove();
      this.saveGuidePosition();
    }
  }
}
