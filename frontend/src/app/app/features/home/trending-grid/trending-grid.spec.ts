import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingGrid } from './trending-grid';

describe('TrendingGrid', () => {
  let component: TrendingGrid;
  let fixture: ComponentFixture<TrendingGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendingGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
