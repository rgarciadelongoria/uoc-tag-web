import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StorageService } from '@services/storage.service';
import { ShellErrors } from '@enums/shell.enum';

@Component({
  selector: 'app-remote-app',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HttpClientModule,
    
  ],
  providers: [],
  templateUrl: './remote-app.component.html',
  styleUrl: './remote-app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RemoteAppComponent implements OnInit {
  
  constructor(
    private storageSrv: StorageService
  ) {}

  ngOnInit(): void {
    this.setNoErrorLoadingRemote();
    // Import external styles and scripts for shell
    this.importStyles();
    this.importScripts();
  }

  /*
  Shell logic
  */

  private setNoErrorLoadingRemote() {
    this.storageSrv.setItem(ShellErrors.SHELL_LOADING_REMOTE_OK, "true");
  }

  private importScripts() {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js',
      'https://cdn.jsdelivr.net/npm/ionicons/dist/ionicons/ionicons.esm.js'
    ]

    const head = document.head;

    scripts.forEach(script => {
      const scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.src = script;
      scriptEl.async = false;
      document.head.appendChild(scriptEl);
      head.insertBefore(scriptEl, head.firstElementChild);
    });
  }

  private importStyles() {
    const styles = [
      'https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css',
    ]

    const head = document.head;

    styles.forEach(style => {
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = style;
      head.insertBefore(linkEl, head.firstElementChild);
    });
  }
}
