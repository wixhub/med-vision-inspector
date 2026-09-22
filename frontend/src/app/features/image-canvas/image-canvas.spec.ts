import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCanvas } from './image-canvas';

describe('ImageCanvas', () => {
  let component: ImageCanvas;
  let fixture: ComponentFixture<ImageCanvas>;

  // Mock CanvasRenderingContext2D methods commonly used
  let mockCtx: {
    clearRect: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    translate: ReturnType<typeof vi.fn>;
    scale: ReturnType<typeof vi.fn>;
    drawImage: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      restore: vi.fn(),
    };

    // Stub getContext on HTMLCanvasElement since JSDOM does not implement full canvas
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );

    await TestBed.configureTestingModule({
      imports: [ImageCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCanvas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should resize canvas to container dimensions on view init or resize', () => {
    const canvasEl = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    // Mock parent client dimensions
    Object.defineProperty(canvasEl.parentElement, 'clientWidth', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(canvasEl.parentElement, 'clientHeight', {
      value: 600,
      configurable: true,
    });

    component.onResize();

    expect(canvasEl.width).toBe(800);
    expect(canvasEl.height).toBe(600);
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should redraw canvas correctly when requested', () => {
    component.redraw();

    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.translate).toHaveBeenCalled();
    expect(mockCtx.scale).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('should update scale and trigger redraw on mouse wheel event', () => {
    const initialScale = component.scale();
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100 }); // Zoom in

    // Spy on redraw
    const redrawSpy = vi.spyOn(component, 'redraw');

    component.onWheel(wheelEvent);

    expect(component.scale()).toBeGreaterThan(initialScale);
    expect(redrawSpy).toHaveBeenCalled();
  });

  it('should handle dragging state correctly (mousedown, mousemove, mouseup)', () => {
    const redrawSpy = vi.spyOn(component, 'redraw');

    // Simulate mouse down
    const mouseDownEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
    component.onMouseDown(mouseDownEvent);

    // Simulate mouse move (dragging)
    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 120 });
    component.onMouseMove(mouseMoveEvent);

    expect(component.panX()).toBe(50);
    expect(component.panY()).toBe(20);
    expect(redrawSpy).toHaveBeenCalled();

    // Simulate mouse up (stop dragging)
    component.onMouseUp();

    // Move again, pan values should not update further
    const mouseMoveEvent2 = new MouseEvent('mousemove', { clientX: 200, clientY: 200 });
    component.onMouseMove(mouseMoveEvent2);

    expect(component.panX()).toBe(50); // Unchanged after mouse up
  });

  it('should reset transform back to initial state', () => {
    component.scale.set(5);
    component.panX.set(100);
    component.panY.set(200);

    const fitSpy = vi.spyOn(component as any, 'fitImageToContainer');
    const redrawSpy = vi.spyOn(component, 'redraw');

    component.resetTransform();

    expect(fitSpy).toHaveBeenCalled();
    expect(redrawSpy).toHaveBeenCalled();
  });
});
