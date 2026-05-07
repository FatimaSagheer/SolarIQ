import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaultList } from './fault-list';

describe('FaultList', () => {
  let component: FaultList;
  let fixture: ComponentFixture<FaultList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaultList],
    }).compileComponents();

    fixture = TestBed.createComponent(FaultList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
