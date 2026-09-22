import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  signal,
  ViewChild,
} from '@angular/core';

@Component({
  imports: [],
  selector: 'app-image-canvas',
  styleUrl: './image-canvas.scss',
  templateUrl: './image-canvas.html',
})
export class ImageCanvas implements AfterViewInit {
  @ViewChild('imageCanvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  // Input signal for image URL
  public readonly imageUrl = input<string | null>(null);

  private ctx!: CanvasRenderingContext2D;
  private image = new Image();

  public scale = signal<number>(1);
  public panX = signal<number>(0);
  public panY = signal<number>(0);
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  constructor() {
    // Reactively redraw whenever input image URL changes
    effect(() => {
      const url = this.imageUrl();
      if (url) {
        this.loadImage(url);
      }
    });
  }

  public ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvasToContainer();
  }

  // Automatically resize canvas buffer when window dimensions change
  @HostListener('window:resize')
  public onResize(): void {
    this.resizeCanvasToContainer();
  }

  private resizeCanvasToContainer(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Match internal canvas resolution to actual DOM container dimensions
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    this.redraw();
  }

  private loadImage(url: string): void {
    this.image.onload = () => {
      this.fitImageToContainer();
      this.redraw();
    };
    this.image.src = url;
  }

  // Automatically scale and center the image to fit the container view on load
  private fitImageToContainer(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!this.image.width || !this.image.height) return;

    const scaleX = canvas.width / this.image.width;
    const scaleY = canvas.height / this.image.height;

    // Use full min scale so the image stretches to the maximum possible container bounds
    const initialScale = Math.min(scaleX, scaleY);

    this.scale.set(Math.max(0.1, initialScale));
    this.panX.set(0);
    this.panY.set(0);
  }

  public redraw(): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();

    this.ctx.translate(canvas.width / 2 + this.panX(), canvas.height / 2 + this.panY());
    this.ctx.scale(this.scale(), this.scale());

    if (this.image.src) {
      const x = -this.image.width / 2;
      const y = -this.image.height / 2;
      this.ctx.drawImage(this.image, x, y);
    }

    this.ctx.restore();
  }

  public resetTransform(): void {
    this.fitImageToContainer();
    this.redraw();
  }

  public onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX - this.panX();
    this.startY = event.clientY - this.panY();
  }

  public onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.panX.set(event.clientX - this.startX);
    this.panY.set(event.clientY - this.startY);
    this.redraw();
  }

  public onMouseUp(): void {
    this.isDragging = false;
  }

  public onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = 1.1;
    let newScale = event.deltaY < 0 ? this.scale() * zoomFactor : this.scale() / zoomFactor;

    newScale = Math.max(0.1, Math.min(newScale, 20));
    this.scale.set(newScale);
    this.redraw();
  }
}
