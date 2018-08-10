/**
 * Created by Administrator on 2018/3/12.
 */
import React from 'react';

import { message, Modal } from 'antd';

import Rect from './Rect';
import LineView from './LineView';

const { confirm } = Modal;

const rectWidth = 150;
const rectHeight = 75;
const flowWidth = 1500;
const flowHeight = 800;
const { allWidth, allHeight } = {
  allWidth: rectWidth / 2,
  allHeight: rectHeight / 2,
};

const smallArc = [
  {
    x: allWidth,
    y: 5,
    direction: 'top',
  }, {
    x: rectWidth - 5,
    y: allHeight,
    direction: 'right',
  }, {
    x: allWidth,
    y: rectHeight - 5,
    direction: 'bottom',
  }, {
    x: 5,
    y: allHeight,
    direction: 'left',
  },
];

const initLine = {
  startPoint: null,
  endPoint: null,
  from: {
    step_key: null,
    offsetX: null,
    offsetY: null,
  },
  to: {
    step_key: null,
    offsetX: null,
    offsetY: null,
  },
};

export default class FlowChart extends React.PureComponent {
  constructor(props) {
    super(props);

    const mouseStyle = [
      {
        name: 'default',
        value: true,
      },
      {
        name: 'move',
        value: false,
      },
      {
        name: 'crosshair',
        value: false,
      },
      {
        name: 'pointer',
        value: false,
      },
      {
        name: 'e-resize',
        value: false,
      },
    ];
    this.state = {
      ctx: {},
      topLine: null,
      currentLine: null,
      flowCharts: [],
      lines: [],
      drawingLine: initLine,
      mouseStyle,
      components: [],
    };
  }

  componentDidMount() {
    this.initCanvas();
    if (this.props.steps.length > 0) {
      const { steps } = this.props;
      const newFlowCharts = [];
      this.getFlowChart(steps, newFlowCharts);
      const lines = this.getLines(newFlowCharts);
      this.state.flowCharts = newFlowCharts;
      this.state.lines = lines;
    }
    document.addEventListener('mouseup', this.clearCurrent);
  }

  componentWillReceiveProps(nextProps) {
    const { steps } = nextProps;
    if (steps !== this.props.steps) {
      const { flowCharts } = this.state;
      if (flowCharts.length === 0) {
        const newFlowCharts = [];
        this.getFlowChart(steps, newFlowCharts);
        const lines = this.getLines(newFlowCharts);
        this.setState({ flowCharts: newFlowCharts, lines });
      } else {
        const stepKey = flowCharts.map(item => item.data.step_key);
        const newFlowChart = steps.map((item) => {
          const step = { x: 0, y: 0, data: item };
          const stepIndex = stepKey.indexOf(item.step_key);
          if (stepIndex !== -1) {
            step.x = flowCharts[stepIndex].x;
            step.y = flowCharts[stepIndex].y;
          }
          return step;
        });
        this.setState({ flowCharts: newFlowChart });
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyDelete);
    document.removeEventListener('mouseup', this.clearCurrent);
    this.vessel.removeEventListener('mousemove', this.traverseComponent);
  }

  getFlowChart = (steps, flowCharts) => {
    let firstStep = {};
    const newSteps = steps.filter((step) => {
      if (step.prev_step_key.length === 0) {
        firstStep = {
          x: 120,
          y: 100,
          data: step,
        };
      }
      return step.prev_step_key.length !== 0;
    });
    flowCharts.push(firstStep);
    this.getNextStep(newSteps, firstStep, flowCharts);
  };

  getNextStep = (steps, preStep, flowCharts) => {
    if (preStep.data) {
      steps.forEach((item) => {
        const n = preStep.data.next_step_key.indexOf(item.step_key);
        if (n !== -1) {
          const stepKey = flowCharts.map(f => f.data.step_key);
          const s = stepKey.indexOf(item.step_key);
          const temp = {
            x: preStep.x + rectWidth + 60,
            y: preStep.y + (n * 2 * rectHeight),
            data: item,
          };
          flowCharts.push(temp);
          if (s !== -1) {
            flowCharts.splice(s, 1);
          } else {
            this.getNextStep(steps, temp, flowCharts);
          }
        }
      });
    }
  };

  getLines = (flowCharts) => {
    const stepsKey = flowCharts.map(({ data }) => {
      return data.step_key;
    });
    const lines = [];
    flowCharts.forEach((item) => {
      item.data.next_step_key.forEach((stepKey) => {
        const nextStep = stepsKey.indexOf(stepKey);
        if (nextStep !== -1) {
          const line = this.getPoint(item, flowCharts[nextStep]);
          lines.push(line);
        }
      });
    });
    return lines;
  };

  getPoint = (start, end) => {
    let startDirect = 'right';
    let endDirect = 'left';

    const fromData = start.data;
    const toData = end.data;

    if (fromData.x === toData.x && fromData.y < toData.y) {
      startDirect = 'bottom';
      endDirect = 'top';
    } else if (fromData.x === toData.x && fromData.y > toData.y) {
      startDirect = 'top';
      endDirect = 'bottom';
    }
    const { startPoint, from } = this.makerDrawingLine('startPoint', 'from', start, startDirect);
    const { endPoint, to } = this.makerDrawingLine('endPoint', 'to', end, endDirect);

    return {
      startPoint,
      from,
      endPoint,
      to,
    };
  };

  setMouseStyle = (m) => {
    const { mouseStyle } = this.state;
    const newMouseStyle = mouseStyle.map((item, i) => {
      let temp = {};
      if (i === m) {
        temp = { ...item, value: true };
      } else {
        temp = { ...item, value: false };
      }
      return temp;
    });
    this.setState({ mouseStyle: newMouseStyle });
  };

  setLines = (drawingLine) => {
    const { lines } = this.state;
    const pushAble = this.checkLines(drawingLine);
    if (!pushAble) {
      message.error('流程关系不存在（重复、循环、自立）关系！');
    } else {
      const prevStepKey = drawingLine.from.step_key;
      const nextStepKey = drawingLine.to.step_key;

      if (drawingLine.from.step_key && drawingLine.to.step_key) {
        this.makeStepsRelation(prevStepKey, nextStepKey);
      }
      lines.push(drawingLine);
    }
    this.setState({
      lines,
      drawingLine: initLine,
    });
  };

  getMouseLocation = (e) => {
    const cx = e.clientX;
    const cy = e.clientY;
    const sl = this.vessel.getBoundingClientRect().left;
    const st = this.vessel.getBoundingClientRect().top;
    const x = cx - sl;
    const y = cy - st;
    return { x, y };
  };

  initCanvas = () => {
    this.setState({ ctx: this.BackgroundCanvas.getContext('2d') }, () => {
      const { width, height } = this.BackgroundCanvas;
      const { ctx } = this.state;
      const step = 10;
      const strokeStyle = '#eee';

      const canvas = this.BackgroundCanvas;

      if (window.devicePixelRatio) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.height = height * window.devicePixelRatio;
        canvas.width = width * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      for (let x = 0.5; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      for (let y = 0.5; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    });
  };

  checkMouseStyle = () => {
    const { mouseStyle } = this.state;
    let cursor = null;
    for (let i = 0; i < mouseStyle.length; i += 1) {
      const item = mouseStyle[i];
      if (item.value) {
        cursor = item;
      }
    }
    if (!cursor) {
      cursor = { name: 'default' };
    }
    return cursor;
  };

  checkLines = ({ from, to }) => {
    const { lines } = this.state;
    let pushAble = true;
    if (from.step_key && to.step_key) {
      const pushLines = [];
      lines.forEach((item, i) => {
        if (
          (item.from.step_key === from.step_key && item.to.step_key === to.step_key)
          ||
          (item.from.step_key === to.step_key && item.to.step_key === from.step_key)
        ) {
          pushLines.push(i);
        }
      });
      if ((from.step_key === to.step_key) || pushLines.length > 0) pushAble = false;
    }
    return pushAble;
  };

  makeComponentLine = (ele) => {
    const { components } = this.state;
    components.push(ele);
    this.setState({ components });
  };

  handleMouseMove = (e) => {
    const { drawingLine: { startPoint } } = this.state;
    if (startPoint) {
      const { x, y } = this.getMouseLocation(e);
      this.setState({
        drawingLine: {
          ...this.state.drawingLine,
          endPoint: { x, y, direction: null },
        },
        currentLine: null,
      });
    }
  };

  handleMouseUp = () => {
    const { drawingLine, drawingLine: { startPoint, endPoint } } = this.state;
    if (startPoint && endPoint) {
      this.setLines(drawingLine);
    }
  };

  clearCurrent = () => {
    const cursor = this.checkMouseStyle();
    if (cursor.name === 'default') {
      this.setState({ currentLine: null });
    }
  };

  editStep = (newStep, updateLine = false) => {
    const { flowCharts } = this.state;
    const newFlowChart = flowCharts.map((item) => {
      const step = { ...item };
      if (step.data.step_key === newStep.data.step_key) {
        return newStep;
      }
      return step;
    });
    const newState = { flowCharts: newFlowChart };
    if (updateLine) {
      const newLines = this.updateLinesLocation(newStep);
      newState.lines = newLines;
    }
    this.setState({ ...newState });
  };

  deleteStep = (deleteStep) => {
    const { currentLine, flowCharts } = this.state;
    if (currentLine === null) {
      confirm({
        title: '确定要删除步骤和它的关系吗?',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          const newFlowCharts = flowCharts.map((item) => {
            const next = item.data.next_step_key;
            const prev = item.data.prev_step_key;
            const nextStepKey = next.filter(n => n !== deleteStep.data.step_key);
            const prevStepKey = prev.filter(n => n !== deleteStep.data.step_key);
            return {
              ...item,
              data: {
                ...item.data,
                next_step_key: nextStepKey,
                prev_step_key: prevStepKey,
              },
            };
          });

          const newFlows = newFlowCharts.filter((item) => {
            return item.data.step_key !== deleteStep.data.step_key;
          });
          const newSteps = newFlows.map(item => item.data);
          this.props.updateSteps(newSteps);

          const newLines = this.getLines(newFlows);
          this.setState({ lines: newLines });
        },
      });
    }
  };

  updateLinesLocation = ({ x, y, data }) => {
    const { lines } = this.state;
    const newLines = lines.map((item) => {
      let { startPoint, endPoint } = item;
      if (item.from.step_key === data.step_key) {
        startPoint = {
          ...startPoint,
          x: x + item.from.offsetX,
          y: y + item.from.offsetY,
        };
      }
      if (item.to && item.to.step_key === data.step_key) {
        endPoint = {
          ...endPoint,
          x: x + item.to.offsetX,
          y: y + item.to.offsetY,
        };
      }
      return {
        ...item,
        startPoint,
        endPoint,
      };
    });
    return newLines;
  };

  updateTopLine = (topLine) => {
    this.setState({ topLine });
  };

  editLine = (e, num) => {
    const { lines } = this.state;

    const preStepKey = lines[num].from.step_key;
    const nexStepKey = lines[num].to.step_key;

    if (preStepKey && nexStepKey) {
      this.clearStepsRelation(preStepKey, nexStepKey);
    }

    const drawingLine = { ...lines[num], to: { step_key: null, offsetX: null, offsetY: null } };
    const newLines = lines.filter((item, i) => {
      return i !== num;
    });

    this.setState({ drawingLine, lines: [...newLines] });
  };

  editCurrentLine = (e, num) => {
    this.setState({ currentLine: num });
  };

  makeLine = (step, direction, status) => {
    const { drawingLine: { startPoint } } = this.state;
    if (status) {
      const drawingLine = this.makerDrawingLine('startPoint', 'from', step, direction);
      this.setState({ drawingLine });
    } else if (startPoint && !status) {
      const drawingLine = this.makerDrawingLine('endPoint', 'to', step, direction);
      this.setLines(drawingLine);
    }
  };

  makerDrawingLine = (point, place, { x, y, data }, direction) => {
    const selectPoint = smallArc.filter(arc => arc.direction === direction)[0];
    return {
      ...this.state.drawingLine,
      [point]: {
        x: x + selectPoint.x,
        y: y + selectPoint.y,
        direction,
      },
      [place]: {
        step_key: data.step_key,
        offsetX: selectPoint.x,
        offsetY: selectPoint.y,
      },
    };
  };

  deleteLine = (deleteLine) => {
    const { lines } = this.state;
    const preStepKey = deleteLine.from.step_key;
    const nexStepKey = deleteLine.to.step_key;
    if (preStepKey && nexStepKey) {
      this.clearStepsRelation(preStepKey, nexStepKey);
    }
    const newLines = lines.filter((item) => {
      return item !== deleteLine;
    });
    this.setState({ lines: newLines, currentLine: null });
  };

  makeStepsRelation = (preStepKey, nexStepKey) => {
    const { flowCharts } = this.state;
    const newSteps = flowCharts.map((item) => {
      const step = { ...item.data };
      const nextStepKey = [...step.next_step_key] || [];
      if (step.step_key === preStepKey) {
        nextStepKey.push(nexStepKey);
      }
      step.next_step_key = [...nextStepKey];
      const prevStepKey = [...step.prev_step_key] || [];
      if (step.step_key === nexStepKey) {
        prevStepKey.push(preStepKey);
      }
      step.prev_step_key = [...prevStepKey];
      return step;
    });
    this.props.updateSteps(newSteps);
  };

  clearStepsRelation = (preStepKey, nextStepKey) => {
    const { flowCharts } = this.state;
    const newSteps = flowCharts.map((item) => {
      const step = { ...item.data };
      if (step.step_key === preStepKey) {
        step.next_step_key = step.next_step_key.filter(next => next !== nextStepKey);
      }

      if (step.step_key === nextStepKey) {
        step.prev_step_key = step.prev_step_key.filter(prev => prev !== preStepKey);
      }
      return step;
    });
    this.props.updateSteps(newSteps);
  };

  render() {
    const {
      currentLine,
      drawingLine: { startPoint, endPoint },
      topLine,
      flowCharts,
      lines,
      components,
    } = this.state;
    const cursor = this.checkMouseStyle();
    const rectList = flowCharts.map((item, i) => {
      const rectStyle = {
        position: 'absolute',
        width: rectWidth,
        height: rectHeight,
      };
      return (
        <Rect
          num={i}
          key={item.data.step_key}
          style={rectStyle}
          step={item}
          smallArc={smallArc}
          setMouseStyle={this.setMouseStyle}
          parentDom={this.vessel}
          makeLine={this.makeLine}
          editStep={this.editStep}
          deleteStep={this.deleteStep}
          editFlowChart={this.props.editStep}
        />
      );
    });

    const liveViews = lines.map((item, i) => {
      const k = `c${i}`;
      return (
        <LineView
          key={k}
          num={i}
          ref={(e) => {
            this[k] = e;
          }}
          line={item}
          current={currentLine === i}
          topLine={topLine === i}
          components={components}
          updateTopLine={this.updateTopLine}
          setComponent={this.makeComponentLine}
          setMouseStyle={this.setMouseStyle}
          checkMouseStyle={this.checkMouseStyle}
          lineMouseUp={this.editCurrentLine}
          lineMouseDown={this.editLine}
          deleteLine={this.deleteLine}
          startPoint={item.startPoint}
          endPoint={item.endPoint}
        />
      );
    });

    return (
      <div
        draggable={false}
        ref={(e) => {
          this.vessel = e;
        }}
        style={{ position: 'relative', cursor: cursor.name, width: flowWidth, height: flowHeight }}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onSelect={() => {
          return false;
        }}
        onClick={() => {
          if (cursor.name === 'default') {
            this.setState({ currentLine: null }, () => {
              if (lines.length > 0) {
                lines.forEach((item, i) => {
                  this[`c${i}`].checkContextMenu();
                });
              }
            });
          }
        }}
      >
        <canvas
          ref={(e) => {
            this.BackgroundCanvas = e;
          }}
          width={flowWidth}
          height={flowHeight}
        />
        {liveViews}
        {
          startPoint && endPoint && (
            <LineView
              current="drawingLine"
              num={-1}
              lineMouseDown={this.lineMouseDown}
              lineMouseUp={this.lineMouseUp}
              setMouseStyle={this.setMouseStyle}
              checkMouseStyle={this.checkMouseStyle}
              startPoint={startPoint}
              endPoint={endPoint}
            />
          )
        }
        {rectList}
      </div>
    );
  }
}
