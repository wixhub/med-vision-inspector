import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { InspectorState } from '../../core/models/inspector.model';

describe('Sidebar Component', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  // Base initial state representing default demo load (Wikimedia MRI)
  const mockDefaultState: InspectorState = {
    selectedFile: null,
    fileName: '',
    previewUrl: null,
    resultImageUrl: null,
    isLoading: false,
    errorMessage: null,
    confidence: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
  });

  it('should create the sidebar component', () => {
    // Verify component instantiation success
    fixture.componentRef.setInput('state', mockDefaultState);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display Wikimedia Commons attribution link when no custom file is loaded', () => {
    // Set default state with empty file name
    fixture.componentRef.setInput('state', mockDefaultState);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const sourceLink = compiled.querySelector('.source-link') as HTMLAnchorElement;

    expect(sourceLink).toBeTruthy();
    expect(sourceLink.textContent).toContain('Wikimedia Commons');
    expect(sourceLink.href).toContain('wikimedia.org');
  });

  it('should display custom upload attribution metadata when a user file is active', () => {
    // Set state with a custom user file name
    const customState: InspectorState = {
      ...mockDefaultState,
      fileName: 'brain_custom_scan.jpg',
      selectedFile: new File([''], 'brain_custom_scan.jpg', { type: 'image/jpeg' }),
    };

    fixture.componentRef.setInput('state', customState);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const customValue = compiled.querySelector('.source-value.user-file');
    const metaDetail = compiled.querySelector('.source-meta-detail');

    expect(customValue).toBeTruthy();
    expect(customValue?.textContent).toContain('Custom Local Upload');
    expect(metaDetail?.textContent).toContain('Ready for Grad-CAM');
  });

  it('should emit fileSelected event when file input changes', () => {
    fixture.componentRef.setInput('state', mockDefaultState);
    fixture.detectChanges();

    const spy = vi.spyOn(component.fileSelected, 'emit');
    const inputElement = fixture.nativeElement.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const event = new Event('change');
    inputElement.dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should disable primary button and show spinner during loading state', () => {
    // Set loading state to true
    const loadingState: InspectorState = {
      ...mockDefaultState,
      selectedFile: new File([''], 'test.jpg'),
      isLoading: true,
    };

    fixture.componentRef.setInput('state', loadingState);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-primary') as HTMLButtonElement;
    const spinner = compiled.querySelector('.spinner');

    expect(button.disabled).toBe(true);
    expect(spinner).toBeTruthy();
    expect(button.textContent).toContain('Computing Attention...');
  });
});
