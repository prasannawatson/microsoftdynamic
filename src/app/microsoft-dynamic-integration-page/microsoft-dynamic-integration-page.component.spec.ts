import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftDynamicIntegrationPageComponent } from './microsoft-dynamic-integration-page.component';

describe('MicrosoftDynamicIntegrationPageComponent', () => {
  let component: MicrosoftDynamicIntegrationPageComponent;
  let fixture: ComponentFixture<MicrosoftDynamicIntegrationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicrosoftDynamicIntegrationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftDynamicIntegrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
