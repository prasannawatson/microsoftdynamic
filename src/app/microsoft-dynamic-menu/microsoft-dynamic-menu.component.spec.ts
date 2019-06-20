import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftDynamicMenuComponent } from './microsoft-dynamic-menu.component';

describe('MicrosoftDynamicMenuComponent', () => {
  let component: MicrosoftDynamicMenuComponent;
  let fixture: ComponentFixture<MicrosoftDynamicMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicrosoftDynamicMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftDynamicMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
