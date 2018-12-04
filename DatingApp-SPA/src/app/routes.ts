import {Routes} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';
import { ListComponent } from './list/list.component';
import { AuthGuard } from './_guards/auth.guard';

export const appRoutes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        children: [ {path:  'members', component: MemberListComponent},
        {path: 'messages', component: MessagesComponent},
        {path: 'list', component: ListComponent},]
    },
    {path: 'home', component: HomeComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
