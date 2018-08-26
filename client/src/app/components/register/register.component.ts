import { Component, OnInit} from '@angular/core';

@Component({
    selector: 'register',
    templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit{
    title: string;

    constructor(){
        this.title="Registrate";
    }
    ngOnInit(){
        console.log("Register cargado");
    }
}