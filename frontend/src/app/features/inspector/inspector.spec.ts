import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Inspector } from './inspector';
import { InspectorService } from '../../core/services/inspector.service';

describe('Inspector', () => {
  let component: Inspector;
  let fixture: ComponentFixture<Inspector>;
  let inspectorServiceMock: { inspectImage: ReturnType<typeof vi.fn> };

  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(async () => {
    inspectorServiceMock = {
      inspectImage: vi.fn(),
    };

    URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
    URL.revokeObjectURL = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Inspector],
      providers: [{ provide: InspectorService, useValue: inspectorServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Inspector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle file selection and update state via FileReader', async () => {
    const mockFile = new File(['dummy content'], 'test-image.png', { type: 'image/png' });

    // Use a lexical variable to avoid 'this' typing issues entirely
    vi.spyOn(window, 'FileReader').mockImplementation(function () {
      const reader: any = {
        result: 'data:image/png;base64,mockBase64Data',
        onload: null,
        readAsDataURL(file: File) {
          if (reader.onload) {
            reader.onload();
          }
        },
      };
      return reader;
    });

    const inputEvent = {
      target: { files: [mockFile] },
    } as unknown as Event;

    component.onFileSelected(inputEvent);

    expect(component.state().selectedFile).toEqual(mockFile);
    expect(component.state().fileName).toBe('test-image.png');
    expect(component.state().previewUrl).toBe('data:image/png;base64,mockBase64Data');
    expect(component.state().errorMessage).toBeNull();
  });

  it('should process image successfully and update state with results', () => {
    const mockFile = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    const mockBlob = new Blob(['result blob'], { type: 'image/png' });
    const mockConfidence = 0.92;

    component.state.update((curr) => ({
      ...curr,
      selectedFile: mockFile,
    }));

    inspectorServiceMock.inspectImage.mockReturnValue(
      of({ blob: mockBlob, confidence: mockConfidence }),
    );

    component.processImage();

    expect(component.state().isLoading).toBe(false);
    expect(inspectorServiceMock.inspectImage).toHaveBeenCalledWith(mockFile);
    expect(component.state().resultImageUrl).toBe('blob:http://localhost/mock-blob-url');
    expect(component.state().confidence).toBe(mockConfidence);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('should handle process image error and set error message', () => {
    const mockFile = new File(['dummy content'], 'test-image.png', { type: 'image/png' });

    component.state.update((curr) => ({
      ...curr,
      selectedFile: mockFile,
    }));

    inspectorServiceMock.inspectImage.mockReturnValue(throwError(() => new Error('Backend error')));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.processImage();

    expect(component.state().isLoading).toBe(false);
    expect(component.state().errorMessage).toBe(
      'Failed to process image through backend inference pipeline.',
    );
    consoleSpy.mockRestore();
  });

  it('should do nothing on processImage if no file is selected', () => {
    component.state.update((curr) => ({ ...curr, selectedFile: null }));

    component.processImage();

    expect(inspectorServiceMock.inspectImage).not.toHaveBeenCalled();
  });
});
