import { TestBed, inject } from '@angular/core/testing';
import { CoreService } from './core.service';
import { StorageService } from './storage.service';
import { ShellActions } from '../enums/shell.enum';

describe('CoreService', () => {
  let service: CoreService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreService, StorageService]
    });
    service = TestBed.inject(CoreService);
    storageService = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true if shell version matches remote version', () => {
    spyOn(storageService, 'getItem').and.returnValue('0.0.0');
    const hasShell = service.hasShell();
    expect(hasShell).toBeTrue();
    expect(storageService.getItem).toHaveBeenCalledWith(ShellActions.SHELL_VERSION);
  });

  it('should return false if shell version does not match remote version', () => {
    spyOn(storageService, 'getItem').and.returnValue('1.0.0');
    const hasShell = service.hasShell();
    expect(hasShell).toBeFalse();
    expect(storageService.getItem).toHaveBeenCalledWith(ShellActions.SHELL_VERSION);
  });

  it('should return false if shell version is not set', () => {
    spyOn(storageService, 'getItem').and.returnValue(null);
    const hasShell = service.hasShell();
    expect(hasShell).toBeFalse();
    expect(storageService.getItem).toHaveBeenCalledWith(ShellActions.SHELL_VERSION);
  });
});
