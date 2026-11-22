import { Injectable } from '@angular/core';

const NAME_KEY = 'userName';
const AVATAR_KEY = 'userAvatar';

export const DEFAULT_USER_NAME = 'Chacalito53';
export const USER_NAME_MAX_LENGTH = 20;
export const DEFAULT_ELO = 1400;

/** Icon until the user imports an image of their own. */
export const DEFAULT_AVATAR = 'assets/pictures/default-profile-picture.jpg';

/** The user's profile, saved on this device. */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentName = load(NAME_KEY) || DEFAULT_USER_NAME;
  private currentAvatar = loadAvatar();

  get name(): string {
    return this.currentName;
  }

  /** Not computed from games yet. */
  get elo(): number {
    return DEFAULT_ELO;
  }

  /** The default icon's path, or a data: URL for an imported image. */
  get avatar(): string {
    return this.currentAvatar;
  }

  /** @returns false when the name is empty or too long once trimmed. */
  setName(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > USER_NAME_MAX_LENGTH) {
      return false;
    }
    this.currentName = trimmed;
    save(NAME_KEY, trimmed);
    return true;
  }

  setAvatar(avatar: string): void {
    this.currentAvatar = avatar;
    save(AVATAR_KEY, avatar);
  }
}

/** Only imported images are kept: a former preset falls back to the default. */
function loadAvatar(): string {
  const saved = load(AVATAR_KEY);
  return saved?.startsWith('data:image/') ? saved : DEFAULT_AVATAR;
}

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable or full: the value only lasts for this visit
  }
}
