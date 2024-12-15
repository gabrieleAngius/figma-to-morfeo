import { PluginMessage } from './actions';

export type Controller = (msg: PluginMessage) => void;
