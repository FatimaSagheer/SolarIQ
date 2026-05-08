import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemsMap } from './systems-map';

describe('SystemsMap', () => {
  let component: SystemsMap;
  let fixture: ComponentFixture<SystemsMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemsMap],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemsMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
