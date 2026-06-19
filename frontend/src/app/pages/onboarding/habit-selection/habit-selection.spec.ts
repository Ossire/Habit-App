import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitSelection } from './habit-selection';

describe('HabitSelection', () => {
  let component: HabitSelection;
  let fixture: ComponentFixture<HabitSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
