import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, HttpApiErrors } from './api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from './storage.service';
import { LocalStorageKeys } from '@enums/global.enum';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService, StorageService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add authorization token to headers for GET request', () => {
    const url = 'https://api.example.com/data';
    service.get(url).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.has('Authorization')).toBe(true);
  });

  it('should add authorization token and content type to headers for POST request', () => {
    const url = 'https://api.example.com/data';
    const body = { key: 'value' };
    service.post(url, body).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
  });

  it('should add authorization token to headers for DELETE request', () => {
    const url = 'https://api.example.com/data';
    service.delete(url).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.has('Authorization')).toBe(true);
  });

  it('should handle 401 Unauthorized error and remove token', inject([StorageService], (storageService: StorageService) => {
    const url = 'https://api.example.com/data';
    spyOn(storageService, 'removeItem');

    service.get(url).subscribe(
      () => fail('should have failed with 401 error'),
      (error) => {
        expect(error.status).toBe(401);
        expect(error.statusText).toBe(HttpApiErrors.UNAUTHORIZED);
      }
    );

    const req = httpMock.expectOne(url);
    req.flush('', { status: 401, statusText: 'Unauthorized' });
  }));
});
