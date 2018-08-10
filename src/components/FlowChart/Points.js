import React from 'react';
import Style from './points.less';

export default class Point extends React.PureComponent {
  constructor(props) {
    super(props);
    const { smallArc } = this.props;
    this.state = {
      smallArc: smallArc || [],
    };
  }

  createArc = () => {
    const { ctx } = this;
    const { smallArc } = this.state;

    smallArc.forEach((item) => {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#883333';
      ctx.arc(item.x, item.y, 3, 0, 360, false);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    });
  };

  render() {
    const { width, height } = this.props;
    return (
      <div
        draggable={false}
        className={Style.shapeControls}
        style={{ width, height }}
        onMouseDown={(e) => {
          this.props.down(e);
        }}
        onMouseUp={(e) => {
          this.props.up(e);
        }}
      >
        <canvas
          width={width}
          height={height}
          ref={(e) => {
            if (e) {
              this.canvas = e;
              this.ctx = e.getContext('2d');
              const canvas = e;
              if (window.devicePixelRatio) {
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                canvas.height = height * window.devicePixelRatio;
                canvas.width = width * window.devicePixelRatio;
                this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
              }
              this.createArc();
            }
          }}
        />
      </div>
    );
  }
}
