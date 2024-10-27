import { atom } from 'jotai';

export const UserAtom = atom({ name: 'Paras Kamaliya', role: 'INSTITUTE' });
export const AuthAtom = atom({ isAuth: false, token: '' });