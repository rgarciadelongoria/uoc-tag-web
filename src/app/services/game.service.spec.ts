import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { ApiService } from '@services/api.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { GameData, GameTicketPrizeData } from '@interfaces/game.interface';
import { GameCodes } from '../enums/global.enum';

describe('GameService', () => {
  let service: GameService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let router: Router;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [GameService, { provide: ApiService, useValue: spy }]
    });
    service = TestBed.inject(GameService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch games by code with prizes', async () => {
    const gameData: GameData[] = [{
      _id: '',
      code: GameCodes.LOTERIA_NACIONAL,
      date: '',
      data: {
        info: {
          prizes: [],
          raw: ''
        }
      },
      __v: 0
    }];
    apiServiceSpy.get.and.returnValue(of(gameData));

    const result = await service.getAllGamesByCodeOnlyWithPrizes(GameCodes.LOTERIA_NACIONAL);

    expect(result).toEqual(gameData);
    expect(apiServiceSpy.get).toHaveBeenCalledWith(`${service['apiGame']}?limit=10&offset=0&code=ln&onlyWithPrizes=true`);
  });

  it('should return empty array on error fetching games by code with prizes', async () => {
    apiServiceSpy.get.and.throwError('Some error');

    const result = await service.getAllGamesByCodeOnlyWithPrizes(GameCodes.LOTERIA_NACIONAL);

    expect(result).toEqual([]);
  });

  it('should fetch user ticket prizes', async () => {
    const ticketPrizes: GameTicketPrizeData[] = [
      {
        ticket: {
          _id: '',
          code: '',
          date: '',
          user: '',
          data: {
            info: {
              number: '',
              code: ''
            }
          }
        },
        game: {
          _id: '',
          code: GameCodes.LOTERIA_NACIONAL,
          date: '',
          data: {
            info: {
              raw: '',
              prizes: []
            }
          },
          __v: 0
        },
        prize: {
          number: '',
          quantity: 0
        }
      }
    ];

    apiServiceSpy.get.and.returnValue(of(ticketPrizes));
  
    const result = await service.getAllTicketsPrizesByUser();
  
    expect(result).toEqual(ticketPrizes);
    expect(apiServiceSpy.get).toHaveBeenCalledWith(`${service['apiGame']}/ticket/all?limit=10&offset=0`);
  });
  
  it('should return empty array on error fetching user ticket prizes', async () => {
    apiServiceSpy.get.and.throwError('Some error');
  
    const result = await service.getAllTicketsPrizesByUser();
  
    expect(result).toEqual([]);
  });
  
  it('should fetch ticket prize by ticket id', async () => {
    const ticketPrize: GameTicketPrizeData = {
      ticket: {
        _id: '',
        code: '',
        date: '',
        user: '',
        data: {
          info: {
            number: '',
            code: ''
          }
        }
      },
      game: {
        _id: '',
        code: GameCodes.LOTERIA_NACIONAL,
        date: '',
        data: {
          info: {
            raw: '',
            prizes: []
          }
        },
        __v: 0
      },
      prize: {
        number: '',
        quantity: 0
      }
    };

    apiServiceSpy.get.and.returnValue(of(ticketPrize));
  
    const result = await service.getTicketPrizeByTicketId('SOME_TICKET_ID');
  
    expect(result).toEqual(ticketPrize);
    expect(apiServiceSpy.get).toHaveBeenCalledWith(`${service['apiGame']}/ticket/SOME_TICKET_ID`);
  });
  
  it('should return null on error fetching ticket prize by ticket id', async () => {
    apiServiceSpy.get.and.throwError('Some error');
  
    const result = await service.getTicketPrizeByTicketId('SOME_TICKET_ID');
  
    expect(result).toBeNull();
  });
  
  it('should navigate to game detail if game has prizes', () => {
    const gameData: GameData = {
      _id: '',
      code: GameCodes.LOTERIA_NACIONAL,
      date: '',
      data: {
        info: {
          prizes: [
            {
              number: '',
              quantity: 0
            }
          ],
          raw: ''
        }
      },
      __v: 0
    };

    spyOn(router, 'navigate');
  
    service.openGame(gameData);
  
    expect(router.navigate).toHaveBeenCalledWith(['/main/', 'game-detail-' + gameData.code], {
      state: {
        game: gameData,
      },
    });
  });
  
  it('should not navigate if game has no prizes', () => {
    const gameData: GameData = {
      _id: '',
      code: GameCodes.LOTERIA_NACIONAL,
      date: '',
      data: {
        info: {
          prizes: [],
          raw: ''
        }
      },
      __v: 0
    };

    spyOn(router, 'navigate');
  
    service.openGame(gameData);
  
    expect(router.navigate).not.toHaveBeenCalled();
  });  
});
