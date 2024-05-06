export interface LnBestGames {
    primerPremio:               BestGamePrize;
    segundoPremio:              BestGamePrize;
    extraccionesDeCuatroCifras: BestGamePrize[];
    extraccionesDeTresCifras:   BestGamePrize[];
    extraccionesDeDosCifras:    BestGamePrize[];
    reintegros:                 BestGamePrize[];
    urlListadoOficial:          string;
    precioDecimo:               number;
}

export interface BestGamePrize {
    decimo:        string;
    tabla:         null;
    alambre:       null;
    ordenFila:     number;
    fila:          number;
    orden:         number;
    prize:         number;
    prizeType:     string;
    showFolded:    boolean;
}
