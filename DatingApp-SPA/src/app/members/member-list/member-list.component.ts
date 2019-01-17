import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination, PaginatedResult } from 'src/app/_models/Pagination';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];
  user: User = JSON.parse(localStorage.getItem('user'));
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  userParams: any = {};
  pagination: Pagination;

  constructor(private userServices: UserService, private alertify: AlertifyService, private route: ActivatedRoute) { }

  ngOnInit() {
    // This called old method that used ? to get member data
    // this.loadUsers(); Now it uses route data to get the users for MemberList
    // See Section 7 for more info

    this.route.data.subscribe(data => {
      this.users = data['users'].result;
      this.pagination = data['users'].pagination;
    });
    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
  }

  resetFilters() {
    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
    this.paginatedLoadUsers();
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.paginatedLoadUsers();
  }

  paginatedLoadUsers() {
    this.userServices.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
    .subscribe(
      (res: PaginatedResult<User[]>) => {
        this.users = res.result;
        this.pagination = res.pagination;
      },
      error => {
        this.alertify.error(error);
      }
    );
  }

// Old loadUsers method which used a ? to get member data
  // loadUsers() {
  //   this.userServices.getUsers().subscribe((users: User[]) => {
  //     this.users = users;
  //   }, error => {this.alertify.error(error); }
  //   ); }
}
