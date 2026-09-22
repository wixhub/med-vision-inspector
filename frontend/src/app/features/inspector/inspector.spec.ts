import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Inspector } from './inspector';
import { InspectorService } from '../../core/services/inspector.service';
import { of, throwError } from 'rxjs';

describe('Inspector Component', () => {
  let component: Inspector;
  let fixture: ComponentFixture<Inspector>;
  let inspectorServiceMock: { inspectImage: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    // Mock global fetch to prevent URL parsing errors during component init
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['dummy-demo-image'], { type: 'image/jpeg' })),
      }),
    );

    // Create a mock for InspectorService
    inspectorServiceMock = {
      inspectImage: vi.fn().mockReturnValue(
        of({
          blob: new Blob(['fake-image-data'], { type: 'image/jpeg' }),
          confidence: 0.92,
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Inspector],
      providers: [{ provide: InspectorService, useValue: inspectorServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Inspector);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the inspector component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle local user file selection correctly', async () => {
    // Wait for initial ngOnInit fetch/FileReader to settle completely
    await new Promise((resolve) => setTimeout(resolve, 50));

    const file = new File(['dummy-content'], 'test_scan.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    // Wait for the user FileReader onload callback to execute
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.state().selectedFile).toEqual(file);
    expect(component.state().fileName).toBe('test_scan.jpg');
    expect(component.state().errorMessage).toBeNull();
  });

  it('should process image successfully via backend inference pipeline', () => {
    const file = new File(['dummy-content'], 'test_scan.jpg', { type: 'image/jpeg' });
    component.state.update((curr) => ({ ...curr, selectedFile: file }));

    component.processImage();

    expect(inspectorServiceMock.inspectImage).toHaveBeenCalledWith(file);
    expect(component.state().isLoading).toBe(false);
    expect(component.state().confidence).toBe(0.92);
    expect(component.state().resultImageUrl).toBeTruthy();
  });

  it('should handle backend inference pipeline error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    inspectorServiceMock.inspectImage.mockReturnValue(throwError(() => new Error('Server error')));

    const file = new File(['dummy-content'], 'test_scan.jpg', { type: 'image/jpeg' });
    component.state.update((curr) => ({ ...curr, selectedFile: file }));

    component.processImage();

    expect(component.state().isLoading).toBe(false);
    expect(component.state().errorMessage).toBe(
      'Failed to process image through backend inference pipeline.',
    );

    consoleSpy.mockRestore();
  });
});
