import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InspectorService } from './inspector.service';
import { environment } from '../../../environments/environment';

describe('InspectorService', () => {
  let service: InspectorService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1/inspect`;

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

  it('should upload image and parse blob and confidence header correctly', () => {
    const mockFile = new File(['dummy image content'], 'test-scan.jpg', { type: 'image/jpeg' });
    const mockBlob = new Blob(['dummy response blob'], { type: 'image/png' });
    const mockConfidence = '0.95';

    let result: { blob: Blob; confidence: number } | undefined;

    service.inspectImage(mockFile).subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTruthy();
    expect(req.request.headers.get('accept')).toBeNull(); // handled by HttpClient default

    // Flush the mock request with custom headers and body
    req.flush(mockBlob, {
      headers: { 'X-Model-Confidence': mockConfidence },
      status: 200,
      statusText: 'OK',
    });

    expect(result).toBeDefined();
    expect(result?.blob).toEqual(mockBlob);
    expect(result?.confidence).toBe(0.95);
  });

  it('should default confidence to 0.0 if X-Model-Confidence header is missing', () => {
    const mockFile = new File(['dummy image content'], 'test-scan.jpg', { type: 'image/jpeg' });
    const mockBlob = new Blob(['dummy response blob'], { type: 'image/png' });

    let result: { blob: Blob; confidence: number } | undefined;

    service.inspectImage(mockFile).subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(apiUrl);

    // Flush without the confidence header
    req.flush(mockBlob, {
      status: 200,
      statusText: 'OK',
    });

    expect(result).toBeDefined();
    expect(result?.blob).toEqual(mockBlob);
    expect(result?.confidence).toBe(0.0);
  });
});
