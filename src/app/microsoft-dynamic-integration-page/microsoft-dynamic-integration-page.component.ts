import { Component, OnInit } from '@angular/core';
import * as angular from "angular";
import * as $ from 'jquery';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-microsoft-dynamic-integration-page',
  templateUrl: './microsoft-dynamic-integration-page.component.html',
  styleUrls: ['./microsoft-dynamic-integration-page.component.scss']
})
export class MicrosoftDynamicIntegrationPageComponent implements OnInit {
  myform: FormGroup;
  apiRoot: string = "http://52.172.1.187:8090";
  authenticate: boolean = false;
  entities: any = [];
  notes: any = [];
  fields: any = [];
  disable: boolean = true;
  entityDisable:boolean = false;
  constructor(private http: HttpClient, public dialog: MatDialog) { }

  ngOnInit() {
    this.myform = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      secretkey: new FormControl('', Validators.required),
      environment: new FormControl('', Validators.required)
    });
  }

  

  async onChangeEntity(event) {
    debugger;
    this.entityDisable = true;
    let url = `${this.apiRoot}/api/msdynamics/crm/GetEntityFields/${event.target.value}/pragmasys`;
      await this.http.get(url).toPromise().then(res => {
        if(res) {
          console.log(res);
          this.entityDisable = false;
          this.fields = res["fields"];
        } 
      }, error => {
        console.log(error.status);
        this.entityDisable = false;
        this.fields = null;
      });
  }

  async onChangeEnable(event) {
    debugger;
    let url = `${this.apiRoot}/api/msdynamics/EnableDisableUser/${this.myform.value.username}/${event.checked}`;
    await this.http.get(url).toPromise().then(res => {
      if(res){
        if (event.checked) {
          let oLoggedDiv = document.getElementById('logged-block');
          oLoggedDiv.style.display = "block";
        } else {
          let oLoggedDiv = document.getElementById('logged-block');
          oLoggedDiv.style.display = "none";
        } 
      } else {
        //this.openDialog();   
      }
    }, error => {
      console.log(error.status);
      if(event.checked) {
        event.target.checked = false;
      } else {
        event.target.checked = true;
      }
    });
  }



  async onSubmit() {
    if(this.myform.valid) {
      console.log(this.myform.value);
      let url = `${this.apiRoot}/api/msdynamics/Authenticate`;
      await this.http.post(url, {}).toPromise().then(res => {
        if(res) {
          this.authenticate = true;
          let oConnectButton = document.getElementById('connect-button');
          oConnectButton.remove();
          let oDivToggle = document.getElementById('connect-toggle-div');
          oDivToggle.style.display = "block";
          let oLoggedDiv = document.getElementById('logged-block');
          oLoggedDiv.style.display = "block";
          // let oDivMappText = document.getElementById('mapping-text');
          // oDivMappText.style.display = "block";
        } else {
          //todo
        }
      });
      url = `${this.apiRoot}/api/msdynamics/GetEntity`;
      await this.http.get(url).toPromise().then(res => {
        if(this.authenticate){
          this.entities = res;
        }
      });
      url = `${this.apiRoot}/api/msdynamics/GetQuestionNotes/pragmasys`;
      await this.http.get(url).toPromise().then(res => {
        if(this.authenticate){
          this.notes = res;
        }
      });
    }
  }
}
  