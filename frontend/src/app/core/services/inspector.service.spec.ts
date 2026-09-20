import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InspectorService } from './inspector.service';

describe('InspectorService', () => {
  let service: InspectorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InspectorService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InspectorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensure that there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload an image file and return a blob response', () => {
    const mockFile = new File(['dummy image content'], 'test-image.png', { type: 'image/png' });
    const mockBlob = new Blob(['processed heatmap content'], { type: 'image/png' });

    service.inspectImage(mockFile).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.size).toBe(mockBlob.size);
      expect(response.type).toBe('image/png');
    });

    const req = httpMock.expectOne('http://localhost:8000/api/v1/inspect');

    // Assert that the request method is POST
    expect(req.request.method).toBe('POST');

    // Assert that a FormData body was sent containing the file
    const formData = req.request.body as FormData;
    expect(formData.get('file')).toBeTruthy();

    // Respond with the mock blob
    req.flush(mockBlob);
  });
});
