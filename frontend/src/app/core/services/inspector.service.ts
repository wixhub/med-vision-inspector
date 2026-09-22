import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class InspectorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/inspect`;

  /**
   * Uploads medical image to FastAPI backend and returns processed heatmap blob alongside model confidence.
   */
  public inspectImage(file: File): Observable<{ blob: Blob; confidence: number }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post(this.apiUrl, formData, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const confidenceHeader = response.headers.get('X-Model-Confidence');
          const confidence = confidenceHeader ? parseFloat(confidenceHeader) : 0.0;
          const blob = response.body as Blob;

          return { blob, confidence };
        }),
      );
  }
}
