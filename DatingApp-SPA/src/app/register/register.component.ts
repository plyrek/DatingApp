import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import {FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  // model: any = {};
  user: User;
  registerForm: FormGroup;
  colorTheme = 'theme-red';
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private authService: AuthService,
    private alertify: AlertifyService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.bsConfig = {
      containerClass: this.colorTheme
    };
    // This code is used when you use FormBuilder and just calls the method below
    this.createRegisterForm();

    // this is the old way to do it with out the FormBuilder Service
    // this.registerForm = new FormGroup({
    //     username: new FormControl('', Validators.required),
    //     password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
    //     confirmPassword: new FormControl('', Validators.required)
    //   }, this.passwordMatchValidator);
  }

  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ],
        confirmPassword: ['', Validators.required],
        gender: ['male'],
        knownAs: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required]
      },
      { validator: this.passwordMatchValidator }
    );
    // !!! The key validator is important here. Will not work with Validator or Validators
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null
      : { mismatch: true };
  }

  register() {
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      this.authService.register(this.user).subscribe(next => {
      this.alertify.success('Registration sucessful');
    }, error => {
      this.alertify.error(error);
    }, () => {
      this.authService.login(this.user).subscribe(() => {
        this.router.navigate(['/members']);
      });
    });
  }
   // This is the old way we registered
    // tslint:disable-next-line:max-line-length
    // this.authService.register(this.model).subscribe(next => {this.alertify.success('Registration sucessful'); }, error => {this.alertify.error(error); });
    // console.log(this.model);
}
  cancel() {
    this.cancelRegister.emit(false);
  }
}
