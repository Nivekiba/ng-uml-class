import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramDialogComponent } from './diagram-dialog.component';

describe('DiagramDialogComponent', () => {
  let component: DiagramDialogComponent;
  let fixture: ComponentFixture<DiagramDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
