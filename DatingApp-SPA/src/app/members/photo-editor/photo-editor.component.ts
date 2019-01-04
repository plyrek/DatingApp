import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Photo } from 'src/app/_models/photo';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];

  // Output decorator -- a varariable of type eventEmitter<string> which outputs value
  // from child compenent to parent. Output is declared below in the setMainPhoto() method below
  // and is sent to the member-edit.component
  @Output() getMemberPhotoChange = new EventEmitter<string>();
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMain: Photo;

  constructor(private authService: AuthService, private userService: UserService,
    private alertify: AlertifyService) { }

  ngOnInit() {
    this.initializeUploader();
   }

    fileOverBase(e: any): void {
      this.hasBaseDropZoneOver = e;
    }

    initializeUploader() {
      this.uploader = new FileUploader(
        {
          url: this.baseUrl + 'userdata/' + this.authService.decodedToken.nameid + '/photos',
          authToken: 'Bearer ' + localStorage.getItem('token'),
          isHTML5: true,
          allowedFileType: ['image'],
          removeAfterUpload: true,
          autoUpload: false,
          maxFileSize: 10 * 1024 * 1024
        });
      this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false; };

      this.uploader.onSuccessItem = (item, response, status, headers) => {
        if (response) {
          const res: Photo = JSON.parse(response);
          const photo = {
            id: res.id,
            url: res.url,
            dateAdded: res.dateAdded,
            description: res.description,
            isMain: res.isMain
          };
          this.photos.push(photo);
        }
      };
    }
  setMainPhoto(photo: Photo) {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
    this.currentMain = this.photos.filter(p => p.isMain === true) [0];
    this.currentMain.isMain = false;
    photo.isMain = true;

    // Emit the output method to the member-edit component sending the photo.url as a string from the const(JSON object above)
    // !!!This was depreciated for the BehaviourSubject method!!!
    // this.getMemberPhotoChange.emit(photo.url);

    // This is the replacement code that uses the BehaviourSubject method
    this.authService.changeMemberPhoto(photo.url);

    // This code sets the currentUser photo.url variable in the authServer to the photoUrl from the BehaviorSubject
    this.authService.currentUser.photoUrl = photo.url;

    // This code then writes the entire currentUser variable including the new photo.url back into the user property in local storage
    localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
  }, error => { this.alertify.error(error);
    });
  }

  deletePhoto(id: number) {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
        this.alertify.success('Photo has been deleted');
      }, error => {
        this.alertify.error('Failed to delete the photo');
      });
    });


  }


}
