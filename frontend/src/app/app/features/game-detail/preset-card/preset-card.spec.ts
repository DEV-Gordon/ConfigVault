import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetCard } from './preset-card';

describe('PresetCard', () => {
  let component: PresetCard;
  let fixture: ComponentFixture<PresetCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PresetCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
