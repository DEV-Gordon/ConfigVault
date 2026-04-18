import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementsPanel } from './requirements-panel';

describe('RequirementsPanel', () => {
  let component: RequirementsPanel;
  let fixture: ComponentFixture<RequirementsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(RequirementsPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
