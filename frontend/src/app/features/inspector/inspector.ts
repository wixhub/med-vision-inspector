import { Component, inject, signal } from '@angular/core';
import { InspectorService } from '../../core/services/inspector.service';
import { InspectorState } from '../../core/models/inspector.model';
import { ImageCanvas } from '../image-canvas/image-canvas';

@Component({
  imports: [ImageCanvas],
  selector: 'app-inspector',
  styleUrl: './inspector.scss',
  templateUrl: './inspector.html',
})
export class Inspector {
  private readonly inspectorService = inject(InspectorService);

  // Reactive state using Signals typed with InspectorState interface
  public readonly state = signal<InspectorState>({
    selectedFile: null,
    fileName: '',
    previewUrl: null,
    resultImageUrl: null,
    isLoading: false,
    errorMessage: null,
  });

  /**
   * Handles local file selection and generates a local preview URL.
   */
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.state.update((curr) => ({
          ...curr,
          selectedFile: file,
          fileName: file.name,
          previewUrl: reader.result as string,
          resultImageUrl: null,
          errorMessage: null,
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Triggers the backend AI inference pipeline.
   */
  public processImage(): void {
    const file = this.state().selectedFile;
    if (!file) return;

    this.state.update((curr) => ({ ...curr, isLoading: true, errorMessage: null }));

    this.inspectorService.inspectImage(file).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.state.update((curr) => ({
          ...curr,
          resultImageUrl: objectUrl,
          isLoading: false,
        }));
      },
      error: (err) => {
        console.error('Inference error:', err);
        this.state.update((curr) => ({
          ...curr,
          errorMessage: 'Failed to process image through backend inference pipeline.',
          isLoading: false,
        }));
      },
    });
  }
}
