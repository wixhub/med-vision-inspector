export interface InferenceResponse {
  status: string;
  message?: string;
}

export interface InspectorState {
  selectedFile: File | null;
  fileName: string;
  previewUrl: string | null;
  resultImageUrl: string | null;
  isLoading: boolean;
  errorMessage: string | null;
}
