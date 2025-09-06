import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideHistory } from './ride-history';

describe('RideHistory', () => {
  let component: RideHistory;
  let fixture: ComponentFixture<RideHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RideHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
