import { Component, OnInit } from '@angular/core';
import { MagnifyPreviewService } from '../../../services/magnify-preview/magnify-preview.service';

import { CdStateService } from '../../../services/cd-state/cd-state.service';
import { MediaService } from '../../../services/media/media.service';

export interface Coordinates {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface LineCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-magnify-preview',
  templateUrl: './magnify-preview.component.html',
  styleUrls: ['./magnify-preview.component.scss'],
})
export class MagnifyPreviewComponent implements OnInit {
  showMagnify: boolean;
  state: any;
  frames: any;
  branches: any;
  magnifyData: any;
  dock: any;
  line: LineCoordinates;

  imageDimension: Dimension = { width: 0, height: 0 };
  magnifyCoordinates: Coordinates = { x: 0, y: 0 };
  innerImageCoordinates: Coordinates = { x: 0, y: 0 };

  svgDimension = { width: 0, height: 0, x: 0, y: 0 };
  leaderLineNodes = [];
  imagePath = '';
  currentOrigin: any;

  constructor(
    private magnifyPreviewService: MagnifyPreviewService,
    private stateService: CdStateService,
    private mediaService: MediaService
  ) {
    this.state = stateService.getState();
    this.frames = this.state.frameData.frames[0];
    this.magnifyData = this.state.magnifySettings;

    this.magnifyPreviewService.getStatus().subscribe((val) => {
      if (val === false) {
        this.showMagnify = false;
      } else {
        this.dock = val;
        if (this.dock.leaderLine) {
          this.branches = this.dock.leaderLine.branches[0];
          this.magnifyInit();
        }
      }
    });

    this.stateService.bgImageDataUpdated.subscribe(() => {
      if (this.frames && this.frames.media.mediaId !== '') {
        const media = this.mediaService.getMediaDetails(this.frames.media.mediaId);
        this.imagePath = media.path;
      } else {
        this.imagePath = '';
      }
    });
  }

  getOrigin() {
    const childrenBranches = this.checkNodeHasBranches(this.dock.leaderLine.branches[0]);
    this.currentOrigin = {};
    if (!childrenBranches) {
      this.currentOrigin = {
        x: this.dock.leaderLine.branches[0].position.x,
        y: this.dock.leaderLine.branches[0].position.y,
      };
      return `${this.dock.leaderLine.branches[0].position.x}  ${this.dock.leaderLine.branches[0].position.y}`;
    } else {
      const lastNode = [];
      let leaderLineHandler = (node) => {
        if (this.checkNodeHasBranches(node)) {
          node.branches.forEach(leaderLineHandler);
        } else {
          lastNode.push(node.position);
        }
      };
      this.dock.leaderLine.branches[0].branches.forEach(leaderLineHandler);
      if (lastNode.length > 1) {
        const xValue = [lastNode[0].x, lastNode[1].x];
        const yValue = [lastNode[0].y, lastNode[1].y];
        const xAvg = xValue.reduce((a, b) => a + b) / xValue.length;
        const yAvg = yValue.reduce((a, b) => a + b) / yValue.length;
        this.currentOrigin = {
          x: xAvg,
          y: yAvg,
        };
        return `${xAvg}  ${yAvg}`;
      } else {
        this.currentOrigin = {
          x: lastNode[0].x,
          y: lastNode[0].y,
        };
        return `${lastNode[0].x}  ${lastNode[0].y}`;
      }
    }
  }

  checkNodeHasBranches(node) {
    return node?.branches?.length > 0 ? true : false;
  }

  magnifyInit() {
    const branchT = this.branches.position.y - this.frames.position.y;
    const branchL = this.branches.position.x - this.frames.position.x;
    const top = (branchT * this.magnifyData.scale - this.magnifyData.height / 2) * -1;
    const left = (branchL * this.magnifyData.scale - this.magnifyData.width / 2) * -1;
    this.innerImageCoordinates = {
      x: left,
      y: top,
    };
    this.magnifyPosition();
    this.imageDimension = {
      width: this.frames.width * this.magnifyData.scale,
      height: this.frames.height * this.magnifyData.scale,
    };
    this.drawLine();
    this.showMagnify = true;
  }

  getDockPositionX() {
    let dockPosition = '';
    if (this.dock.position.x < this.frames.position.x) {
      dockPosition = 'left';
    } else if (this.dock.position.x > this.frames.position.x + this.frames.width) {
      dockPosition = 'right';
    }
    return dockPosition;
  }

  magnifyPosition() {
    const offset = 20,
      dockPos = this.stateService.getElementClientPosition(this.dock.position, this.dock.width, this.dock.height),
      imagePos = this.stateService.getElementClientPosition(
        this.frames.position,
        this.frames.width,
        this.frames.height
      ),
      dockPlaced = this.getDockPlacedPlacement(dockPos, imagePos),
      canvas = document.getElementById('svg-canvas').getBoundingClientRect();
    let pos = { x: 0, y: 0 };
    if (dockPlaced === 'left') {
      pos = this.getAvailablePositionLR(dockPos, imagePos, canvas, 'left');
    } else if (dockPlaced === 'right') {
      pos = this.getAvailablePositionLR(dockPos, imagePos, canvas, 'right');
    } else if (dockPlaced === 'bottom') {
      pos = this.getAvailablePositionTB(dockPos, imagePos, canvas, 'bottom');
    } else if (dockPlaced === 'top') {
      pos = this.getAvailablePositionTB(dockPos, imagePos, canvas, 'top');
    }

    this.magnifyCoordinates = {
      x: pos.x,
      y: pos.y,
    };
  }

  getDockPlacedPlacement(dockPos, imagePos) {
    let dockPlaced = '';
    const pageWindowHeight = parent.document.body.clientHeight;
    const framePos = window.frameElement.getBoundingClientRect();
    const dockViewportValue = this.dock.position.y + this.dock.height + framePos.top + this.magnifyData.height;

    if (imagePos.right < dockPos.left) {
      if (pageWindowHeight < dockViewportValue) {
        dockPlaced = 'top';
      } else {
        dockPlaced = 'right';
      }
    } else if (imagePos.left > dockPos.right) {
      if (pageWindowHeight < dockViewportValue) {
        dockPlaced = 'top';
      } else {
        dockPlaced = 'left';
      }
    } else if (imagePos.bottom < dockPos.top) {
      dockPlaced = 'bottom';
    } else if (imagePos.top > dockPos.bottom) {
      dockPlaced = 'top';
    }
    return dockPlaced;
  }

  getDockPositionY() {
    let dockPosition = '';
    if (this.dock.position.y + this.dock.height + this.magnifyData.height > this.state.canvas.height) {
      dockPosition = 'bottom';
    } else {
      dockPosition = 'top';
    }
    return dockPosition;
  }

  drawLine() {
    const container = document.querySelector('#svg-canvas'),
      clientWidth = container.clientWidth,
      clientHeight = container.clientHeight;
    this.getOrigin();
    this.svgDimension = {
      width: clientWidth,
      height: clientHeight,
      y: this.magnifyData.height / 2 - this.currentOrigin.y,
      x: this.magnifyData.width / 2 - this.currentOrigin.x,
    };
    this.setLeaderLineNodes();
  }

  setLeaderLineNodes() {
    this.leaderLineNodes = [];
    if (this.dock.leaderLine && this.dock.leaderLine.branches) {
      let parent = this.dock.leaderLine;
      let leaderLineHandler = (node) => {
        let prevParent;
        this.leaderLineNodes.push({ parent, nodeRef: node, dockRef: this.dock });
        if (node.branches) {
          prevParent = parent;
          parent = node;
          node.branches.forEach(leaderLineHandler);
          parent = prevParent;
        }
      };
      this.dock.leaderLine.branches.forEach(leaderLineHandler);
    }
  }

  getAvailablePositionLR(dockPos, imagePos, canvas, type) {
    const isRight = type === 'right' ? true : false;
    const dockL = isRight ? parseInt(dockPos.left) - parseInt(imagePos.right) : parseInt(dockPos.left);
    const dockR = isRight
      ? parseInt(canvas.width) - parseInt(dockPos.right)
      : parseInt(imagePos.left) - parseInt(dockPos.right);
    const dockT = parseInt(dockPos.top);
    const dockB = parseInt(canvas.height) - parseInt(dockPos.bottom);
    const width = parseInt(this.magnifyData.width) - parseInt(this.dock.width);
    const height = parseInt(this.magnifyData.height);
    const pos = {
      left: false,
      right: false,
      top: false,
      bottom: false,
    };
    let positionValue = { x: 0, y: 0 };
    if (width > dockL && width > dockR && isRight) {
      pos.right = true;
    } else if (width > dockL && width > dockR && isRight) {
      pos.left = true;
    } else if (width > dockL) {
      pos.left = true;
    } else {
      pos.right = true;
    }

    if (dockB < height) {
      pos.top = true;
    } else {
      pos.bottom = true;
    }

    switch (true) {
      case pos.left && pos.bottom:
        positionValue = {
          x: dockPos.left,
          y: dockPos.bottom + 5,
        };
        break;
      case pos.right && pos.bottom:
        positionValue = {
          x: dockPos.right - this.magnifyData.width,
          y: dockPos.bottom + 5,
        };
        break;
      case pos.left && pos.top:
        positionValue = {
          x: dockPos.left,
          y: dockPos.top - this.magnifyData.height - 5,
        };
        break;
      case pos.right && pos.top:
        positionValue = {
          x: dockPos.right - this.magnifyData.width,
          y: dockPos.top - this.magnifyData.height - 5,
        };
        break;
      default:
        positionValue = {
          x: 0,
          y: 0,
        };
    }
    return positionValue;
  }

  getAvailablePositionTB(dockPos, imagePos, canvas, type) {
    const isBottom = type === 'bottom' ? true : false;
    const dockL = parseInt(dockPos.left);
    const dockR = parseInt(canvas.width) - parseInt(dockPos.right);
    const dockT = isBottom ? parseInt(dockPos.top) - parseInt(imagePos.bottom) : parseInt(dockPos.top);
    const dockB = isBottom
      ? parseInt(canvas.height) - parseInt(dockPos.bottom)
      : parseInt(imagePos.top) - parseInt(dockPos.bottom);
    const width = parseInt(this.magnifyData.width);
    const height = parseInt(this.magnifyData.height);
    const isLeftAvailable = dockL > width;
    const isRightAvailable = dockR > width;
    const isTopAvailable = dockT > height;
    const isBottomAvailable = dockB > height;
    let positionValue = { x: 0, y: 0 };
    switch (true) {
      case isTopAvailable:
        positionValue = {
          x: dockPos.right - width / 2 - this.dock.width / 2,
          y: dockPos.top - height - 5,
        };
        break;
      case isBottomAvailable:
        positionValue = {
          x: dockPos.right - width / 2 - this.dock.width / 2,
          y: dockPos.bottom + 5,
        };
        break;
      case isLeftAvailable && isRightAvailable:
        if (!isBottom) {
          if (height > imagePos.top) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top + 5,
            };
          } else if (height < dockPos.bottom) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.bottom - height,
            };
          } else {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top,
            };
          }
        } else if (isBottom) {
          if (height > canvas.height - imagePos.top) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top + 5,
            };
          } else if (height < dockPos.bottom) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.bottom - height,
            };
          } else {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top,
            };
          }
        }
        break;
      case isRightAvailable:
        if (!isBottom) {
          if (height > imagePos.top) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top + 5,
            };
          } else if (height < dockPos.bottom) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.bottom - height,
            };
          } else {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top,
            };
          }
        } else if (isBottom) {
          if (height > imagePos.top) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top + 5,
            };
          } else if (height < dockPos.bottom) {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.bottom - height,
            };
          } else {
            positionValue = {
              x: dockPos.right + 5,
              y: dockPos.top,
            };
          }
        }
        break;
      case isLeftAvailable:
        if (!isBottom) {
          if (height > imagePos.top) {
            positionValue = {
              x: dockPos.left - width - 5,
              y: dockPos.top,
            };
          } else if (height < dockPos.bottom) {
            positionValue = {
              x: dockPos.left - width - 5,
              y: dockPos.bottom - height,
            };
          } else {
            positionValue = {
              x: dockPos.left - width - 5,
              y: dockPos.top,
            };
          }
        } else if (isBottom) {
          if (height > imagePos.top) {
            positionValue = {
              x: dockPos.left - width - 5,
              y: dockPos.top,
            };
          } else if (height < dockPos.bottom) {
            positionValue = {
              x: dockPos.left - width - 5,
              y: dockPos.bottom - height,
            };
          } else {
            positionValue = {
              x: dockPos.left - width - 5,
              y: dockPos.top,
            };
          }
        }
        break;
      default:
        positionValue = {
          x: 0,
          y: 0,
        };
    }
    return positionValue;
  }

  ngOnInit(): void { }
}
