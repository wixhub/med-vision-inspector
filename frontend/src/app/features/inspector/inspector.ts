import { Component, inject, signal } from '@angular/core';
import { InspectorService } from '../../core/services/inspector.service';

@Component({
  imports: [],
  selector: 'app-inspector',
  styleUrl: './inspector.scss',
  templateUrl: './inspector.html',
})
export class Inspector {
  private readonly inspectorService = inject(InspectorService);

  // Reactive state managed via Signals
  public readonly selectedFile = signal<File | null>(null);
  public readonly fileName = signal<string>('');
  public readonly previewUrl = signal<string | null>(null);
  public readonly resultImageUrl = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  /**
   * Handles local file selection and generates a local data URL preview.
   */
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.fileName.set(file.name);
      this.errorMessage.set(null);
      this.resultImageUrl.set(null);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Triggers the backend AI inference pipeline and updates result signal.
   */
  public processImage(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.inspectorService.inspectImage(file).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.resultImageUrl.set(objectUrl);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Inference error:', err);
        this.errorMessage.set('Failed to process image through backend inference pipeline.');
        this.isLoading.set(false);
      },
    });
  }
}
