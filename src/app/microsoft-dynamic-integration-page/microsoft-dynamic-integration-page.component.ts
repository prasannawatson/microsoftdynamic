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
import { DialogWarningComponent } from '../dialog-warning/dialog-warning.component';

export interface DialogData {
  enabled: boolean;
}

export interface PeriodicElement {
  questiontag: string;
  field: string;
  fieldvalue: string;
  questionvalue: string;
}

var ELEMENT_DATA: PeriodicElement[] = [];

var addBody = {};
var deleteBody = {};
var connectBody = {};
var questionnoteKeyMaping = {};
const username = "kundan";

@Component({
  selector: 'app-microsoft-dynamic-integration-page',
  templateUrl: './microsoft-dynamic-integration-page.component.html',
  styleUrls: ['./microsoft-dynamic-integration-page.component.scss']
})
export class MicrosoftDynamicIntegrationPageComponent implements OnInit {
  displayedColumns: string[] = ['questiontag', 'field', 'action', 'uniqueidentifier'];
  dataTypeMapping: any = {"TEXT": "string|||textarea|||email|||phone|||url|||reference", 
                          "MULTILINETEXT": "string|||textarea|||url|||reference",
                          "MULTISELECT": "string|||textarea",
                          "NUMBER": "'number|||double|||int",
                          "STAR-5": "number|||double|||int",
                          "SMILE-5": "number|||double|||int",
                          "SCALE": "number|||double|||int",
                          "SELECT": "string|||textarea",
                          "DROPDOWN": "picklist",
                          "SINGLESELECT": "picklist",
                          "DATE": "datetime",
                          "SLIDER": "number|||double|||int",
                        };
  keyEntityMapping: any = {"account": "MSDynamicAccount", "contact": "MSDynamicContact", "incident":"MSDynamicIncident", "lead":"MSDynamicLead", "MarketingList":"MSDynamicMarketingList", "cc_cloudcherry_survey":"MSDynamicCloudCherry"}
  //dataSource = ELEMENT_DATA;
  dataSource: MatTableDataSource<PeriodicElement>;
  myform: FormGroup;
  apiRoot: string = "http://52.172.1.187:8090";
  authenticate: boolean = false;
  entities: any = [];
  notes: any = [];
  fields: any = [];
  disableAddMappingQ: boolean = false;
  disableAddMappingF: boolean = false;
  entityDisable:boolean = false;
  toggleChecked: boolean = true;
  toggleEvent: any = undefined;
  entityFieldMapping: any = {};
  connectButtonDisable: boolean = false;
  fieldDisable: boolean = false;
  entityValue: string = "account";
  emailcheck: boolean;
  mobilecheck: boolean;
  uniquefield: string;
  defaultaccount: boolean;
  defaultcontact: boolean;
  entityUpdated: boolean = false;

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
    let url = `${this.apiRoot}/api/msdynamics/GetCredentials/${username}`;
    this.http.get(url).toPromise().then(res => {
      debugger;
      if (res) {
        this.authenticate = true;
        this.myform.value["baseaddress"] = res["crm_API_BaseAddress"];
        this.myform.value["userid"] = res["crm_App_UserId"];
        this.myform.value["secretkey"] = res["crm_ClientSecretKey"];
        this.myform.value["environment"] = res["crm_DirectoryUrl"];
        this.myform = new FormGroup({
          baseaddress: new FormControl(res["crm_API_BaseAddress"], Validators.required),
          userid: new FormControl(res["crm_App_UserId"], Validators.required),
          secretkey: new FormControl(res["crm_ClientSecretKey"], Validators.required),
          environment: new FormControl(res["crm_DirectoryUrl"], Validators.required)
        });
        this.uniquefield = res["crm_ContactOrAccountUniqueField"].split('~')[0];
        if(res["crm_ContactoOrAccount"] == "contact") {
          this.defaultcontact = true;
          this.defaultaccount = false;
        } else {
          this.defaultaccount = true;
          this.defaultcontact = false;
        }
        for(let x in this.myform.controls) {
          this.myform.controls[x].disable();
        }
        if("false" === res["enable"]) {
          this.toggleChecked = false;
          let oDivToggle = document.getElementById('connect-toggle-div');
          oDivToggle.style.display = "block";
          let oConnectButton = document.getElementById('connect-button');
          oConnectButton.style.display = "none";
          let oLoggedDiv = document.getElementById('logged-block');
          oLoggedDiv.style.display = "none";
        } else {
          this.onSubmit(true);
        }
      }
    }, error => {
      this.myform = new FormGroup({
        baseaddress: new FormControl('', Validators.required),
        userid: new FormControl('', Validators.required),
        secretkey: new FormControl('', Validators.required),
        environment: new FormControl('', Validators.required)
      });
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  openWarning(event: any): void {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '200px',
      data: {event: event}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(undefined === result || !result) {
        event.target.value = this.entityValue;
      } else {
        this.entityValue = event.target.value;
        //addBody = {};
        //deleteBody = {};
        this.entityUpdated = false;
        let questiontag = document.getElementById('select-questiontag');
        let fieldTag = document.getElementById('select-field');
        questiontag["value"] = "0";
        fieldTag["value"] = "0";
        this.disableAddMappingQ = false;
        this.disableAddMappingF = false;
        this.entityDisable = true;
        this.fields = null;
        if(this.entityFieldMapping[event.target.value].length != 0) {
          this.fields = this.entityFieldMapping[event.target.value];
          this.entityDisable = false;
        } else {
          let url = `${this.apiRoot}/api/msdynamics/crm/GetEntityFields/${event.target.value}/${username}`;
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
      let url = `${this.apiRoot}/api/msdynamics/GetMapping/${username}/${this.keyEntityMapping[event.target.value]}`;
      this.http.get(url).toPromise().then(res => {
        if(res) {
          Object.keys(res["QuestionIdMappings"]).forEach(key => {
          var quesTag = questionnoteKeyMaping[res["QuestionIdMappings"][key]];
          var fieldName = key.split('~')[0];
          var data : PeriodicElement = {questiontag: quesTag, field: fieldName, fieldvalue: key, questionvalue: res["QuestionIdMappings"][key]};
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
    });
  }

  async onChangeEntity(event: any) {
    if(!this.entityUpdated) {
      this.entityValue = event.target.value;
        addBody = {};
        deleteBody = {};
        let questiontag = document.getElementById('select-questiontag');
        let fieldTag = document.getElementById('select-field');
        questiontag["value"] = "0";
        fieldTag["value"] = "0";
        this.disableAddMappingQ = false;
        this.disableAddMappingF = false;
        this.entityDisable = true;
        this.fields = null;
        if(this.entityFieldMapping[event.target.value].length != 0) {
          this.fields = this.entityFieldMapping[event.target.value];
        } else {
          let url = `${this.apiRoot}/api/msdynamics/crm/GetEntityFields/${event.target.value}/${username}`;
          this.http.get(url).toPromise().then(res => {
          if(res) {
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
      ELEMENT_DATA = [];
      let url = `${this.apiRoot}/api/msdynamics/GetMapping/${username}/${this.keyEntityMapping[event.target.value]}`;
      this.http.get(url).toPromise().then(res => {
        if(res) {
          this.entityDisable = false;
          Object.keys(res["QuestionIdMappings"]).forEach(key => {
          var quesTag = questionnoteKeyMaping[res["QuestionIdMappings"][key]];
          var fieldName = key.split('~')[0];
          var data : PeriodicElement = {questiontag: quesTag, field: fieldName, fieldvalue: key, questionvalue: res["QuestionIdMappings"][key]};
          ELEMENT_DATA.push(data);
        });
        this.dataSource = new MatTableDataSource([...ELEMENT_DATA]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.dataSource = null;
      }
    }, error => {
      console.log(error.status);
    });
    } else {
      this.openWarning(event);
    }
  }

  async onChangeEnable(event: any) {
    this.openDialog(event);
  }

  openDialog(event: any): void {
    const dialogRef = this.dialog.open(DialogOverviewComponent, {
      width: '200px',
      data: {event: event, enable: event.checked}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(undefined === result || !result) {
        let checkedValue = event.checked ? false: true;
        this.toggleChecked = checkedValue;
      } else {
        this.enableDisableUser(event);
      }
    });
  }

  async enableDisableUser(event: any) {
    let url = `${this.apiRoot}/api/msdynamics/EnableDisableUser/${username}/${event.checked}`;
	  await this.http.get(url).toPromise().then(res => {
      if(res){
        if (event.checked) {
          let oLoggedDiv = document.getElementById('logged-block');
          oLoggedDiv.style.display = "block";
          this.apiCalls();
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

  async onSubmit(validForm: boolean) {
    if(this.myform.valid || validForm) {
      this.connectButtonDisable = true;
      connectBody["crm_API_BaseAddress"] = this.myform.value["baseaddress"];
      connectBody["crm_App_UserId"] = this.myform.value["userid"];
      connectBody["crm_ClientSecretKey"] = this.myform.value["secretkey"];
      connectBody["crm_DirectoryUrl"] = this.myform.value["environment"];
      let url = `${this.apiRoot}/api/msdynamics/Authenticate`;
      $("#comment-list").after($('<div class="loading" style="font-size: medium;text-align: center; font-family: sans-serif !important;"><i class="fa fa-spinner fa-spin"></i> Loading..</div>').fadeIn('slow')).data("loading", true);
      if (!this.authenticate) {
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
            });
          }
        }, error => {
          $(".loading").fadeOut('fast', function() {
            $(this).remove();
            alert("Bad request.");
          });
        });
      } 
      this.apiCalls();
    }
  }

  apiCalls() {
      let url = `${this.apiRoot}/api/msdynamics/GetEntity`;
      let response2 = this.http.get(url);
      url = `${this.apiRoot}/api/msdynamics/GetQuestionNotes/${username}`;
      let response3 = this.http.get(url);
      url = `${this.apiRoot}/api/msdynamics/crm/GetEntityFields/account/${username}`;
      let response4 = this.http.get(url);
      url = `${this.apiRoot}/api/msdynamics/GetMapping/${username}/${this.keyEntityMapping["account"]}`;
      let response5 = this.http.get(url);
      forkJoin([response2, response3, response4, response5]).subscribe((res) =>  {
        $(".loading").fadeOut('fast', function() {
          $(this).remove();
        });
        if(this.authenticate){
          this.entities = res[0];
          this.notes = res[1];
          if(this.notes) {
            this.notes.forEach( (result:any) => {
              questionnoteKeyMaping[result.Value] = result.Name;
            });
          }
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
          if (res[3]) {
            Object.keys(res[3]["QuestionIdMappings"]).forEach(key => {
              var quesTag = questionnoteKeyMaping[res[3]["QuestionIdMappings"][key]];
              var fieldname = key.split('~')[0];
              var data : PeriodicElement = {questiontag: quesTag, field: fieldname, fieldvalue: key, questionvalue: res[3]["QuestionIdMappings"][key]};
              ELEMENT_DATA.push(data);
            });
          }
          this.dataSource = new MatTableDataSource([...ELEMENT_DATA]);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          if(this.uniquefield == "Email") {
            this.emailcheck = true;
            this.mobilecheck = false;
          } else {
            this.mobilecheck = true;
            this.emailcheck = false;
          }
        }
      }, error => {
        console.log(error.status);
        this.authenticate = false;
          this.connectButtonDisable = false;
          $(".loading").fadeOut('fast', function() {
            $(this).remove();
            alert("Bad request.");
          });
          for(let x in this.myform.controls) {
            this.myform.controls[x].enable();
          }
      });
  }

  async addMapping() {
    debugger;
    this.entityUpdated = true;
    let questiontag = document.getElementById('select-questiontag');
    let field = document.getElementById('select-field');
    let questiontagChildern = questiontag.children;
    let fieldType = field["value"].split('~')[field["value"].split('~').length - 1];
    let typeList = null;
    for(var y of questiontagChildern) {
      if(y["value"] === questiontag["value"]) {
        typeList = this.dataTypeMapping[y.getAttribute('type').toUpperCase()].split('|||');
      }
    }
    if (typeList.includes(fieldType.toLowerCase())){
      let element: any;
      ELEMENT_DATA.forEach(res => {
        if(res.questiontag == questionnoteKeyMaping[questiontag["value"]] || res.fieldvalue == field["value"]){
          element = res;
        }
      });
    if (element) {
      ELEMENT_DATA = ELEMENT_DATA.filter(obj => obj != element);
    }
    var data : PeriodicElement = {questiontag: questionnoteKeyMaping[questiontag["value"]], field: field["value"].split('~')[0], fieldvalue: field["value"], questionvalue: questiontag["value"]};
    ELEMENT_DATA.unshift(data);
    this.dataSource = new MatTableDataSource([...ELEMENT_DATA]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    //addBody[field["value"]] = questiontag["value"];
    let oMappingError = document.getElementById('mapping-error');
    oMappingError.style.display = "none";
    } else {
      let oMappingError = document.getElementById('mapping-error');
      oMappingError.style.display = "block";
    }
  }

  onDelete(event: any) {
    debugger;
    this.entityUpdated = true;
    let row = event.target.parentElement.parentElement.parentElement.children;
    let qtag = row[0].innerText;
    let field = row[1].getAttribute("value");
    // this.notes.forEach( (res: any)=> {
    //   if(res.Name == qtag) {
    //     deleteBody[field] = res.Value;
    //   }
    // });
    //deleteBody[field] = questionnoteKeyMaping[qtag];
    //event.target.parentElement.parentElement.parentElement.remove();
    let element: any;
    ELEMENT_DATA.forEach(res => {
      if(res.fieldvalue == field){
        element = res;
      }
    });
    if (element) {
      ELEMENT_DATA = ELEMENT_DATA.filter(obj => obj != element);
    }
    this.dataSource = new MatTableDataSource([...ELEMENT_DATA]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onEdit(event: any) {
    var eventid = event.target.parentElement.id;    
    var fieldSelect = document.getElementById('select-field');
    if ("" === eventid) {
      var cancelelement = document.getElementById('canceledit');
      if(cancelelement) {
        cancelelement.title = "Click to edit";
        cancelelement.id = "";
        cancelelement.innerHTML = '<i class="fal fa-edit"></i>';
      }
      this.disableAddMappingF = true;
      var row = event.target.parentElement.parentElement.parentElement.children;
      fieldSelect["value"] = row[1].getAttribute('value').charAt(0).toUpperCase() + row[1].getAttribute('value').slice(1);
      event.target.parentElement.title = "Click to cancel edit";
      event.target.parentElement.id = "canceledit";
      event.target.parentElement.innerHTML = '<i class="fal fa-times"></i>';
    } else {
      fieldSelect["value"] = "0";
      this.disableAddMappingF = false;
      event.target.parentElement.title = "Click to edit";
      event.target.parentElement.id = "";
      event.target.parentElement.innerHTML = '<i class="fal fa-edit"></i>';
    }
    let oMappingError = document.getElementById('mapping-error');
    oMappingError.style.display = "block";
  }

  onUpdate(event: any) {
    let updateButton = document.getElementById('update-button');
    updateButton.innerHTML = '<i class="fal fa-spinner fa-spin"></i>';
    let data = {};
    let saveCredBody = {};
    let emailmappedfield = "";
    let mobilemappedfield = "";
    let reverse = this.swap(questionnoteKeyMaping);
    for(var x of this.dataSource.data)
    {
      data[x.fieldvalue] = reverse[x.questiontag];
      if (x.questiontag == "Email")
      {
        emailmappedfield = x.fieldvalue;
      }
      if (x.questiontag == "Mobile Number") {
        mobilemappedfield = x.fieldvalue;
      }
    }
    saveCredBody["cc_Password"] = "Cloudcherry@123";
    saveCredBody["cc_AccessToken"] = "";  
    saveCredBody["cc_BaseAddress"] = "https://api.getcloudcherry.com";
    saveCredBody["crm_API_BaseAddress"] = this.myform.value["baseaddress"];
    saveCredBody["crm_App_UserId"] = this.myform.value["userid"];
    saveCredBody["crm_ClientSecretKey"] = this.myform.value["secretkey"];
    saveCredBody["crm_DirectoryUrl"] = this.myform.value["environment"];
    saveCredBody["crm_ContactoOrAccount"] = this.defaultaccount ? "account" : "contact";
    saveCredBody["crm_ContactOrAccountUniqueField"] = this.mobilecheck ? mobilemappedfield : emailmappedfield;
    saveCredBody["crm_LeadUniqueField"] = this.mobilecheck ? mobilemappedfield : emailmappedfield;
    let url = `${this.apiRoot}/api/msdynamics/SaveCredentials/${username}`;
    this.http.post(url, JSON.parse(JSON.stringify(saveCredBody))).toPromise().then(res => {
    }, error => {
      console.log(error.status);
      updateButton.innerHTML = 'Update';
    });
    url = `${this.apiRoot}/api/msdynamics/UpdateMapping/${username}/${this.keyEntityMapping[this.entityValue]}`;
    this.http.post(url, JSON.parse(JSON.stringify(data))).toPromise().then(res => {
      updateButton.innerHTML = 'Update';
    }, error => {
      console.log(error.status);
      updateButton.innerHTML = 'Update';
    });
  }

  swap(json: any) {
    var ret = {};
    for(var key in json){
      ret[json[key]] = key;
    }
    return ret;
  }

  onCheck(event: any) {
    this.entityUpdated = true;
    let row = event.currentTarget.parentElement.parentElement.children;
    let cctag = row[0].innerText;
    if('Email' === cctag) {
      this.mobilecheck = false;
    } else {
      this.emailcheck = false;
    }
  }

  onMakeDefault() {
    this.entityUpdated = true;
    if ("account" === this.entityValue) {
      if (this.defaultaccount) {
        this.defaultcontact = true;
      } else {
        this.defaultcontact = false;
      }
    } else {
      if (this.defaultcontact) {
        this.defaultaccount = true;
      } else {
        this.defaultaccount = false;
      }
    }
  }
}
  


