import type { Lesson } from './lesson.model';

/** 1.e4 c6 2.d4 d5: the starting point of the main variations. */
const MAIN = 'e2e4 c7c6 d2d4 d7d5';
/** 1.e4 c6: the starting point of the sidelines on move 2. */
const START = 'e2e4 c7c6';

const ADVANCE = `${MAIN} e4e5 c6c5`;
const EXCHANGE = `${MAIN} e4d5 c6d5`;
const TARTAKOWER = `${MAIN} b1c3 d5e4 c3e4 g8f6 e4f6 e7f6`;
const TARTAKOWER_SETUP = `${TARTAKOWER} c2c3 f8d6 f1d3 e8g8 d1c2 f8e8 g1e2 g7g6`;
const TWO_KNIGHTS = `${START} b1c3 d7d5 g1f3`;

/**
 * Caro-Kann course (see courses.ts), from Black's point of view. Every line is
 * checked by lessons.spec.ts.
 */
export const CARO_KANN_LESSONS: Lesson[] = [
  // ----- main variations -----
  {
    id: 'caro-kann-advance',
    section: 'opening',
    course: 'caro-kann',
    title: {
      en: 'Advance Variation: 3...c5',
      fr: 'Variante d’avance : 3...c5',
    },
    summary: {
      en: '1.e4 c6 2.d4 d5 3.e5 c5: hit d4 at once, with the bishop still free.',
      fr: '1.e4 c6 2.d4 d5 3.e5 c5 : frapper d4 tout de suite, avec le fou encore libre.',
    },
    steps: [
      {
        title: { en: 'The idea of 3...c5', fr: 'L’idée de 3...c5' },
        text: {
          en: [
            'After 3.e5 White gains space and locks the center. Instead of the usual 3...Bf5, we choose the most direct answer: 3...c5!',
            'Black spends a second move on the c-pawn, but attacks the base of White’s chain right away. Compared with the French Advance (1.e4 e6 2.d4 d5 3.e5 c5), the light-squared bishop is not shut in behind a pawn on e6: it can still come out to g4 or f5.',
          ],
          fr: [
            'Après 3.e5, les Blancs gagnent de l’espace et ferment le centre. Plutôt que le classique 3...Ff5, on choisit la réponse la plus directe : 3...c5 !',
            'Les Noirs jouent deux fois le pion c, mais attaquent tout de suite la base de la chaîne blanche. Par rapport à la française avance (1.e4 e6 2.d4 d5 3.e5 c5), le fou de cases blanches n’est pas enfermé derrière un pion e6 : il peut encore sortir en g4 ou en f5.',
          ],
        },
        start: MAIN,
        moves: ['e4e5', 'c6c5'],
        shapes: [
          { from: 'c5', to: 'd4', color: 'green' },
          { circle: 'e5', color: 'blue' },
        ],
      },
      {
        title: {
          en: '4.c3: a French with a good bishop',
          fr: '4.c3 : une française avec un bon fou',
        },
        text: {
          en: [
            'White supports d4 with c3, as in the French Advance. Black develops with ...Nc6 and, before ...e6, plays ...Bg4: the bishop pins the knight that defends d4.',
            'The plan is to pile up on d4 with ...Qb6, ...Nge7-f5 and, at the right moment, ...cxd4. If Black takes on f3, d4 loses one of its defenders.',
          ],
          fr: [
            'Les Blancs soutiennent d4 par c3, comme dans la française avance. Les Noirs développent ...Cc6 et, avant ...e6, jouent ...Fg4 : le fou cloue le cavalier qui défend d4.',
            'Le plan : accumuler les attaques sur d4 avec ...Db6, ...Cge7-f5 et, au bon moment, ...cxd4. Si les Noirs prennent en f3, d4 perd l’un de ses défenseurs.',
          ],
        },
        start: ADVANCE,
        moves: [
          'c2c3',
          'b8c6',
          'g1f3',
          'c8g4',
          'f1e2',
          'e7e6',
          'e1g1',
          'g8e7',
        ],
        shapes: [
          { from: 'e7', to: 'f5', color: 'blue' },
          { from: 'd8', to: 'b6', color: 'yellow' },
          { circle: 'd4', color: 'red' },
        ],
      },
      {
        title: {
          en: '4.dxc5: winning the pawn back',
          fr: '4.dxc5 : récupérer le pion',
        },
        text: {
          en: [
            'White takes on c5 and hopes to keep the pawn or to use the d4 square. Black is in no hurry: ...Nc6, ...Bg4 and ...e6 develop the pieces, then the bishop from f8 takes back on c5.',
            'Without the support of d4, the e5 pawn becomes a target for ...Nc6, ...Qc7 and a knight coming from e7. Black has an easy game.',
          ],
          fr: [
            'Les Blancs prennent en c5 et espèrent garder le pion ou profiter de la case d4. Les Noirs ne sont pas pressés : ...Cc6, ...Fg4 et ...e6 développent les pièces, puis le fou f8 reprend en c5.',
            'Sans le soutien de d4, le pion e5 devient une cible pour ...Cc6, ...Dc7 et un cavalier venu de e7. Les Noirs ont une partie facile.',
          ],
        },
        start: ADVANCE,
        moves: [
          'd4c5',
          'b8c6',
          'g1f3',
          'c8g4',
          'f1b5',
          'e7e6',
          'h2h3',
          'g4f3',
          'd1f3',
          'f8c5',
        ],
        shapes: [
          { circle: 'c5', color: 'green' },
          { from: 'c6', to: 'e5', color: 'blue' },
        ],
      },
      {
        title: { en: 'Remember', fr: 'À retenir' },
        text: {
          en: [
            '1. Strike d4 at once with ...c5.',
            '2. Develop the light-squared bishop (g4 or f5) before playing ...e6.',
            '3. Put pressure on d4 (if White keeps it) or on e5 (if White gives it up) with ...Nc6, ...Qb6 and the knight from e7.',
          ],
          fr: [
            '1. Frapper d4 tout de suite par ...c5.',
            '2. Sortir le fou de cases blanches (g4 ou f5) avant de jouer ...e6.',
            '3. Mettre la pression sur d4 (si les Blancs le gardent) ou sur e5 (s’ils l’abandonnent) avec ...Cc6, ...Db6 et le cavalier venu de e7.',
          ],
        },
        start: ADVANCE,
        shapes: [
          { from: 'c5', to: 'd4', color: 'green' },
          { from: 'c8', to: 'g4', color: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'caro-kann-exchange',
    section: 'opening',
    course: 'caro-kann',
    title: { en: 'Exchange Variation', fr: 'Variante d’échange' },
    summary: {
      en: '1.e4 c6 2.d4 d5 3.exd5 cxd5: symmetrical pawns, clear plans, and the Panov.',
      fr: '1.e4 c6 2.d4 d5 3.exd5 cxd5 : des pions symétriques, des plans clairs, et la Panov.',
    },
    steps: [
      {
        title: { en: 'The structure', fr: 'La structure' },
        text: {
          en: [
            'After 3.exd5 cxd5 the pawns are almost symmetrical: Black has the half-open c-file, White the half-open e-file. It looks quiet, but both sides have clear plans.',
            'Black’s knights go to c6 and f6, and the light-squared bishop comes out (to g4 or f5) before ...e6.',
          ],
          fr: [
            'Après 3.exd5 cxd5, les pions sont presque symétriques : les Noirs ont la colonne c semi-ouverte, les Blancs la colonne e. La position semble calme, mais chaque camp a des plans clairs.',
            'Les cavaliers noirs vont en c6 et f6, et le fou de cases blanches sort (en g4 ou f5) avant ...e6.',
          ],
        },
        start: MAIN,
        moves: ['e4d5', 'c6d5'],
        shapes: [
          { circle: 'd5', color: 'green' },
          { from: 'c7', to: 'c2', color: 'blue' },
        ],
      },
      {
        title: { en: 'The main setup: 4.Bd3', fr: 'Le plan principal : 4.Fd3' },
        text: {
          en: [
            'With Bd3, c3 and Bf4, White plays a Queen’s Gambit Exchange with reversed colors and an extra move. 7.Qb3 attacks b7 and d5.',
            'Black has already developed the bishop with 6...Bg4; after 7.Qb3, 7...Qd7 calmly defends b7. Then come ...e6, ...Bd6 and castling. The long-term plan is the minority attack: ...b5-b4 to create a weakness on c3.',
          ],
          fr: [
            'Avec Fd3, c3 et Ff4, les Blancs jouent un Gambit Dame variante d’échange avec les couleurs inversées et un temps de plus. 7.Db3 attaque b7 et d5.',
            'Les Noirs ont déjà sorti le fou par 6...Fg4 ; après 7.Db3, 7...Dd7 défend calmement b7. Suivent ...e6, ...Fd6 et le roque. Le plan à long terme est l’attaque de minorité : ...b5-b4 pour créer une faiblesse en c3.',
          ],
        },
        start: EXCHANGE,
        moves: [
          'f1d3',
          'b8c6',
          'c2c3',
          'g8f6',
          'c1f4',
          'c8g4',
          'd1b3',
          'd8d7',
        ],
        shapes: [
          { from: 'b3', to: 'b7', color: 'red' },
          { from: 'd7', to: 'b7', color: 'green' },
          { from: 'b7', to: 'b4', color: 'blue' },
        ],
      },
      {
        title: { en: 'The Panov Attack: 4.c4', fr: 'L’attaque Panov : 4.c4' },
        text: {
          en: [
            '4.c4 changes the character of the game: White accepts an isolated queen’s pawn in exchange for active pieces. Black blockades with ...Nf6, ...e6 and ...Be7, ready to take on c4 and to put a knight on d5.',
            'This structure has its own lesson in the Pawn structures section: The isolated queen’s pawn (IQP).',
          ],
          fr: [
            '4.c4 change la nature de la partie : les Blancs acceptent un pion dame isolé en échange de pièces actives. Les Noirs bloquent avec ...Cf6, ...e6 et ...Fe7, prêts à prendre en c4 et à installer un cavalier en d5.',
            'Cette structure a sa propre leçon dans la section Structures de pions : Le pion dame isolé (PDI).',
          ],
        },
        start: EXCHANGE,
        moves: ['c2c4', 'g8f6', 'b1c3', 'e7e6', 'g1f3', 'f8e7'],
        shapes: [
          { circle: 'd5', color: 'green' },
          { circle: 'd4', color: 'red' },
        ],
      },
    ],
  },
  {
    id: 'caro-kann-classical',
    section: 'opening',
    course: 'caro-kann',
    title: {
      en: 'Classical Variation: 4...Nf6 5.Nxf6+ exf6',
      fr: 'Variante classique : 4...Cf6 5.Cxf6+ exf6',
    },
    summary: {
      en: 'The Tartakower: doubled f-pawns, but fast development and an open e-file.',
      fr: 'La Tartakover : des pions f doublés, mais un développement rapide et la colonne e ouverte.',
    },
    steps: [
      {
        title: {
          en: '3.Nc3 dxe4 4.Nxe4 Nf6',
          fr: '3.Cc3 dxe4 4.Cxe4 Cf6',
        },
        text: {
          en: [
            'After 4...Nf6 Black challenges the knight on e4. If White exchanges with 5.Nxf6+, we take back with 5...exf6: the Tartakower variation.',
            'Black accepts doubled f-pawns: White has a healthy queenside majority (four pawns against three), while Black’s extra kingside pawn cannot easily become a passed pawn. In exchange, Black’s pieces come out very fast and the e-file is open for a rook.',
          ],
          fr: [
            'Après 4...Cf6, les Noirs contestent le cavalier e4. Si les Blancs échangent par 5.Cxf6+, on reprend 5...exf6 : la variante Tartakover.',
            'Les Noirs acceptent des pions f doublés : les Blancs ont une majorité saine à l’aile dame (quatre pions contre trois), alors que le pion de plus des Noirs à l’aile roi ne deviendra pas facilement un pion passé. En échange, les pièces noires sortent très vite et la colonne e est ouverte pour une tour.',
          ],
        },
        start: MAIN,
        moves: ['b1c3', 'd5e4', 'c3e4', 'g8f6', 'e4f6', 'e7f6'],
        shapes: [
          { circle: 'f6', color: 'yellow' },
          { circle: 'f7', color: 'yellow' },
          { from: 'f8', to: 'd6', color: 'green' },
        ],
      },
      {
        title: { en: 'Fast development', fr: 'Un développement rapide' },
        text: {
          en: [
            'Black’s pieces come out naturally: ...Bd6, short castling and ...Re8 on the open e-file. With check, 8...Re8+ forces the knight to e2, where it is less active.',
            'Watch out for the Bd3 + Qc2 battery against h7: 9...g6 closes the diagonal. Then ...Nd7-f8, ...Be6 and ...Qc7 complete the development.',
          ],
          fr: [
            'Les pièces noires sortent naturellement : ...Fd6, petit roque et ...Te8 sur la colonne e ouverte. Avec échec, 8...Te8+ oblige le cavalier à aller en e2, où il est moins actif.',
            'Attention à la batterie Fd3 + Dc2 contre h7 : 9...g6 ferme la diagonale. Ensuite ...Cd7-f8, ...Fe6 et ...Dc7 terminent le développement.',
          ],
        },
        start: TARTAKOWER,
        moves: [
          'c2c3',
          'f8d6',
          'f1d3',
          'e8g8',
          'd1c2',
          'f8e8',
          'g1e2',
          'g7g6',
        ],
        shapes: [
          { from: 'c2', to: 'h7', color: 'red' },
          { circle: 'g6', color: 'green' },
          { from: 'e8', to: 'e2', color: 'blue' },
        ],
      },
      {
        title: { en: 'The plan', fr: 'Le plan' },
        text: {
          en: [
            'Black plays with the pieces, not for the endgame: in a simplified ending, White’s healthy queenside majority would make the difference. Keep the pieces, use the e-file and the d6 bishop aimed at the kingside.',
            'The ...f5 advance can free the doubled pawn, control e4 and open the way for the queen and the rook on the kingside.',
          ],
          fr: [
            'Les Noirs jouent avec les pièces, pas pour la finale : dans une finale simplifiée, la majorité saine des Blancs à l’aile dame ferait la différence. On garde les pièces, on utilise la colonne e et le fou d6 tourné vers l’aile roi.',
            'L’avance ...f5 peut libérer le pion doublé, contrôler e4 et ouvrir la route à la dame et à la tour vers l’aile roi.',
          ],
        },
        start: TARTAKOWER_SETUP,
        shapes: [
          { from: 'f6', to: 'f5', color: 'green' },
          { circle: 'e4', color: 'green' },
          { from: 'd6', to: 'h2', color: 'blue' },
        ],
      },
    ],
  },

  // ----- sidelines -----
  {
    id: 'caro-kann-fantasy',
    section: 'opening',
    course: 'caro-kann',
    title: { en: 'Fantasy Variation: 3...e5', fr: 'Variante Fantasy : 3...e5' },
    summary: {
      en: '1.e4 c6 2.d4 d5 3.f3 e5: hit back in the center against the weakened dark squares.',
      fr: '1.e4 c6 2.d4 d5 3.f3 e5 : riposter au centre contre les cases noires affaiblies.',
    },
    steps: [
      {
        title: { en: '3.f3: the Fantasy', fr: '3.f3 : la Fantasy' },
        text: {
          en: [
            '3.f3 keeps the e4 pawn defended: if Black takes on e4, White recaptures with the f-pawn and builds a big center.',
            'The price: the g1-a7 diagonal and the e3 square are weakened, and the knight on g1 loses its natural f3 square.',
          ],
          fr: [
            '3.f3 garde le pion e4 défendu : si les Noirs prennent en e4, les Blancs reprennent avec le pion f et construisent un grand centre.',
            'Le prix à payer : la diagonale g1-a7 et la case e3 sont affaiblies, et le cavalier g1 perd sa case naturelle f3.',
          ],
        },
        start: MAIN,
        moves: ['f2f3'],
        shapes: [
          { from: 'f3', to: 'e4', color: 'blue' },
          { from: 'a7', to: 'g1', color: 'red' },
        ],
      },
      {
        title: { en: '3...e5!', fr: '3...e5 !' },
        text: {
          en: [
            'We strike in the center at once. If White takes with 4.dxe5, Black gives a pawn and the bishop comes to c5, on the diagonal that f3 has weakened: White will not castle easily.',
            'Black develops quickly and the white king stays in the center. The pawn can often be won back later.',
          ],
          fr: [
            'On frappe tout de suite au centre. Si les Blancs prennent par 4.dxe5, les Noirs donnent un pion et le fou vient en c5, sur la diagonale affaiblie par f3 : les Blancs ne roqueront pas facilement.',
            'Les Noirs se développent vite et le roi blanc reste au centre. Le pion pourra souvent être récupéré plus tard.',
          ],
        },
        start: `${MAIN} f2f3`,
        moves: ['e7e5', 'd4e5', 'f8c5'],
        shapes: [
          { from: 'c5', to: 'g1', color: 'red' },
          { circle: 'e1', color: 'red' },
        ],
      },
      {
        title: { en: '5.exd5 Qb6!', fr: '5.exd5 Db6 !' },
        text: {
          en: [
            'If White grabs a second pawn with 5.exd5, the queen joins the bishop with 5...Qb6!: ...Bf2+ is in the air and b2 is attacked.',
            'White must defend precisely, while Black brings the remaining pieces into play with ...Ne7 and ...Nd7. Black’s initiative is the compensation for the pawns.',
          ],
          fr: [
            'Si les Blancs prennent un deuxième pion par 5.exd5, la dame rejoint le fou avec 5...Db6 ! : ...Ff2+ est dans l’air et b2 est attaqué.',
            'Les Blancs doivent se défendre avec précision, pendant que les Noirs mettent en jeu le reste des pièces avec ...Ce7 et ...Cd7. L’initiative noire est la compensation des pions.',
          ],
        },
        start: `${MAIN} f2f3 e7e5 d4e5 f8c5`,
        moves: ['e4d5', 'd8b6'],
        shapes: [
          { from: 'c5', to: 'f2', color: 'red' },
          { from: 'b6', to: 'b2', color: 'red' },
        ],
      },
    ],
  },
  {
    id: 'caro-kann-two-knights',
    section: 'opening',
    course: 'caro-kann',
    title: { en: 'Two Knights Variation', fr: 'Défense des deux cavaliers' },
    summary: {
      en: '1.e4 c6 2.Nc3 d5 3.Nf3 Bg4: give the bishop pair for a rock-solid center.',
      fr: '1.e4 c6 2.Cc3 d5 3.Cf3 Fg4 : céder la paire de fous contre un centre très solide.',
    },
    steps: [
      {
        title: { en: '2.Nc3 d5 3.Nf3', fr: '2.Cc3 d5 3.Cf3' },
        text: {
          en: [
            'Instead of 2.d4, White develops both knights and keeps the d-pawn flexible: it may go to d3 or d4 later.',
            'Black must now decide how to deal with the e4 pawn, and how to develop the light-squared bishop.',
          ],
          fr: [
            'Au lieu de 2.d4, les Blancs développent les deux cavaliers et gardent le pion d souple : il pourra aller en d3 ou en d4 plus tard.',
            'Les Noirs doivent maintenant décider comment traiter le pion e4, et comment sortir le fou de cases blanches.',
          ],
        },
        start: START,
        moves: ['b1c3', 'd7d5', 'g1f3'],
        shapes: [
          { from: 'e4', to: 'd5', color: 'blue' },
          { from: 'f3', to: 'e5', color: 'blue' },
        ],
      },
      {
        title: { en: '3...Bg4', fr: '3...Fg4' },
        text: {
          en: [
            '3...Bg4 pins the knight that would support e5 and d4. After 4.h3, Black simply gives the bishop pair: 4...Bxf3 5.Qxf3 e6.',
            'The pawns on c6, d5 and e6 form a very solid wall, and the bishop that was exchanged is the one that would have been passive behind them.',
          ],
          fr: [
            '3...Fg4 cloue le cavalier qui soutiendrait e5 et d4. Après 4.h3, les Noirs cèdent simplement la paire de fous : 4...Fxf3 5.Dxf3 e6.',
            'Les pions c6, d5 et e6 forment un mur très solide, et le fou échangé est justement celui qui aurait été passif derrière eux.',
          ],
        },
        start: TWO_KNIGHTS,
        moves: ['c8g4', 'h2h3', 'g4f3', 'd1f3', 'e7e6'],
        shapes: [
          { circle: 'c6', color: 'green' },
          { circle: 'd5', color: 'green' },
          { circle: 'e6', color: 'green' },
        ],
      },
      {
        title: { en: 'A typical continuation', fr: 'Une suite typique' },
        text: {
          en: [
            'With 6.d4 White builds a center; Black exchanges on e4 to free the position. After 9...Nd7, Black continues with ...Nf6, ...Be7 or ...Bd6 and castles.',
            'White has the two bishops, but no weakness to attack: Black’s position is solid and easy to play.',
          ],
          fr: [
            'Avec 6.d4, les Blancs construisent un centre ; les Noirs échangent en e4 pour libérer la position. Après 9...Cd7, ils poursuivent avec ...Cf6, ...Fe7 ou ...Fd6 et roquent.',
            'Les Blancs ont la paire de fous, mais aucune faiblesse à attaquer : la position noire est solide et facile à jouer.',
          ],
        },
        start: `${TWO_KNIGHTS} c8g4 h2h3 g4f3 d1f3 e7e6`,
        moves: [
          'd2d4',
          'g8f6',
          'f1d3',
          'd5e4',
          'c3e4',
          'f6e4',
          'f3e4',
          'b8d7',
        ],
        shapes: [
          { from: 'd7', to: 'f6', color: 'blue' },
          { from: 'f8', to: 'd6', color: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'caro-kann-sidelines',
    section: 'opening',
    course: 'caro-kann',
    title: { en: 'Other sidelines', fr: 'Autres sidelines' },
    summary: {
      en: '2.c4, 2.d3, 2.Nf3, 2.Nc3 d5 3.Qf3 and the Hillbilly 2.Bc4.',
      fr: '2.c4, 2.d3, 2.Cf3, 2.Cc3 d5 3.Df3 et le Hillbilly 2.Fc4.',
    },
    steps: [
      {
        title: {
          en: '2.c4: the Accelerated Panov',
          fr: '2.c4 : la Panov accélérée',
        },
        text: {
          en: [
            '2.c4 fights for d5 before playing d4. Black answers 2...d5 anyway; after the exchanges, 4...Nf6 wins the d5 pawn back.',
            'If White later plays d4, we reach the Panov structure with an isolated pawn; otherwise Black gets a free and pleasant position.',
          ],
          fr: [
            '2.c4 lutte pour d5 avant de jouer d4. Les Noirs répondent quand même 2...d5 ; après les échanges, 4...Cf6 récupère le pion d5.',
            'Si les Blancs jouent d4 plus tard, on retrouve la structure Panov avec un pion isolé ; sinon les Noirs obtiennent une position libre et agréable.',
          ],
        },
        start: START,
        moves: ['c2c4', 'd7d5', 'e4d5', 'c6d5', 'c4d5', 'g8f6'],
        shapes: [{ from: 'f6', to: 'd5', color: 'green' }],
      },
      {
        title: {
          en: '2.d3: the King’s Indian Attack',
          fr: '2.d3 : l’attaque est-indienne',
        },
        text: {
          en: [
            'White chooses a slow, closed setup: d3, Nd2, Ngf3, g3, Bg2 and castling. Black takes the whole center with ...d5 and ...e5.',
            'Develop with ...Bd6, ...Nf6 and short castling; later ...Re8, ...Nbd7 and ...a5 to gain space on the queenside.',
          ],
          fr: [
            'Les Blancs choisissent un schéma lent et fermé : d3, Cd2, Cgf3, g3, Fg2 et le roque. Les Noirs prennent tout le centre avec ...d5 et ...e5.',
            'On se développe avec ...Fd6, ...Cf6 et le petit roque ; plus tard ...Te8, ...Cbd7 et ...a5 pour gagner de l’espace à l’aile dame.',
          ],
        },
        start: START,
        moves: [
          'd2d3',
          'd7d5',
          'b1d2',
          'e7e5',
          'g1f3',
          'f8d6',
          'g2g3',
          'g8f6',
          'f1g2',
          'e8g8',
          'e1g1',
        ],
        shapes: [
          { circle: 'd5', color: 'green' },
          { circle: 'e5', color: 'green' },
          { from: 'a7', to: 'a5', color: 'blue' },
        ],
      },
      {
        title: { en: '2.Nf3 d5 3.e5', fr: '2.Cf3 d5 3.e5' },
        text: {
          en: [
            'After 2.Nf3 d5, 3.Nc3 leads to the Two Knights Variation. With 3.e5, White plays an Advance Variation with the knight already on f3.',
            'The bishop comes out at once with 3...Bg4, before ...e6; then ...c5 attacks the chain as in our Advance Variation.',
          ],
          fr: [
            'Après 2.Cf3 d5, 3.Cc3 mène à la défense des deux cavaliers. Avec 3.e5, les Blancs jouent une variante d’avance avec le cavalier déjà en f3.',
            'Le fou sort tout de suite par 3...Fg4, avant ...e6 ; ensuite ...c5 attaque la chaîne comme dans notre variante d’avance.',
          ],
        },
        start: START,
        moves: ['g1f3', 'd7d5', 'e4e5', 'c8g4'],
        shapes: [
          { from: 'g4', to: 'f3', color: 'green' },
          { from: 'c6', to: 'c5', color: 'blue' },
        ],
      },
      {
        title: {
          en: '2.Nc3 d5 3.Qf3: the Goldman',
          fr: '2.Cc3 d5 3.Df3 : la Goldman',
        },
        text: {
          en: [
            '3.Qf3 defends e4 and eyes f7, but the queen comes out too early. Take with 3...dxe4 4.Nxe4 and continue with ...Nd7 and ...Ngf6.',
            'The knight on f6 will hit the queen or exchange the e4 knight: Black develops with tempo.',
          ],
          fr: [
            '3.Df3 défend e4 et vise f7, mais la dame sort trop tôt. On prend 3...dxe4 4.Cxe4 et on continue avec ...Cd7 et ...Cgf6.',
            'Le cavalier f6 attaquera la dame ou échangera le cavalier e4 : les Noirs se développent avec gain de temps.',
          ],
        },
        start: START,
        moves: ['b1c3', 'd7d5', 'd1f3', 'd5e4', 'c3e4', 'b8d7'],
        shapes: [
          { from: 'g8', to: 'f6', color: 'blue' },
          { circle: 'f3', color: 'red' },
        ],
      },
      {
        title: {
          en: '2.Bc4: the Hillbilly Attack',
          fr: '2.Fc4 : l’attaque Hillbilly',
        },
        text: {
          en: [
            '2.Bc4 invites 2...d5, which hits the bishop. After 3.exd5 cxd5, the check 4.Bb5+ is met by 4...Bd7, and the exchanges leave Black with a fine central pawn on d5 and easy development.',
          ],
          fr: [
            '2.Fc4 invite 2...d5, qui attaque le fou. Après 3.exd5 cxd5, l’échec 4.Fb5+ est paré par 4...Fd7, et les échanges laissent aux Noirs un beau pion central en d5 et un développement facile.',
          ],
        },
        start: START,
        moves: [
          'f1c4',
          'd7d5',
          'e4d5',
          'c6d5',
          'c4b5',
          'c8d7',
          'b5d7',
          'b8d7',
        ],
        shapes: [{ circle: 'd5', color: 'green' }],
      },
      {
        title: {
          en: 'The Hillbilly gambit: 3.Bb3',
          fr: 'Le gambit Hillbilly : 3.Fb3',
        },
        text: {
          en: [
            'The real idea of the Hillbilly is 3.Bb3: after 3...dxe4, 4.Qh5 attacks f7 with the queen and the bishop.',
            'Stay calm: 4...e6 closes the b3-f7 diagonal. Black keeps the extra pawn, and the white queen will be chased with ...Nf6 or ...g6.',
          ],
          fr: [
            'La vraie idée du Hillbilly est 3.Fb3 : après 3...dxe4, 4.Dh5 attaque f7 avec la dame et le fou.',
            'Pas de panique : 4...e6 ferme la diagonale b3-f7. Les Noirs gardent le pion de plus, et la dame blanche sera chassée par ...Cf6 ou ...g6.',
          ],
        },
        start: START,
        moves: ['f1c4', 'd7d5', 'c4b3', 'd5e4', 'd1h5', 'e7e6'],
        shapes: [
          { from: 'b3', to: 'f7', color: 'red' },
          { from: 'h5', to: 'f7', color: 'red' },
          { circle: 'e6', color: 'green' },
        ],
      },
    ],
  },
];
