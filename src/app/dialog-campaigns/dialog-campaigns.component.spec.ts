import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCampaignsComponent } from './dialog-campaigns.component';

describe('DialogCampaignsComponent', () => {
  let component: DialogCampaignsComponent;
  let fixture: ComponentFixture<DialogCampaignsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCampaignsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCampaignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
