import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/Pagination';
import { map } from 'rxjs/operators';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})

export class UserService {
baseUrl = environment.apiUrl;

constructor(private http: HttpClient) { }

  // Old getUsers without pagination. In the new getUsers method we must
  // pass in the page and the items per page as required by our paginated API
  // The Observable is also not placed on the User class but the PaginatedResult class
  // Which contains both the User information and the paginiation information from the API

      // getUsers(): Observable<User[]> {
      //   return this.http.get<User[]>(this.baseUrl + 'userdata');
      // }

// ------- Get User Method Start--------
getUsers(page?, itemsPerPage?, userParams?, likesParam?): Observable<PaginatedResult<User[]>> {
  // This is used to store the info coming back from a get user call.
  // Both the Users and the Pagination info in the headers.
  // The class resides in the pagination interface model, but is initialized here on the call.
  const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

  let params = new HttpParams();

  if (page != null && itemsPerPage != null) {
    params = params.append('pageNumber', page);
    params = params.append('pageSize', itemsPerPage);
  }

  if (userParams != null) {
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
  }

  if (likesParam === 'Likers') {
    params = params.append('likers', 'true');
  }

  if (likesParam === 'Likees') {
    params = params.append('likees', 'true');
  }

  // The new http.Get request returns the optional observable response to load the
  // responses into the paginatedReults class. Without the optional observable in the old
  // code above we were only getting the body response. ie Users.
  // The pipe method allows access observable and the map retrieves the different values
  // For the response.headers we get the Pagination as a JSON serialized string and then we use JSON.parse to
  // turn the information into an JSON object for the paginated results class, which matches the interface.
  // Finally we return the full infomation by returning the paginatedResult class. This is duplicated below for messages.
  return this.http.get<User[]>(this.baseUrl + 'userdata', {observe: 'response', params}).pipe(
    map(response => {
      paginatedResult.result = response.body;
      if (response.headers.get('Pagination') != null) {
        paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
      }
      return paginatedResult;
    })
  );
}
// ------- getUsers Method end -------

// ------- getUser Method --------
getUser(id: number): Observable<User> {
  return this.http.get<User>(this.baseUrl + 'userdata/' + id);
}

// ------- updateUser Method --------
  // Method called from the member-edit component to connect to the server and save changed users profile data
updateUser(id: number, user: User) {
  return this.http.put(this.baseUrl + 'userdata/' + id, user);
}

// ------- setMainPhoto Method --------
  // Method called from the photo-editor component to connect to the server and change main photo property
setMainPhoto(userId: number, id: number) {
  return this.http.post(this.baseUrl + 'userdata/' + userId + '/photos/' + id + '/setMain', {} );
}

// ------- deletePhoto Method --------
deletePhoto(userId: number, id: number) {
  return this.http.delete(this.baseUrl + 'userdata/' + userId + '/photos/' + id);
}

sendLike(id: Number, recipientId: Number) {
  return this.http.post(this.baseUrl + 'userdata/' + id + '/like/' + recipientId, {});
}

getMessages(id: number, page?, itemsPerPage?, messageContainer?) {
  const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();

  let params = new HttpParams();

  params = params.append('messageContainer', messageContainer);

  if (page != null && itemsPerPage != null) {
    params = params.append('pageNumber', page);
    params = params.append('pageSize', itemsPerPage);
  }

  return this.http.get<Message[]>(this.baseUrl + 'userdata/' + id + '/messages', {observe: 'response', params})
    .pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
}

getMessageThread(id: number, recipientId: number) {
  return this.http.get<Message[]>(this.baseUrl + 'userdata/' + id + '/messages/thread/' + recipientId);
}

sendMessage(id: number, message: Message) {
  return this.http.post(this.baseUrl + 'userdata/' + id + '/messages', message);
}

deleteMessage(id: number, userId: number) {
  return this.http.post(this.baseUrl + 'userdata/' + userId + '/messages/' + id, {});
}

markAsRead(userId: number, messageid: number) {
  return this.http.post(this.baseUrl + 'userdata/' + userId + '/messages/' + messageid + '/read', {})
  .subscribe();
}

}
