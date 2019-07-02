import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import * as angular from "angular";
import * as $ from 'jquery';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject} from '@angular/core';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table';
import { DialogOverviewComponent } from '../dialog-overview/dialog-overview.component';
import { forkJoin } from 'rxjs';
import { promise } from 'protractor';

export interface DialogData {
  enabled: boolean;
}

export interface PeriodicElement {
  questiontag: string;
  field: string;
  fieldvalue: string;
  action: string;
}

var ELEMENT_DATA: PeriodicElement[] = [];

var deleteBody = {};
var connectBody = {};
var questionnoteKeyMaping = {};

@Component({
  selector: 'app-microsoft-dynamic-integration-page',
  templateUrl: './microsoft-dynamic-integration-page.component.html',
  styleUrls: ['./microsoft-dynamic-integration-page.component.scss']
})
export class MicrosoftDynamicIntegrationPageComponent implements OnInit {
  displayedColumns: string[] = ['questiontag', 'field', 'action'];
  keyEntityMapping: any = {"account": "MSDynamicAccount", "contact": "MSDynamicContact", "incident":"MSDynamicIncident", "lead":"MSDynamicLead", "MarketingList":"MSDynamicMarketingList", "cc_cloudcherry_survey":"MSDynamicCloudCherry"}
  //dataSource = ELEMENT_DATA;
  dataSource: MatTableDataSource<PeriodicElement>;
  testdata: any = [];
  mappingForm: FormGroup;
  myform: FormGroup;
  apiRoot: string = "http://52.172.1.187:8090";
  authenticate: boolean = false;
  entities: any = [];
  notes: any = [];
  fields: any = [];
  disable: boolean = true;
  entityDisable:boolean = false;
  toggleChecked: boolean = true;
  toggleEvent: any = undefined;
  entityFieldMapping: any = {};
  connectButtonDisable: boolean = false;
  fieldDisable: boolean = false;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  constructor(private http: HttpClient, public dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.myform = new FormGroup({
      baseaddress: new FormControl('', Validators.required),
      userid: new FormControl('', Validators.required),
      secretkey: new FormControl('', Validators.required),
      environment: new FormControl('', Validators.required)
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  

  async onChangeEntity(event: any) {
    this.entityDisable = true;
    this.fields = null;
    if(this.entityFieldMapping[event.target.value].length != 0) {
      this.fields = this.entityFieldMapping[event.target.value];
      this.entityDisable = false;
    } else {
      let url = `${this.apiRoot}/api/msdynamics/crm/GetEntityFields/${event.target.value}/pragmasys`;
      this.http.get(url).toPromise().then(res => {
        if(res) {
          console.log(res);
          this.entityDisable = false;
          this.entityFieldMapping[event.target.value] = res;
          this.fields = res;
        } else {
          this.entityDisable = false;
        }
      }, error => {
        console.log(error.status);
        this.entityDisable = false;
        this.fields = null;
      });
    }
    let newdataSource: PeriodicElement[] = [];
    let url = `${this.apiRoot}/api/msdynamics/GetMapping/pragmasys/${this.keyEntityMapping[event.target.value]}`;
    debugger;
    this.http.get(url).toPromise().then(res => {
      if(res) {
          let keyQuesMapping = this.swap(questionnoteKeyMaping);
          Object.keys(res["QuestionIdMappings"]).forEach(key => {
          var quesTag = keyQuesMapping[res["QuestionIdMappings"][key]];
          var fieldName = key.split('~')[0];
          var data : PeriodicElement = {questiontag: quesTag, field: fieldName, fieldvalue: key, action: 'test'};
          newdataSource.push(data);
        });
        this.dataSource = new MatTableDataSource([...newdataSource]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.dataSource = null;
      }
    }, error => {
      console.log(error.status);
    });
  }

  async onChangeEnable(event: any) {
    this.toggleEvent = event;
    this.openDialog(event.checked);
  }

  openDialog(enable: boolean): void {
    const dialogRef = this.dialog.open(DialogOverviewComponent, {
      width: '200px',
      data: {enabled: enable}
    });

    dialogRef.afterClosed().subscribe(result => {
      debugger;
      if(undefined === result || !result) {
        this.toggleChecked = this.toggleEvent.checked ? false: true;
      } else {
        this.enableDisableUser(this.toggleEvent);
      }
    });
  }

  async enableDisableUser(event: any) {
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
      }
    }, error => {
      console.log(error.status);
      if(event.checked) {
        this.toggleChecked = false;
      } else {
        this.toggleChecked = true;
      }
    });
  }

  async onSubmit() {
    if(this.myform.valid) {
      this.connectButtonDisable = true;
      connectBody["crm_API_BaseAddress"] = this.myform.value["baseaddress"];
      connectBody["crm_App_UserId"] = this.myform.value["userid"];
      connectBody["crm_ClientSecretKey"] = this.myform.value["secretkey"];
      connectBody["crm_DirectoryUrl"] = this.myform.value["environment"];
      let url = `${this.apiRoot}/api/msdynamics/Authenticate`;
      $("#comment-list").after($('<div class="loading" style="font-size: medium;text-align: center; font-family: sans-serif !important;"><i class="fa fa-spinner fa-spin"></i> Loading..</div>').fadeIn('slow')).data("loading", true);
    await this.http.post(url, JSON.parse(JSON.stringify(connectBody))).toPromise().then(res => {
        if(res) {
          this.authenticate = true;
          for(let x in this.myform.controls) {
            this.myform.controls[x].disable();
          }
        } else {
          //todo
          this.authenticate = false;
          this.connectButtonDisable = false;
          $(".loading").fadeOut('fast', function() {
            $(this).remove();
            alert("Bad request.");
            window.location.reload();
          });
        }
      }, error => {
        $(".loading").fadeOut('fast', function() {
          $(this).remove();
          alert("Bad request.");
          window.location.reload();
        });
      });
      this.apiCalls();
    }
  }

  apiCalls() {
      let url = `${this.apiRoot}/api/msdynamics/GetEntity`;
      let response2 = this.http.get(url);
      url = `${this.apiRoot}/api/msdynamics/GetQuestionNotes/pragmasys`;
      let response3 = this.http.get(url);
      url = `${this.apiRoot}/api/msdynamics/crm/GetEntityFields/account/pragmasys`;
      let response4 = this.http.get(url);
      url = `${this.apiRoot}/api/msdynamics/GetMapping/pragmasys/${this.keyEntityMapping["account"]}`;
      let response5 = this.http.get(url);
      forkJoin([response2, response3, response4, response5]).subscribe((res) =>  {
        $(".loading").fadeOut('fast', function() {
          $(this).remove();
        });
        if(this.authenticate){
          this.entities = res[0];
          this.notes = res[1];
          this.notes.forEach( (res:any) => {
            questionnoteKeyMaping[res.Name] = res.Value;
          });
          for(let entity of this.entities) {
            this.entityFieldMapping[entity.Value] = [];
          }
          this.entityFieldMapping["account"] = res[2];
          this.fields = this.entityFieldMapping["account"];
          let oConnectButton = document.getElementById('connect-button');
          oConnectButton.style.display = "none";
          let oDivToggle = document.getElementById('connect-toggle-div');
          oDivToggle.style.display = "block";
          let oLoggedDiv = document.getElementById('logged-block');
          oLoggedDiv.style.display = "block";
          let keyQuesMapping = this.swap(questionnoteKeyMaping);
          Object.keys(res[3]["QuestionIdMappings"]).forEach(key => {
            var quesTag = keyQuesMapping[res[3]["QuestionIdMappings"][key]];
            var fieldname = key.split('~')[0];
            var data : PeriodicElement = {questiontag: quesTag, field: fieldname, fieldvalue: key, action: 'test'};
            ELEMENT_DATA.push(data);
          });
          this.dataSource = new MatTableDataSource([...ELEMENT_DATA]);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          debugger;
        }
      }, error => {
        debugger;
      });
  }

  async addMapping() {

  }

  onDelete(event: any) {
    let row = event.target.parentElement.parentElement.parentElement.children;
    let qtag = row[0].innerText;
    let field = row[1].getAttribute("value");
    let keyQuesMapping = this.swap(questionnoteKeyMaping);
    deleteBody[field] = keyQuesMapping[qtag];
    event.target.parentElement.parentElement.parentElement.remove();
  }

  onEdit(event: any) {
    debugger;
  }

  swap(json: any): any {
    var ret = {};
    for(var key in json){
      ret[json[key]] = key;
    }
    return ret;
  }
}
  