import React from 'react';

import { Icon, Modal, Tooltip } from 'antd';

import Points from './Points';
import RectCss from './Rect.less';

const { confirm } = Modal;


export default class Rect extends React.PureComponent {
  constructor(props) {
    super(props);
    const { style: { width, height } } = this.props;
    const { left, top } = { left: 5, top: 5 };
    this.state = {
      pointVisible: false,
      rectPosition: { x: left, y: top, w: (width - 10), h: (height - 10) },
      direction: null,
      visible: false,
      TooltipVisible: false,
      rectMove: false,
      keyDown: false,
      zIndex: 5,
    };
  }

  componentDidMount() {
    this.shapeControls.addEventListener('contextmenu', this.handleContextMenu);
    document.addEventListener('keyup', this.keyDelete);
  }

  componentWillUnmount() {
    this.shapeControls.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('keyup', this.keyDelete);
  }

  getArrowDirection = (e) => {
    const { rectPosition: { x, y, w, h } } = this.state;
    const ax = e.clientX - this.shapeControls.getBoundingClientRect().left;
    const ay = e.clientY - this.shapeControls.getBoundingClientRect().top;
    const direction = {
      top: ax >= x && ax <= x + w && ay >= y - 3 && ay <= y + 2,
      left: ay <= y + h && ay >= y && ax >= x - 3 && ax <= x + 2,
      bottom: ax >= x && ax <= x + w && ay >= (y + h) - 2 && ay <= y + h + 3,
      right: ax >= (x + w) - 2 && ax <= x + w + 3 && ay >= y && ay <= y + h,
    };

    let result = false;
    for (const i in direction) {
      if (direction[i]) {
        result = i;
      }
    }
    if (result) this.setState({ direction: result });
    return result;
  };

  getMouseLocation = (e) => {
    const cx = e.clientX;
    const cy = e.clientY;
    const { parentDom } = this.props;
    const sl = parentDom.getBoundingClientRect().left;
    const st = parentDom.getBoundingClientRect().top;
    const x = cx - sl;
    const y = cy - st;
    return { x, y };
  };

  rectMouseStyle = (e) => {
    if (this.getArrowDirection(e) && !this.state.rectMove) {
      this.props.setMouseStyle(2);
    } else {
      this.props.setMouseStyle(1);
    }
  };

  rectMove = (ev) => {
    const { keyDown } = this.state;
    if (keyDown) {
      const { x, y } = this.getMouseLocation(ev);
      const { step, editStep, style: { width, height }, parentDom } = this.props;
      const flowWidth = parseInt(parentDom.style.width, 10);
      const flowHeight = parseInt(parentDom.style.height, 10);
      let left = x - step.mOffsetX;
      let top = y - step.mOffsetY;
      left = left > 0 ? left : 0;
      top = top > 0 ? top : 0;
      left = x + step.mOffsetX > flowWidth ? flowWidth - width : left;
      top = y + step.mOffsetY > flowHeight ? flowHeight - height : top;

      const newStep = {
        ...step,
        x: left,
        y: top,
      };
      editStep(newStep, true);
    }
  };

  moveMouseDown = (e) => {
    const { x, y } = this.getMouseLocation(e);
    const { step, editStep } = this.props;
    const newStep = {
      ...step,
      mOffsetX: x - step.x,
      mOffsetY: y - step.y,
    };
    editStep(newStep);
    this.setState({ rectMove: true, keyDown: true, zIndex: 999 });
  };

  rectMouseDown = (e) => {
    if (e.button === 0) {
      this.setState({ visible: false });
      if (this.getArrowDirection(e)) {
        const { direction } = this.state;
        const { step, makeLine } = this.props;
        const keyDown = true;
        makeLine(step, direction, keyDown);
      } else {
        this.moveMouseDown(e);
      }
    }
  };

  rectMouseUp = (e) => {
    const keyDown = false;
    const { direction } = this.state;
    const { step, makeLine } = this.props;
    makeLine(step, direction, keyDown);
    this.setState({ rectMove: false, keyDown, zIndex: 5 });
    e.stopPropagation();
  };

  createRect = () => {
    const { rectPosition: { x, y, w, h } } = this.state;
    const { step } = this.props;
    const { ctx } = this;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const { data: { name } } = step;
    const text = name.length > 12 ? name.substr(0, 10) : name;
    ctx.fillText(text, 75, 42.5);
  };

  handleContextMenu = (event) => {
    event.preventDefault();
    this.setState({ visible: true });
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

  editFlow = () => {
    confirm({
      title: '确定修改该流程方案吗?',
      okText: '修改',
      cancelText: '取消',
      onOk: () => {
        const { editFlowChart, step } = this.props;
        editFlowChart(step.data);
      },
    });
  };

  keyDelete = (e) => {
    if (e.keyCode === 46) {
      if (this.state.pointVisible) {
        const { deleteStep, step } = this.props;
        deleteStep(step);
        e.stopPropagation();
      }
    }
  };

  render() {
    const {
      style: { width, height },
      style,
      num,
      step,
      deleteStep,
    } = this.props;
    const { visible, zIndex, TooltipVisible, pointVisible } = this.state;
    const rectStyle = { ...style, left: step.x, top: step.y, zIndex };
    return (
      <Tooltip title={step.data.description} visible={TooltipVisible}>
        <div
          draggable={false}
          ref={(ele) => {
            this.shapeControls = ele;
          }}
          style={rectStyle}
          onMouseEnter={() => {
            this.props.setMouseStyle(1);
            this.setState({ pointVisible: true, TooltipVisible: false });
          }}
          onMouseLeave={() => {
            this.props.setMouseStyle(0);
            this.setState({
              pointVisible: false,
              visible: false,
              rectMove: false,
              keyDown: false,
              TooltipVisible: false,
            });
          }}
          onMouseMove={(e) => {
            this.rectMouseStyle(e);
            this.rectMove(e);
          }}
          onDoubleClick={() => {
            this.setState({ TooltipVisible: !TooltipVisible });
          }}
        >
          <canvas
            ref={(ele) => {
              if (ele) {
                this.canvas = ele;
                this.ctx = ele.getContext('2d');
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.createRect();
              }
            }}
            width={width}
            height={height}
          />

          {
            pointVisible ? (
              <Points
                key={`l${num}points`}
                width={width}
                height={height}
                smallArc={this.props.smallArc}
                down={this.rectMouseDown}
                up={this.rectMouseUp}
              />
            ) : null
          }

          {
            visible ? (
              <div
                ref={(ref) => {
                  this.root = ref;
                }}
                className={RectCss.contextMenu}
              >
                <div
                  className={RectCss.option}
                  onClick={() => {
                    this.editFlow();
                  }}
                ><Icon type="edit" />&nbsp;&nbsp;&nbsp;编辑
                </div>
                <div
                  className={RectCss.option}
                  onClick={() => {
                    deleteStep(step);
                  }}
                ><Icon type="delete" />&nbsp;&nbsp;&nbsp;删除
                </div>
              </div>
            ) : null
          }
        </div>
      </Tooltip>
    );
  }
}

