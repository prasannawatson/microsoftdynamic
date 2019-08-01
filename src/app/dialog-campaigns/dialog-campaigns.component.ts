import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";

@Component({
  selector: 'app-dialog-campaigns',
  templateUrl: './dialog-campaigns.component.html',
  styleUrls: ['./dialog-campaigns.component.scss']
})
export class DialogCampaignsComponent implements OnInit {
  campaignform: FormGroup;
  apiRoot: string = "http://52.172.1.187:8090";
  campaignformexisting: FormGroup;
  existingcampaignChecked: boolean = false;
  campaignList: any = [];
  username: string = "kundan";

  constructor(public dialogRef: MatDialogRef<DialogCampaignsComponent>,  private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.campaignform = new FormGroup({
      campaignname: new FormControl('', Validators.required),
      listtype: new FormControl('', Validators.required),
      targetedat: new FormControl('', Validators.required),
      owner: new FormControl('', Validators.required)
    });
    this.campaignformexisting = new FormGroup({
      campaignnameexisting: new FormControl('', Validators.required)
    });
  }

  async onChangeExisting(event: any) {
    var newDiv = document.getElementById('new-campaign');
    var existingDiv = document.getElementById('existing-campaign');
    debugger;
    if (event.checked) {
      newDiv.style.display = "none";
      existingDiv.style.display = "block";
      if (0 === this.campaignList.length) {
        let url = `${this.apiRoot}/api/msdynamics/MarketingList/Names?cc_UserName=${this.username}`;
        await this.http.get(url).toPromise().then(res => {
          if (res) {
            this.campaignList = res["lst_Names"];
          }
          }, error => {
        });
      }
    } else {
      newDiv.style.display = "block";
      existingDiv.style.display = "none";
    }
  }

  refreshCampaign() {
    var refreshIcon = document.getElementById('refresh-icon');
    refreshIcon.classList.add("fa-spin");
    let url = `${this.apiRoot}/api/msdynamics/MarketingList/Names?cc_UserName=${this.username}`;
      this.http.get(url).toPromise().then(res => {
        if (res) {
          this.campaignList = res["lst_Names"];
          refreshIcon.classList.remove("fa-spin");
        }
        }, error => {
      });
  }

  onCancelExisting() {
    for(let x in this.campaignformexisting.controls) {
      this.campaignformexisting.controls[x].reset();
      this.campaignformexisting.controls[x].clearValidators();
    }
  }

  onCancel() {
    for(let x in this.campaignform.controls) {
      this.campaignform.controls[x].reset();
      this.campaignform.controls[x].clearValidators();
    }
  }
}
