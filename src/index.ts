interface ScaleData {
  xOldStart: number;
  xOldEnd: number;
  xOldRange: number;
  yOldStart: number;
  yOldEnd: number;
  yOldRange: number;
  xNewStart: number;
  xNewEnd: number;
  xNewRange: number;
  yNewStart: number;
  yNewEnd: number;
  yNewRange: number;
}
type Interval = [number, number][];

export class SmartScale {
  bgPath: string;
  xInterval: [number, number][];
  yInterval: [number, number][];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
  bgHeight: number = 0;
  bgWidth: number = 0;
  ratio: number = 1;
  constructor(
    bgPath: string,
    xInterval: [number, number][],
    yInterval: [number, number][],
    canvas: HTMLCanvasElement,
    ratio?: number
  ) {
    this.bgPath = bgPath;
    this.xInterval = xInterval;
    this.yInterval = yInterval;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.img = new Image();
    this.ratio = ratio || 1
    this.init()
  }

  init() {
    this.img.src = this.bgPath;
    this.img.onload = () => {
      this.bgHeight = this.img.height;
      this.bgWidth = this.img.width;
      this.setCanvasSize();
      this.draw(this.calcRatioData());
    };
  }

  setCanvasSize() {
    this.canvas.height = this.canvas.clientHeight / this.ratio;
    this.canvas.width = this.canvas.clientWidth / this.ratio;
  }

  calcRange(interval: Interval, size: number, newSize: number) {
    const arr: {
      start: number;
      end: number;
      range: number;
      newRange: number;
      canScale: boolean;
      newStart: number;
      newEnd: number;
    }[] = [];
    for (let i = 0; i < interval.length; i += 1) {
      const currentInterval = interval[i];
      const start = i === 0 ? 0 : interval[i - 1][1];
      const end = currentInterval[0];
      if (end > start) {
        arr.push({
          start: start,
          end: end,
          range: end - start,
          newRange: end - start,
          canScale: false,
          newStart: 0,
          newEnd: 0,
        });
      }
      arr.push({
        start: currentInterval[0],
        end: currentInterval[1],
        range: currentInterval[1] - currentInterval[0],
        newRange: 0,
        canScale: true,
        newStart: 0,
        newEnd: 0,
      });
      if (i === interval.length - 1 && currentInterval[1] < size) {
        arr.push({
          start: currentInterval[1],
          end: size,
          range: size - currentInterval[1],
          newRange: size - currentInterval[1],
          canScale: false,
          newStart: 0,
          newEnd: 0,
        });
      }
    }
    const aSum = interval.reduce(
      (sum: number, value: [number, number]) => {
        sum += value[1] - value[0];
        return sum;
      },
      0
    );
    const ratio = (aSum + (newSize - size)) / aSum;
    for (let i = 0; i < arr.length; i += 1) {
      const currentItem = arr[i];
      if (i === 0) {
        if (currentItem.canScale) {
          currentItem.newRange = Math.round(currentItem.range * ratio);
          currentItem.newStart = currentItem.start;
          currentItem.newEnd = currentItem.start + currentItem.newRange;
        } else {
          currentItem.newRange = currentItem.range;
          currentItem.newStart = currentItem.start;
          currentItem.newEnd = currentItem.end;
        }
      } else {
        const preItem = arr[i - 1];
        if (currentItem.canScale) {
          currentItem.newRange = Math.round(currentItem.range * ratio);
          currentItem.newStart = preItem.newEnd;
          currentItem.newEnd = currentItem.newStart! + currentItem.newRange;
        } else {
          currentItem.newRange = currentItem.range;
          currentItem.newStart = preItem.newEnd;
          currentItem.newEnd = currentItem.newStart! + currentItem.newRange;
        }
      }
    }
    return arr;
  }

  calcRatioData() {
    const xArr = this.calcRange(
      this.xInterval,
      this.bgWidth,
      this.canvas.clientWidth / this.ratio
    );
    const yArr = this.calcRange(
      this.yInterval,
      this.bgHeight,
      this.canvas.clientHeight / this.ratio
    );
    const result: ScaleData[] = [];
    yArr.forEach((yItem) => {
      xArr.forEach((xItem) => {
        const item = {
          xOldStart: xItem.start,
          xOldEnd: xItem.end,
          xOldRange: xItem.range,
          xNewStart: xItem.newStart!,
          xNewEnd: xItem.newEnd!,
          xNewRange: xItem.newRange,
          yOldStart: yItem.start,
          yOldEnd: yItem.end,
          yOldRange: yItem.range,
          yNewStart: yItem.newStart!,
          yNewEnd: yItem.newEnd!,
          yNewRange: yItem.newRange,
        };
        result.push(item);
      });
    });
    return result;
  }
  draw(scaleData: ScaleData[]) {
    for (let i = 0; i < scaleData.length; i += 1) {
      const item = scaleData[i];
      this.ctx.drawImage(
        this.img,
        item.xOldStart,
        item.yOldStart,
        item.xOldRange,
        item.yOldRange,
        item.xNewStart,
        item.yNewStart,
        item.xNewRange,
        item.yNewRange
      );
    }
  }

  changeBgImg(bgPath: string) {
    this.bgPath = bgPath;
    this.img = new Image();
    this.img.onload = () => {
      this.bgHeight = this.img.height;
      this.bgWidth = this.img.width;
      this.resizeHandle()
    };
  }

  resizeHandle() {
    this.setCanvasSize();
    this.draw(this.calcRatioData());
  }

  setRatio(ratio: number) {
    this.ratio = ratio
    this.resizeHandle()
  }
}
