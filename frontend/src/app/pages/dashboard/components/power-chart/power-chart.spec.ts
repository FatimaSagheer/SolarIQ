import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerChart } from './power-chart';

describe('PowerChart', () => {
  let component: PowerChart;
  let fixture: ComponentFixture<PowerChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerChart],
    }).compileComponents();

    fixture = TestBed.createComponent(PowerChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
