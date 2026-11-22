import { Localized } from '../i18n/localized';

export interface Opening {
  /** Encyclopaedia of Chess Openings code, e.g. 'B90'. */
  eco: string;
  name: Localized;
  /**
   * A line reaching the opening's position from the initial position, in UCI
   * notation separated by spaces. The opening is recognized by the position,
   * so any other move order reaching it gets the same name and code.
   */
  moves: string;
}

/**
 * Well-known openings. Each line must reach a distinct position, and every
 * line is checked by openings.spec.ts.
 */
export const OPENINGS: Opening[] = [
  // ----- A: flank openings, 1.d4 without 1...d5 -----
  {
    eco: 'A00',
    name: { en: 'Polish Opening', fr: 'Ouverture polonaise' },
    moves: 'b2b4',
  },
  {
    eco: 'A00',
    name: { en: 'Grob Opening', fr: 'Attaque Grob' },
    moves: 'g2g4',
  },
  {
    eco: 'A01',
    name: { en: 'Nimzo-Larsen Attack', fr: 'Attaque Nimzo-Larsen' },
    moves: 'b2b3',
  },
  {
    eco: 'A02',
    name: { en: 'Bird Opening', fr: 'Ouverture Bird' },
    moves: 'f2f4',
  },
  {
    eco: 'A04',
    name: { en: 'Réti Opening', fr: 'Ouverture Réti' },
    moves: 'g1f3',
  },
  {
    eco: 'A07',
    name: { en: 'King’s Indian Attack', fr: 'Attaque est-indienne' },
    moves: 'g1f3 d7d5 g2g3',
  },
  {
    eco: 'A10',
    name: { en: 'English Opening', fr: 'Partie anglaise' },
    moves: 'c2c4',
  },
  {
    eco: 'A20',
    name: {
      en: 'English Opening: Reversed Sicilian',
      fr: 'Partie anglaise : sicilienne inversée',
    },
    moves: 'c2c4 e7e5',
  },
  {
    eco: 'A30',
    name: {
      en: 'English Opening: Symmetrical Variation',
      fr: 'Partie anglaise : variante symétrique',
    },
    moves: 'c2c4 c7c5',
  },
  {
    eco: 'A40',
    name: { en: 'Queen’s Pawn Opening', fr: 'Ouverture du pion dame' },
    moves: 'd2d4',
  },
  {
    eco: 'A40',
    name: { en: 'Englund Gambit', fr: 'Gambit Englund' },
    moves: 'd2d4 e7e5',
  },
  {
    eco: 'A43',
    name: { en: 'Old Benoni Defense', fr: 'Défense Benoni ancienne' },
    moves: 'd2d4 c7c5',
  },
  {
    eco: 'A45',
    name: { en: 'Indian Defense', fr: 'Défense indienne' },
    moves: 'd2d4 g8f6',
  },
  {
    eco: 'A45',
    name: { en: 'Trompowsky Attack', fr: 'Attaque Trompowsky' },
    moves: 'd2d4 g8f6 c1g5',
  },
  {
    eco: 'A50',
    name: { en: 'Indian Defense', fr: 'Défense indienne' },
    moves: 'd2d4 g8f6 c2c4',
  },
  {
    eco: 'A51',
    name: { en: 'Budapest Gambit', fr: 'Gambit de Budapest' },
    moves: 'd2d4 g8f6 c2c4 e7e5',
  },
  {
    eco: 'A56',
    name: { en: 'Benoni Defense', fr: 'Défense Benoni' },
    moves: 'd2d4 g8f6 c2c4 c7c5',
  },
  {
    eco: 'A57',
    name: { en: 'Benko Gambit', fr: 'Gambit Benko' },
    moves: 'd2d4 g8f6 c2c4 c7c5 d4d5 b7b5',
  },
  {
    eco: 'A60',
    name: { en: 'Modern Benoni', fr: 'Défense Benoni moderne' },
    moves: 'd2d4 g8f6 c2c4 c7c5 d4d5 e7e6',
  },
  {
    eco: 'A80',
    name: { en: 'Dutch Defense', fr: 'Défense hollandaise' },
    moves: 'd2d4 f7f5',
  },

  // ----- B: 1.e4 without 1...e5 or 1...e6 -----
  {
    eco: 'B00',
    name: { en: 'King’s Pawn Opening', fr: 'Ouverture du pion roi' },
    moves: 'e2e4',
  },
  {
    eco: 'B00',
    name: { en: 'Nimzowitsch Defense', fr: 'Défense Nimzowitsch' },
    moves: 'e2e4 b8c6',
  },
  {
    eco: 'B01',
    name: { en: 'Scandinavian Defense', fr: 'Défense scandinave' },
    moves: 'e2e4 d7d5',
  },
  {
    eco: 'B02',
    name: { en: 'Alekhine Defense', fr: 'Défense Alekhine' },
    moves: 'e2e4 g8f6',
  },
  {
    eco: 'B06',
    name: { en: 'Modern Defense', fr: 'Défense moderne' },
    moves: 'e2e4 g7g6',
  },
  {
    eco: 'B07',
    name: { en: 'Pirc Defense', fr: 'Défense Pirc' },
    moves: 'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6',
  },
  {
    eco: 'B09',
    name: {
      en: 'Pirc Defense: Austrian Attack',
      fr: 'Défense Pirc : attaque autrichienne',
    },
    moves: 'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4',
  },
  {
    eco: 'B10',
    name: { en: 'Caro-Kann Defense', fr: 'Défense Caro-Kann' },
    moves: 'e2e4 c7c6',
  },
  {
    eco: 'B12',
    name: {
      en: 'Caro-Kann Defense: Advance Variation',
      fr: 'Défense Caro-Kann : variante d’avance',
    },
    moves: 'e2e4 c7c6 d2d4 d7d5 e4e5',
  },
  {
    eco: 'B13',
    name: {
      en: 'Caro-Kann Defense: Exchange Variation',
      fr: 'Défense Caro-Kann : variante d’échange',
    },
    moves: 'e2e4 c7c6 d2d4 d7d5 e4d5 c6d5',
  },
  {
    eco: 'B13',
    name: {
      en: 'Caro-Kann Defense: Panov Attack',
      fr: 'Défense Caro-Kann : attaque Panov',
    },
    moves: 'e2e4 c7c6 d2d4 d7d5 e4d5 c6d5 c2c4',
  },
  {
    eco: 'B15',
    name: {
      en: 'Caro-Kann Defense: Main Line',
      fr: 'Défense Caro-Kann : ligne principale',
    },
    moves: 'e2e4 c7c6 d2d4 d7d5 b1c3',
  },
  {
    eco: 'B18',
    name: {
      en: 'Caro-Kann Defense: Classical Variation',
      fr: 'Défense Caro-Kann : variante classique',
    },
    moves: 'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5',
  },
  {
    eco: 'B20',
    name: { en: 'Sicilian Defense', fr: 'Défense sicilienne' },
    moves: 'e2e4 c7c5',
  },
  {
    eco: 'B21',
    name: {
      en: 'Sicilian Defense: Smith-Morra Gambit',
      fr: 'Défense sicilienne : gambit Smith-Morra',
    },
    moves: 'e2e4 c7c5 d2d4 c5d4 c2c3',
  },
  {
    eco: 'B22',
    name: {
      en: 'Sicilian Defense: Alapin Variation',
      fr: 'Défense sicilienne : variante Alapin',
    },
    moves: 'e2e4 c7c5 c2c3',
  },
  {
    eco: 'B23',
    name: {
      en: 'Sicilian Defense: Closed',
      fr: 'Défense sicilienne : variante fermée',
    },
    moves: 'e2e4 c7c5 b1c3',
  },
  {
    eco: 'B23',
    name: {
      en: 'Sicilian Defense: Grand Prix Attack',
      fr: 'Défense sicilienne : attaque Grand Prix',
    },
    moves: 'e2e4 c7c5 b1c3 b8c6 f2f4',
  },
  {
    eco: 'B30',
    name: {
      en: 'Sicilian Defense: Old Sicilian',
      fr: 'Défense sicilienne : ancienne sicilienne',
    },
    moves: 'e2e4 c7c5 g1f3 b8c6',
  },
  {
    eco: 'B30',
    name: {
      en: 'Sicilian Defense: Rossolimo Variation',
      fr: 'Défense sicilienne : variante Rossolimo',
    },
    moves: 'e2e4 c7c5 g1f3 b8c6 f1b5',
  },
  {
    eco: 'B33',
    name: {
      en: 'Sicilian Defense: Sveshnikov Variation',
      fr: 'Défense sicilienne : variante Svechnikov',
    },
    moves: 'e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5',
  },
  {
    eco: 'B34',
    name: {
      en: 'Sicilian Defense: Accelerated Dragon',
      fr: 'Défense sicilienne : dragon accéléré',
    },
    moves: 'e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g7g6',
  },
  {
    eco: 'B40',
    name: {
      en: 'Sicilian Defense: French Variation',
      fr: 'Défense sicilienne : variante française',
    },
    moves: 'e2e4 c7c5 g1f3 e7e6',
  },
  {
    eco: 'B41',
    name: {
      en: 'Sicilian Defense: Kan Variation',
      fr: 'Défense sicilienne : variante Kan',
    },
    moves: 'e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 a7a6',
  },
  {
    eco: 'B44',
    name: {
      en: 'Sicilian Defense: Taimanov Variation',
      fr: 'Défense sicilienne : variante Taïmanov',
    },
    moves: 'e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 b8c6',
  },
  {
    eco: 'B50',
    name: {
      en: 'Sicilian Defense: Modern Variations',
      fr: 'Défense sicilienne : variantes modernes',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6',
  },
  {
    eco: 'B51',
    name: {
      en: 'Sicilian Defense: Moscow Variation',
      fr: 'Défense sicilienne : variante de Moscou',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6 f1b5',
  },
  {
    eco: 'B54',
    name: {
      en: 'Sicilian Defense: Open',
      fr: 'Défense sicilienne : sicilienne ouverte',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4',
  },
  {
    eco: 'B56',
    name: {
      en: 'Sicilian Defense: Classical Variation',
      fr: 'Défense sicilienne : variante classique',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 b8c6',
  },
  {
    eco: 'B70',
    name: {
      en: 'Sicilian Defense: Dragon Variation',
      fr: 'Défense sicilienne : variante du dragon',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6',
  },
  {
    eco: 'B80',
    name: {
      en: 'Sicilian Defense: Scheveningen Variation',
      fr: 'Défense sicilienne : variante Scheveningue',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6',
  },
  {
    eco: 'B90',
    name: {
      en: 'Sicilian Defense: Najdorf Variation',
      fr: 'Défense sicilienne : variante Najdorf',
    },
    moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6',
  },

  // ----- C: 1.e4 e6 and 1.e4 e5 -----
  {
    eco: 'C00',
    name: { en: 'French Defense', fr: 'Défense française' },
    moves: 'e2e4 e7e6',
  },
  {
    eco: 'C01',
    name: {
      en: 'French Defense: Exchange Variation',
      fr: 'Défense française : variante d’échange',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 e4d5',
  },
  {
    eco: 'C02',
    name: {
      en: 'French Defense: Advance Variation',
      fr: 'Défense française : variante d’avance',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 e4e5',
  },
  {
    eco: 'C03',
    name: {
      en: 'French Defense: Tarrasch Variation',
      fr: 'Défense française : variante Tarrasch',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 b1d2',
  },
  {
    eco: 'C10',
    name: {
      en: 'French Defense: Paulsen Variation',
      fr: 'Défense française : variante Paulsen',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 b1c3',
  },
  {
    eco: 'C10',
    name: {
      en: 'French Defense: Rubinstein Variation',
      fr: 'Défense française : variante Rubinstein',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 b1c3 d5e4',
  },
  {
    eco: 'C11',
    name: {
      en: 'French Defense: Classical Variation',
      fr: 'Défense française : variante classique',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6',
  },
  {
    eco: 'C15',
    name: {
      en: 'French Defense: Winawer Variation',
      fr: 'Défense française : variante Winawer',
    },
    moves: 'e2e4 e7e6 d2d4 d7d5 b1c3 f8b4',
  },
  {
    eco: 'C20',
    name: { en: 'King’s Pawn Game', fr: 'Partie du pion roi' },
    moves: 'e2e4 e7e5',
  },
  {
    eco: 'C21',
    name: { en: 'Center Game', fr: 'Partie du centre' },
    moves: 'e2e4 e7e5 d2d4 e5d4',
  },
  {
    eco: 'C21',
    name: { en: 'Danish Gambit', fr: 'Gambit danois' },
    moves: 'e2e4 e7e5 d2d4 e5d4 c2c3',
  },
  {
    eco: 'C23',
    name: { en: 'Bishop’s Opening', fr: 'Partie du fou' },
    moves: 'e2e4 e7e5 f1c4',
  },
  {
    eco: 'C25',
    name: { en: 'Vienna Game', fr: 'Partie viennoise' },
    moves: 'e2e4 e7e5 b1c3',
  },
  {
    eco: 'C30',
    name: { en: 'King’s Gambit', fr: 'Gambit du roi' },
    moves: 'e2e4 e7e5 f2f4',
  },
  {
    eco: 'C31',
    name: {
      en: 'King’s Gambit Declined: Falkbeer Countergambit',
      fr: 'Gambit du roi refusé : contre-gambit Falkbeer',
    },
    moves: 'e2e4 e7e5 f2f4 d7d5',
  },
  {
    eco: 'C33',
    name: { en: 'King’s Gambit Accepted', fr: 'Gambit du roi accepté' },
    moves: 'e2e4 e7e5 f2f4 e5f4',
  },
  {
    eco: 'C40',
    name: { en: 'King’s Knight Opening', fr: 'Ouverture du cavalier roi' },
    moves: 'e2e4 e7e5 g1f3',
  },
  {
    eco: 'C40',
    name: { en: 'Latvian Gambit', fr: 'Gambit letton' },
    moves: 'e2e4 e7e5 g1f3 f7f5',
  },
  {
    eco: 'C40',
    name: { en: 'Elephant Gambit', fr: 'Gambit de l’éléphant' },
    moves: 'e2e4 e7e5 g1f3 d7d5',
  },
  {
    eco: 'C41',
    name: { en: 'Philidor Defense', fr: 'Défense Philidor' },
    moves: 'e2e4 e7e5 g1f3 d7d6',
  },
  {
    eco: 'C42',
    name: { en: 'Petrov’s Defense', fr: 'Défense Petrov' },
    moves: 'e2e4 e7e5 g1f3 g8f6',
  },
  {
    eco: 'C44',
    name: {
      en: 'King’s Knight Opening: Normal Variation',
      fr: 'Ouverture du cavalier roi : variante normale',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6',
  },
  {
    eco: 'C44',
    name: { en: 'Ponziani Opening', fr: 'Ouverture Ponziani' },
    moves: 'e2e4 e7e5 g1f3 b8c6 c2c3',
  },
  {
    eco: 'C44',
    name: { en: 'Scotch Game', fr: 'Partie écossaise' },
    moves: 'e2e4 e7e5 g1f3 b8c6 d2d4',
  },
  {
    eco: 'C45',
    name: { en: 'Scotch Game', fr: 'Partie écossaise' },
    moves: 'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4',
  },
  {
    eco: 'C46',
    name: { en: 'Three Knights Opening', fr: 'Partie des trois cavaliers' },
    moves: 'e2e4 e7e5 g1f3 b8c6 b1c3',
  },
  {
    eco: 'C47',
    name: { en: 'Four Knights Game', fr: 'Partie des quatre cavaliers' },
    moves: 'e2e4 e7e5 g1f3 b8c6 b1c3 g8f6',
  },
  {
    eco: 'C50',
    name: { en: 'Italian Game', fr: 'Partie italienne' },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4',
  },
  {
    eco: 'C50',
    name: {
      en: 'Italian Game: Giuoco Piano',
      fr: 'Partie italienne : Giuoco piano',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5',
  },
  {
    eco: 'C51',
    name: {
      en: 'Italian Game: Evans Gambit',
      fr: 'Partie italienne : gambit Evans',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4',
  },
  {
    eco: 'C53',
    name: {
      en: 'Italian Game: Giuoco Piano, Main Line',
      fr: 'Partie italienne : Giuoco piano, ligne principale',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3',
  },
  {
    eco: 'C55',
    name: {
      en: 'Italian Game: Two Knights Defense',
      fr: 'Partie italienne : défense des deux cavaliers',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6',
  },
  {
    eco: 'C57',
    name: {
      en: 'Italian Game: Two Knights Defense, Knight Attack',
      fr: 'Partie italienne : deux cavaliers, attaque du cavalier',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5',
  },
  {
    eco: 'C57',
    name: {
      en: 'Italian Game: Two Knights Defense, Fried Liver Attack',
      fr: 'Partie italienne : deux cavaliers, attaque Fegatello',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5 e4d5 f6d5 g5f7',
  },
  {
    eco: 'C60',
    name: { en: 'Ruy Lopez', fr: 'Partie espagnole' },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1b5',
  },
  {
    eco: 'C65',
    name: {
      en: 'Ruy Lopez: Berlin Defense',
      fr: 'Partie espagnole : défense berlinoise',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6',
  },
  {
    eco: 'C68',
    name: {
      en: 'Ruy Lopez: Exchange Variation',
      fr: 'Partie espagnole : variante d’échange',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5c6',
  },
  {
    eco: 'C70',
    name: {
      en: 'Ruy Lopez: Morphy Defense',
      fr: 'Partie espagnole : défense Morphy',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6',
  },
  {
    eco: 'C84',
    name: {
      en: 'Ruy Lopez: Closed',
      fr: 'Partie espagnole : variante fermée',
    },
    moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7',
  },
  {
    eco: 'C89',
    name: {
      en: 'Ruy Lopez: Marshall Attack',
      fr: 'Partie espagnole : attaque Marshall',
    },
    moves:
      'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 e8g8 c2c3 d7d5',
  },

  // ----- D: 1.d4 d5, Grünfeld -----
  {
    eco: 'D00',
    name: { en: 'Queen’s Pawn Game', fr: 'Partie du pion dame' },
    moves: 'd2d4 d7d5',
  },
  {
    eco: 'D00',
    name: { en: 'London System', fr: 'Système de Londres' },
    moves: 'd2d4 d7d5 c1f4',
  },
  {
    eco: 'D02',
    name: { en: 'London System', fr: 'Système de Londres' },
    moves: 'd2d4 d7d5 g1f3 g8f6 c1f4',
  },
  {
    eco: 'D04',
    name: { en: 'Colle System', fr: 'Système Colle' },
    moves: 'd2d4 d7d5 g1f3 g8f6 e2e3',
  },
  {
    eco: 'D06',
    name: { en: 'Queen’s Gambit', fr: 'Gambit dame' },
    moves: 'd2d4 d7d5 c2c4',
  },
  {
    eco: 'D07',
    name: {
      en: 'Queen’s Gambit Declined: Chigorin Defense',
      fr: 'Gambit dame refusé : défense Tchigorine',
    },
    moves: 'd2d4 d7d5 c2c4 b8c6',
  },
  {
    eco: 'D08',
    name: {
      en: 'Queen’s Gambit Declined: Albin Countergambit',
      fr: 'Gambit dame refusé : contre-gambit Albin',
    },
    moves: 'd2d4 d7d5 c2c4 e7e5',
  },
  {
    eco: 'D10',
    name: { en: 'Slav Defense', fr: 'Défense slave' },
    moves: 'd2d4 d7d5 c2c4 c7c6',
  },
  {
    eco: 'D20',
    name: { en: 'Queen’s Gambit Accepted', fr: 'Gambit dame accepté' },
    moves: 'd2d4 d7d5 c2c4 d5c4',
  },
  {
    eco: 'D30',
    name: { en: 'Queen’s Gambit Declined', fr: 'Gambit dame refusé' },
    moves: 'd2d4 d7d5 c2c4 e7e6',
  },
  {
    eco: 'D35',
    name: {
      en: 'Queen’s Gambit Declined: Normal Defense',
      fr: 'Gambit dame refusé : défense normale',
    },
    moves: 'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6',
  },
  {
    eco: 'D35',
    name: {
      en: 'Queen’s Gambit Declined: Exchange Variation',
      fr: 'Gambit dame refusé : variante d’échange',
    },
    moves: 'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c4d5 e6d5',
  },
  {
    eco: 'D43',
    name: { en: 'Semi-Slav Defense', fr: 'Défense semi-slave' },
    moves: 'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6',
  },
  {
    eco: 'D80',
    name: { en: 'Grünfeld Defense', fr: 'Défense Grünfeld' },
    moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5',
  },

  // ----- E: 1.d4 Nf6 2.c4 e6 or g6 -----
  {
    eco: 'E00',
    name: { en: 'Catalan Opening', fr: 'Ouverture catalane' },
    moves: 'd2d4 g8f6 c2c4 e7e6 g2g3',
  },
  {
    eco: 'E11',
    name: { en: 'Bogo-Indian Defense', fr: 'Défense bogo-indienne' },
    moves: 'd2d4 g8f6 c2c4 e7e6 g1f3 f8b4',
  },
  {
    eco: 'E12',
    name: { en: 'Queen’s Indian Defense', fr: 'Défense ouest-indienne' },
    moves: 'd2d4 g8f6 c2c4 e7e6 g1f3 b7b6',
  },
  {
    eco: 'E20',
    name: { en: 'Nimzo-Indian Defense', fr: 'Défense nimzo-indienne' },
    moves: 'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4',
  },
  {
    eco: 'E60',
    name: { en: 'King’s Indian Defense', fr: 'Défense est-indienne' },
    moves: 'd2d4 g8f6 c2c4 g7g6',
  },
  {
    eco: 'E80',
    name: {
      en: 'King’s Indian Defense: Sämisch Variation',
      fr: 'Défense est-indienne : variante Sämisch',
    },
    moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f3',
  },
  {
    eco: 'E90',
    name: {
      en: 'King’s Indian Defense: Normal Variation',
      fr: 'Défense est-indienne : variante normale',
    },
    moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3',
  },
];
