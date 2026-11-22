import { DEFAULT_AVATAR, DEFAULT_USER_NAME, UserService } from './user.service';

describe('UserService', () => {
  const IMAGE = 'data:image/jpeg;base64,AAAA';

  const clear = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
  };
  beforeEach(clear);
  afterEach(clear);

  it('has a default name, the default icon and an Elo of 1400', () => {
    const user = new UserService();
    expect(user.name).toBe(DEFAULT_USER_NAME);
    expect(user.avatar).toBe(DEFAULT_AVATAR);
    expect(user.elo).toBe(1400);
  });

  it('trims the name and refuses an empty or too long one', () => {
    const user = new UserService();
    expect(user.setName('  Magnus  ')).toBeTrue();
    expect(user.name).toBe('Magnus');
    expect(user.setName('   ')).toBeFalse();
    expect(user.setName('x'.repeat(21))).toBeFalse();
    expect(user.name).toBe('Magnus');
  });

  it('keeps the name and imported icon for the next visit', () => {
    const user = new UserService();
    user.setName('Magnus');
    user.setAvatar(IMAGE);
    const next = new UserService();
    expect(next.name).toBe('Magnus');
    expect(next.avatar).toBe(IMAGE);
  });

  it('falls back to the default icon for a former preset', () => {
    localStorage.setItem(
      'userAvatar',
      'assets/pictures/chacalito-profile-pic.png'
    );
    expect(new UserService().avatar).toBe(DEFAULT_AVATAR);
  });
});
