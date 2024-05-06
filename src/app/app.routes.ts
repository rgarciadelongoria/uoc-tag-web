import { Routes } from '@angular/router';
import { ScanComponent } from './components/remote-app/pages/scan/scan.component';
import { MainComponent } from './components/remote-app/pages/main/main.component';
import { RemoteAppComponent } from './components/remote-app/remote-app.component';
import { TicketsComponent } from './components/remote-app/pages/tickets/tickets.component';
import { MenuComponent } from './components/remote-app/pages/menu/menu.component';
import { GamesComponent } from './components/remote-app/pages/games/games.component';
import { GameDetailLnComponent } from './components/remote-app/pages/game-detail-ln/game-detail-ln.component';

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
                component: MainComponent,
                children: [
                    {
                        path: 'games',
                        component: GamesComponent
                    },
                    {
                        path: 'game-detail-ln',
                        component: GameDetailLnComponent,    
                    },
                    {
                        path: 'scan',
                        component: ScanComponent    
                    },
                    {
                        path: 'tickets',
                        component: TicketsComponent
                    },
                    {
                        path: 'menu',
                        component: MenuComponent
                    }
                ]
            }
        ]
    }
];

