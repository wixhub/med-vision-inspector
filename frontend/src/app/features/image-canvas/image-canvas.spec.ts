import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCanvas } from './image-canvas';

describe('ImageCanvas', () => {
  let component: ImageCanvas;
  let fixture: ComponentFixture<ImageCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
