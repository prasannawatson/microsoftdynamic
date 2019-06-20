import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftDynamicHeaderComponent } from './microsoft-dynamic-header.component';

describe('MicrosoftDynamicHeaderComponent', () => {
  let component: MicrosoftDynamicHeaderComponent;
  let fixture: ComponentFixture<MicrosoftDynamicHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicrosoftDynamicHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftDynamicHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
