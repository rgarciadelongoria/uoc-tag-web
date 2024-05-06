import { TestBed } from '@angular/core/testing';
import { PushService } from './push.service';
import { UserService } from './user.service';
import { ApiService } from '@services/api.service';
import { StorageService } from '@services/storage.service';
import { BehaviorSubject, of } from 'rxjs';
import { LoginData, UserData } from '@interfaces/user.interface';
import { PushData } from '@interfaces/push.interface';
import { LocalStorageKeys } from '../enums/global.enum';
import { TicketData } from '../interfaces/ticket.interface';

// describe('PushService', () => {
//   let service: PushService;
//   let userServiceSpy: jasmine.SpyObj<UserService>;
//   let apiServiceSpy: jasmine.SpyObj<ApiService>;
//   let storageServiceSpy: jasmine.SpyObj<StorageService>;

//   beforeEach(() => {
//     const userServiceSpyObj = jasmine.createSpyObj('UserService', ['getUserSubject', 'getAllPushesByUser']);
//     const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['post', 'delete']);
//     const storageServiceSpyObj = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

//     TestBed.configureTestingModule({
//       providers: [
//         PushService,
//         { provide: UserService, useValue: userServiceSpyObj },
//         { provide: ApiService, useValue: apiServiceSpyObj },
//         { provide: StorageService, useValue: storageServiceSpyObj }
//       ]
//     });
//     service = TestBed.inject(PushService);
//     userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
//     apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
//     storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('should initialize push service and register token when user is available', async () => {
//     const user = { _id: 'user_id' };
//     const userSubject = new BehaviorSubject<UserData>(user as UserData);
//     userServiceSpy.getUserSubject.and.returnValue(userSubject);
//     const pushesSubject = new BehaviorSubject<PushData[]>([]);
//     userServiceSpy.getAllPushesByUser.and.callFake(() => Promise.resolve(pushesSubject.value));
//     storageServiceSpy.getItem.and.returnValue('push_token');
//     apiServiceSpy.post.and.returnValue(of({ token: 'push_token' }));

//     service.init();

//     expect(apiServiceSpy.post).toHaveBeenCalledOnceWith(`${service['apiPush']}`, { token: 'push_token', user: 'user_id' });
//     expect(storageServiceSpy.setItem).toHaveBeenCalledOnceWith('SHELL_PUSH_TOKEN', 'push_token');
//   });

//   it('should not register token if user is not available', async () => {
//     const user = { _id: 'user_id' };
//     const userSubject = new BehaviorSubject<UserData>(user as UserData);
//     userServiceSpy.getUserSubject.and.returnValue(userSubject);

//     service.init();

//     expect(apiServiceSpy.post).not.toHaveBeenCalled();
//     expect(storageServiceSpy.setItem).not.toHaveBeenCalled();
//   });
// });

describe('UserService', () => {
  let service: UserService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['post', 'get']);
    const storageServiceSpyObj = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService, useValue: apiServiceSpyObj },
        { provide: StorageService, useValue: storageServiceSpyObj }
      ]
    });
    service = TestBed.inject(UserService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create user by UUID', async () => {
    const uuid = 'user_uuid';
    const userData: UserData = { _id: 'user_id', email: `${uuid}@example.com`, name: uuid, roles: [], isActive: true };
    apiServiceSpy.post.withArgs(`${service['apiUser']}`, jasmine.any(Object)).and.returnValue(of(userData));

    const createdUser = await service.createUserByUuid(uuid);

    expect(createdUser).toEqual(userData);
  });

  it('should login by UUID', async () => {
    const uuid = 'user_uuid';
    const loginData = { user: { _id: 'user_id', email: `${uuid}@example.com`, name: uuid, roles: [], isActive: true }, token: 'user_token' };
    spyOn(service, 'login').and.returnValue(Promise.resolve(loginData));

    const loggedInUser = await service.loginByUuid(uuid);

    expect(loggedInUser).toEqual(loginData);
  });

  it('should login with email and password', async () => {
    const email = 'user@example.com';
    const password = 'password';
    const loginData = { user: { _id: 'user_id', email, name: 'user', roles: [], isActive: true }, token: 'user_token' };
    apiServiceSpy.post.withArgs(`${service['apiUser']}/login`, jasmine.any(Object)).and.returnValue(of(loginData));

    const loggedInUser = await service.login(email, password);

    expect(loggedInUser).toEqual(loginData);
  });

  it('should check token expiration', async () => {
    const uuid = 'user_uuid';
    const tokenData = { token: 'user_token', date: Date.now() };
    storageServiceSpy.getItem.withArgs(LocalStorageKeys.TOKEN).and.returnValue(JSON.stringify(tokenData));
    spyOn(service, 'loginByUuid').and.returnValue(Promise.resolve({} as LoginData));

    await service.checkTokenExpiration(uuid);

    expect(service.loginByUuid).toHaveBeenCalledWith(uuid);
  });

  it('should get all tickets by user', async () => {
    const ticketsData: TicketData[] = [{ _id: 'ticket1' }, { _id: 'ticket2' }] as TicketData[];
    apiServiceSpy.get.withArgs(`${service['apiUser']}/ticket/all?limit=100&offset=0`).and.returnValue(of(ticketsData));

    const userTickets = await service.getAllTicketsByUser();

    expect(userTickets).toEqual(ticketsData);
  });

  it('should get all pushes by user', async () => {
    const pushesData: PushData[] = [{ _id: 'push1' }, { _id: 'push2' }] as PushData[];
    apiServiceSpy.get.withArgs(`${service['apiUser']}/push/all?limit=100&offset=0`).and.returnValue(of(pushesData));

    const userPushes = await service.getAllPushesByUser();

    expect(userPushes).toEqual(pushesData);
  });
});

