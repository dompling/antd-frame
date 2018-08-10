/**
 * Created by Administrator on 2018/3/12.
 */
import React from 'react';

import { Icon, Modal } from 'antd';
import RectCss from './Rect.less';

const { confirm } = Modal;
const basicDistance = 20;
const margin = 20;

export default class LineView extends React.PureComponent {
  state = {
    visible: false,
    lineMove: false,
    confirmVisible: false,
  };

  componentDidMount() {
    document.addEventListener('keyup', this.keyDeleteLine);
    this.lineBox.addEventListener('contextmenu', this.handleContextMenu);
    const { setComponent } = this.props;
    if (setComponent) {
      setComponent({ ctx: this.ctx, canvas: this.canvas, num: this.props.num });
    }
  }

  componentWillUnmount() {
    this.lineBox.removeEventListener('contextmenu', this.handleContextMenu);
  }

  getDistance = (startPoint, endPoint) => {
    return {
      x: endPoint.x - startPoint.x,
      y: endPoint.y - startPoint.y,
    };
  };

  getCanvasSize = (pointGroup) => {
    let xMax;
    let xMin;
    let yMax;
    let yMin;
    pointGroup.forEach(({ x, y }) => {
      xMax = (!xMax || x > xMax) ? x : xMax;
      xMin = (!xMin || x < xMin) ? x : xMin;
      yMax = (!yMax || y > yMax) ? y : yMax;
      yMin = (!yMin || y < yMin) ? y : yMin;
    });

    return {
      offsetX: xMin - (margin / 2),
      offsetY: yMin - (margin / 2),
      width: (xMax - xMin) + margin,
      height: (yMax - yMin) + margin,
    };
  };

  createDraw = (pointGroup) => {
    const { ctx } = this;
    const { offsetX, offsetY } = this.getCanvasSize(pointGroup);
    const canvasPoints = pointGroup.map((item) => {
      let ax = item.x;
      let ay = item.y;
      ax -= offsetX;
      ay -= offsetY;
      return { x: ax, y: ay };
    });
    this.drawArrow(ctx, 25, 10, 2, '#2B2B2B', canvasPoints);
  };

  drawArrow = (ctx, t, h, w, c, points) => {
    const theta = typeof t !== 'undefined' ? t : 30;
    const headlen = typeof t !== 'undefined' ? h : 10;
    const width = typeof w !== 'undefined' ? w : 1;
    const color = c;

    const fromX = points[points.length - 2].x;
    const fromY = points[points.length - 2].y;
    const toX = points[points.length - 1].x;
    const toY = points[points.length - 1].y;

    const angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI;
    const angle1 = ((angle + theta) * Math.PI) / 180;
    const angle2 = ((angle - theta) * Math.PI) / 180;
    const topX = (headlen * Math.cos(angle1)) + 0.5;
    const topY = (headlen * Math.sin(angle1)) + 0.5;
    const botX = (headlen * Math.cos(angle2)) + 0.5;
    const botY = (headlen * Math.sin(angle2)) + 0.5;

    ctx.beginPath();
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });

    let arrowX;
    let arrowY;
    arrowX = toX + topX;
    arrowY = toY + topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(toX, toY);
    arrowX = toX + botX;
    arrowY = toY + botY;
    ctx.lineTo(arrowX, arrowY);

    if (this.props.current) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ce8c8c';
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.moveTo(0, 0);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineWidth = 10;
  };

  makePointGroup = () => {
    const { startPoint, endPoint } = this.computePointDirection();
    const pointS1 = startPoint;
    const pointS2 = this.makeNearByPoint(startPoint);
    const pointE2 = this.makeNearByPoint(endPoint);

    const pointE1 = endPoint;
    const { pointS3, pointE3 } = this.makePoint3(pointS1, pointS2, pointE2, pointE1);
    return [pointS1, pointS2, pointS3, pointE3, pointE2, pointE1];
  };

  computePointDirection() {
    const { startPoint, endPoint } = this.props;
    const distance = this.getDistance(startPoint, endPoint);
    let startDirection = startPoint.direction;
    let endDirection = endPoint.direction;
    if (startDirection === null) {
      if (Math.abs(distance.x) >= Math.abs(distance.y)) {
        startDirection = distance.x >= 0 ? 'right' : 'left';
      } else {
        startDirection = distance.y >= 0 ? 'bottom' : 'top';
      }
    }
    if (endDirection === null) {
      if (Math.abs(distance.x) >= Math.abs(distance.y)) {
        endDirection = distance.x >= 0 ? 'left' : 'right';
      } else {
        endDirection = distance.y >= 0 ? 'top' : 'bottom';
      }
    }
    return {
      startPoint: { ...startPoint, direction: startDirection },
      endPoint: { ...endPoint, direction: endDirection },
    };
  }

  makeNearByPoint = (point) => {
    let responsePoint;
    switch (point.direction) {
      case 'top':
        responsePoint = { x: point.x, y: point.y - basicDistance };
        break;
      case 'right':
        responsePoint = { x: point.x + basicDistance, y: point.y };
        break;
      case 'bottom':
        responsePoint = { x: point.x, y: point.y + basicDistance };
        break;
      case 'left':
        responsePoint = { x: point.x - basicDistance, y: point.y };
        break;
      default:
        break;
    }
    return responsePoint;
  };

  makePoint3 = (pointS1, pointS2, pointE2, pointE1) => {
    const S1d = pointS1.direction;
    const E1d = pointE1.direction;
    const S2x = pointS2.x;
    const S2y = pointS2.y;
    const E2x = pointE2.x;
    const E2y = pointE2.y;
    let S3x = S2x;
    let S3y = S2y;
    let E3x = E2x;
    let E3y = E2y;
    switch (`${S1d}-${E1d}`) {
      case 'top-top':
        E3y = S2y > E2y ? E2y : S2y;
        S3y = S2y > E2y ? E2y : S2y;
        break;
      case 'top-right':
        if (S2y > E2y && S2x > E2x) {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        } else {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        }
        break;
      case 'top-bottom':
        if (S2y > E2y) {
          E3y = Math.floor((S2y + E2y) / 2);
          S3y = E3y;
        } else {
          S3x = Math.floor((S2x + E2x) / 2);
          E3x = S3x;
        }
        break;
      case 'top-left':
        if (S2y > E2y && S2x < E2x) {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        } else {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        }
        break;

      case 'right-top':
        if (S2y < E2y && S2x < E2x) {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        } else {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        }
        break;
      case 'right-right':
        E3x = S2x < E2x ? E2x : S2x;
        S3x = E3x;
        break;
      case 'right-bottom':
        if (S2y > E2y && S2x < E2x) {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        } else {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        }
        break;
      case 'right-left':
        if (S2x > E2x) {
          S3y = Math.floor((S2y + E2y) / 2);
          E3y = S3y;
        } else {
          E3x = Math.floor((S2x + E2x) / 2);
          S3x = E3x;
        }
        break;
      case 'bottom-top':
        if (S2y < E2y) {
          E3y = Math.floor((S2y + E2y) / 2);
          S3y = E3y;
        } else {
          E3x = Math.floor((S2x + E2x) / 2);
          S3x = E3x;
        }
        break;
      case 'bottom-right':
        if (S2y < E2y && S2x > E2x) {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        } else {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        }
        break;
      case 'bottom-bottom':
        E3y = S2y < E2y ? E2y : S2y;
        S3y = E3y;
        break;
      case 'bottom-left':
        if (S2y < E2y && S2x < E2x) {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        } else {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        }
        break;
      case 'left-top':
        if (S2y < E2y && S2x > E2x) {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        } else {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        }
        break;
      case 'left-right':
        if (S2x < E2x) {
          E3y = Math.floor((S2y + E2y) / 2);
          S3y = E3y;
        } else {
          E3x = Math.floor((S2x + E2x) / 2);
          S3x = E3x;
        }
        break;
      case 'left-bottom':
        if (S2y > E2y && S2x > E2x) {
          S3x = E2x;
          E3x = E2x;
          S3y = S2y;
          E3y = S2y;
        } else {
          S3x = S2x;
          E3x = S2x;
          S3y = E2y;
          E3y = E2y;
        }
        break;
      case 'left-left':
        E3x = S2x > E2x ? E2x : S2x;
        S3x = E3x;
        break;
      default:
        break;
    }
    const pointS3 = { x: S3x, y: S3y };
    const pointE3 = { x: E3x, y: E3y };
    return { pointS3, pointE3 };
  };

  LineViewMouseMove = (ev) => {
    const pointGroup = this.makePointGroup();
    const { offsetX, offsetY } = this.getCanvasSize(pointGroup);
    const e = ev || window.event;
    const x = (e.clientX - this.lineBox.getBoundingClientRect().left) + offsetX;
    const y = (e.clientY - this.lineBox.getBoundingClientRect().top) + offsetY;
    const ax = pointGroup[pointGroup.length - 1].x;
    const ay = pointGroup[pointGroup.length - 1].y;
    if (x >= ax - margin && x <= ax + margin && y >= ay - margin && y <= ay + margin) {
      this.props.setMouseStyle(1);
    } else {
      this.handleLinesComponent(e);
    }
  };

  lineMouseDown = (e) => {
    const { lineMouseDown, checkMouseStyle, num } = this.props;
    const cursor = checkMouseStyle();
    this.setState({ lineMove: true });
    if (cursor.name === 'move') {
      lineMouseDown(e, num);
    }
  };

  lineMouseUp = (e) => {
    const { lineMouseUp, checkMouseStyle, num } = this.props;
    const cursor = checkMouseStyle();
    this.setState({ lineMove: false });
    if (cursor.name === 'pointer') {
      lineMouseUp(e, num);
    }
  };

  checkContextMenu = () => {
    this.setState({ visible: false });
  };

  handleContextMenu = (event) => {
    event.preventDefault();
    const cursor = this.props.checkMouseStyle();
    if (cursor.name === 'pointer') {
      this.setState({ visible: true });
    } else {
      this.setState({ visible: false });
    }
    const clickX = event.clientX;
    const clickY = event.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = this.root.offsetWidth;
    const rootH = this.root.offsetHeight;

    const right = (screenW - clickX) > rootW;
    const left = !right;
    const top = (screenH - clickY) > rootH;
    const bottom = !top;

    if (right) {
      this.root.style.left = `${clickX + 5}px`;
    }

    if (left) {
      this.root.style.left = `${clickX - rootW - 5}px`;
    }

    if (top) {
      this.root.style.top = `${clickY + 5}px`;
    }

    if (bottom) {
      this.root.style.top = `${clickY - rootH - 5}px`;
    }
  };

  deleteLine = () => {
    const { line, deleteLine } = this.props;
    confirm({
      title: '确定要删除流程关系吗?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        this.setState({ confirmVisible: false }, () => {
          deleteLine(line);
        });
      },
      onCancel: () => {
        this.setState({ confirmVisible: false });
      },
    });
  };

  keyDeleteLine = (e) => {
    const { confirmVisible } = this.state;
    if (e.keyCode === 46 && this.props.current && this.props.line && !confirmVisible) {
      this.setState({ confirmVisible: true }, () => {
        this.deleteLine();
      });
    }
  };

  windowToCanvas = (canvas, x, y) => {
    const bbox = canvas.getBoundingClientRect();
    return {
      x: x - (bbox.left * (canvas.width / canvas.width)),
      y: y - (bbox.top * (canvas.height / canvas.height)),
    };
  };

  handleLinesComponent = (e) => {
    const { components, setMouseStyle, updateTopLine } = this.props;
    if (components) {
      const mx = e.clientX;
      const my = e.clientY;
      components.every((item, i) => {
        const { x, y } = this.windowToCanvas(item.canvas, mx, my);
        const inPath = item.ctx.isPointInStroke(x, y);
        if (inPath) {
          updateTopLine(i);
          setMouseStyle(3);
          return false;
        } else {
          updateTopLine(null);
        }
        setMouseStyle(0);
        return true;
      });
    }
  };

  render() {
    const pointGroup = this.makePointGroup();
    const res = this.getCanvasSize(pointGroup);
    const { visible } = this.state;
    const { setMouseStyle, topLine } = this.props;
    const vsb = visible ? 'block' : 'none';
    return (
      <div
        draggable={false}
        ref={(e) => {
          this.lineBox = e;
        }}
        style={{
          position: 'absolute',
          left: res.offsetX,
          top: res.offsetY,
          zIndex: topLine ? 4 : 0,
        }}
        onMouseMove={(e) => {
          this.LineViewMouseMove(e);
        }}
        onMouseLeave={() => {
          if (!this.state.lineMove) {
            setMouseStyle(0);
          }
        }}
        onMouseDown={(e) => {
          this.lineMouseDown(e);
        }}
        onMouseUp={(e) => {
          this.lineMouseUp(e);
        }}
        onClick={() => {
          this.setState({ visible: false });
        }}
      >
        <canvas
          ref={(e) => {
            if (e) {
              this.canvas = e;
              this.ctx = e.getContext('2d');
              const canvas = e;
              const { width, height } = res;
              if (window.devicePixelRatio) {
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                canvas.height = height * window.devicePixelRatio;
                canvas.width = width * window.devicePixelRatio;
                this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
              }

              this.createDraw(pointGroup);
            }
          }}
          width={res.width}
          height={res.height}
        />
        <div
          ref={(ref) => {
            this.root = ref;
          }}
          className={RectCss.contextMenu}
          style={{ display: vsb }}
        >
          <div
            className={RectCss.option}
            onClick={() => {
              this.deleteLine();
            }}
          ><Icon type="delete" />&nbsp;&nbsp;&nbsp;删除
          </div>
        </div>
      </div>
    );
  }
}
