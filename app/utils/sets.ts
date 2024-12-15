import { TSong } from "~/routes/$bandId.setlists.$setlistId._index";

export const totalSetLength = (set: TSong[]) =>
  set.reduce((total, song) => total + song.length, 0);
