export interface DialogLine {
  speaker: string;
  text: string;
}

export const CAMP_ELDER_INTRO: DialogLine[] = [
  {
    speaker: 'Elder of Nahran',
    text: 'Malik, the dunes grow restless. Every gate you hold keeps our people alive one more night.',
  },
  {
    speaker: 'Elder of Nahran',
    text: 'Rest at camp, train your strength, and spend what the desert gives you — water, iron, leather.',
  },
  {
    speaker: 'Elder of Nahran',
    text: 'When the Black Eclipse breaks, the Shadow Emir will come for Nahran itself. Be ready.',
  },
];

export const POST_GAME_DIALOG: DialogLine[] = [
  {
    speaker: 'Malik',
    text: 'The Shadow Emir falls. The eclipse lifts. Nahran stands — but the desert never sleeps for long.',
  },
  {
    speaker: 'Elder of Nahran',
    text: 'You have become Guardian of the Dunes. A New Game+ awaits those who wish to test their legend again.',
  },
];
