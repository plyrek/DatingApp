import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {

  // Allows the MemberEditComponet to keep tabs of it's child HTML object.
  // In this case the form
  @ViewChild('editForm') editForm: NgForm;

  // this varible declaration must be before the HostListener and below the @ViewChild for everything to work
  user: User;
  photoUrl: string;

  // Stops the user from closing the browser if changes are made to the form
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }
  constructor(private route: ActivatedRoute, private userService: UserService, private authService: AuthService,
    private alertify: AlertifyService) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
      this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    });
  }

  // Updates the user profile info by calling a method in the UserService. Uses the AuthService to decode the token and
  // to grab the id of the user and also passess in the User information from the user interface (_Models)
  updateUser() {
    this.userService.updateUser(this.authService.decodedToken.nameid, this.user).subscribe(next => {
      this.alertify.success('Profile updated successfully');

    // This is a reset of the form using form control methods.
    // It is made possible by accessing the child object above with @ViewChild
      this.editForm.reset(this.user); }, error => {
      this.alertify.error('An error has occured. Please try again.');
    });
  }

  // This method updates the photo on the member-edit component html by taking the photoUrl string from the Output
  // decorator from the photo-editor component and returning it to the member edit html.
  updateMainPhoto(photoUrl: string){
    this.user.photoUrl = photoUrl;
  }
}
