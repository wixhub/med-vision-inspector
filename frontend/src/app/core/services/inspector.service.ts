import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class InspectorService {
  // Injecting HttpClient using modern function-based DI
  private readonly http = inject(HttpClient);

  // Backend API endpoint for Grad-CAM image inspection
  private readonly apiUrl = 'http://localhost:8000/api/v1/inspect';

  /**
   * Uploads medical image to FastAPI backend and returns processed heatmap blob.
   */
  public inspectImage(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(this.apiUrl, formData, {
      responseType: 'blob',
    });
  }
}
