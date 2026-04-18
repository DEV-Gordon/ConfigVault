import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentList } from './recent-list';

describe('RecentList', () => {
  let component: RecentList;
  let fixture: ComponentFixture<RecentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentList],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
