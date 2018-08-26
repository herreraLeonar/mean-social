import { Component, OnInit} from '@angular/core';

@Component({
    selector: 'login',
    templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit{
    title: string;

    constructor(){
        this.title="Identificate";
    }
    ngOnInit(){
        console.log("Login cargado");
    }
}