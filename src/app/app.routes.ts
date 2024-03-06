import { Routes } from '@angular/router';
import { MainComponent } from './components/remote-app/pages/main/main.component';
import { RemoteAppComponent } from './components/remote-app/remote-app.component';

export const routes: Routes = [
    {
        path: '',
        component: RemoteAppComponent,
        children: [
            {
                path: '',
                redirectTo: 'main',
                pathMatch: 'full'
            },
            {
                path: 'main',
                component: MainComponent
            }
        ]
    }
];

