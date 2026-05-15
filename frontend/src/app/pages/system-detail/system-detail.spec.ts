import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemDetail } from './system-detail';

describe('SystemDetail', () => {
  let component: SystemDetail;
  let fixture: ComponentFixture<SystemDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
