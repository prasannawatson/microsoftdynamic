import { Component, OnInit } from '@angular/core';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";


@Component({
  selector: 'app-microsoft-dynamic-integration-page',
  templateUrl: './microsoft-dynamic-integration-page.component.html',
  styleUrls: ['./microsoft-dynamic-integration-page.component.scss']
})
export class MicrosoftDynamicIntegrationPageComponent implements OnInit {
  apiRoot: string = "https://httpbin.org";

  constructor(private http: HttpClient) { }

  ngOnInit() {
    
  }

  doGET() {
    console.log("GET");
    let url = `${this.apiRoot}/get`;
    const httpOptions = {
      params: new HttpParams().set("foo", "moo").set("limit", "25")
    };
    this.http.get(url, httpOptions).subscribe(res => console.log(res));
  }

}
