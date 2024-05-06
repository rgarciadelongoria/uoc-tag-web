import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RemoteAppComponent } from './remote-app.component';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';

describe('RemoteAppComponent', () => {
  let component: RemoteAppComponent;
  let fixture: ComponentFixture<RemoteAppComponent>;
  let mockRouter: { events: any; };

  beforeEach(async () => {
    mockRouter = { events: of(new NavigationEnd(0, 'previousUrl', 'currentUrl')) };

    await TestBed.configureTestingModule({
      imports: [RemoteAppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RemoteAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit without uuid', fakeAsync(() => {
    const navigationEndEvent = new NavigationEnd(1, '/', '/');
    mockRouter.events = of(navigationEndEvent);

    (component as any).uuidSrv.init = () => null;
    (component as any).uuidSrv.getUuid = () => null;

    const translateSrvUseSpy = spyOn((component as any).translateSrv, 'use');
    const pushSrvInitSpy = spyOn((component as any).pushSrv, 'init');
    const uuidSrvInitSpy = spyOn((component as any).uuidSrv, 'init');
    const importScriptsSpy = spyOn((component as any), 'importScripts');
    const importStylesSpy = spyOn((component as any), 'importStyles');
    
    component.ngOnInit();

    tick();

    expect(translateSrvUseSpy).toHaveBeenCalledWith('en');
    expect(pushSrvInitSpy).toHaveBeenCalled();
    expect(uuidSrvInitSpy).toHaveBeenCalled();
    expect(importScriptsSpy).toHaveBeenCalled();
    expect(importStylesSpy).toHaveBeenCalled();
  }));

  it('should call ngOnInit with uuid', fakeAsync(() => {
    const navigationEndEvent = new NavigationEnd(1, '/', '/');
    mockRouter.events = of(navigationEndEvent);

    (component as any).uuidSrv.init = () => null;
    (component as any).uuidSrv.getUuid = () => '1234';
    (component as any).userSrv.checkTokenExpiration = () => null;

    const translateSrvUseSpy = spyOn((component as any).translateSrv, 'use');
    const checkTokenExpirationSpy = spyOn((component as any).userSrv, 'checkTokenExpiration');
    const pushSrvInitSpy = spyOn((component as any).pushSrv, 'init');
    const uuidSrvInitSpy = spyOn((component as any).uuidSrv, 'init');
    const importScriptsSpy = spyOn((component as any), 'importScripts');
    const importStylesSpy = spyOn((component as any), 'importStyles');
    
    component.ngOnInit();

    tick();

    expect(translateSrvUseSpy).toHaveBeenCalledWith('en');
    expect(checkTokenExpirationSpy).toHaveBeenCalledWith('1234');
    expect(pushSrvInitSpy).toHaveBeenCalled();
    expect(uuidSrvInitSpy).toHaveBeenCalled();
    expect(importScriptsSpy).toHaveBeenCalled();
    expect(importStylesSpy).toHaveBeenCalled();
  }));
});
