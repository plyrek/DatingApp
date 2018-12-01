import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output()cancelRegister = new EventEmitter();
  model: any = {};

  constructor(private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit() {
  }

  register() {
    // tslint:disable-next-line:max-line-length
    this.authService.register(this.model).subscribe(next => {this.alertify.success('Registration sucessful'); }, error => {this.alertify.error(error); });
      // console.log(this.model);
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

}
