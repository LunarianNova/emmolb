import { Event } from "./Event";

export type EventBlockGroup = {
  emoji?: string;
  title?: string;
  color?: string;
  titleColor?: string;
  messages: Event[];
  onClick?: () => void;
};