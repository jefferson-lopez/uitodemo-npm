import arrowBlack from "../assets/cursors/apple-black/left_ptr.svg";
import pointerBlack from "../assets/cursors/apple-black/hand2.svg";
import grabBlack from "../assets/cursors/apple-black/hand1.svg";
import moveBlack from "../assets/cursors/apple-black/move.svg";
import crosshairBlack from "../assets/cursors/apple-black/crosshair.svg";
import waitBlack from "../assets/cursors/apple-black/wait-01.svg";
import textBlack from "../assets/cursors/apple-black/xterm.svg";

import arrowWhite from "../assets/cursors/apple-white/left_ptr.svg";
import pointerWhite from "../assets/cursors/apple-white/hand2.svg";
import grabWhite from "../assets/cursors/apple-white/hand1.svg";
import moveWhite from "../assets/cursors/apple-white/move.svg";
import crosshairWhite from "../assets/cursors/apple-white/crosshair.svg";
import waitWhite from "../assets/cursors/apple-white/wait-01.svg";
import textWhite from "../assets/cursors/apple-white/xterm.svg";

type CursorTheme = "black" | "white";
type CursorMap = Record<CursorTheme, Record<string, string>>;

export const cursorAssets: CursorMap = {
  black: {
    arrow: arrowBlack,
    pointer: pointerBlack,
    grab: grabBlack,
    move: moveBlack,
    crosshair: crosshairBlack,
    wait: waitBlack,
    text: textBlack,
  },
  white: {
    arrow: arrowWhite,
    pointer: pointerWhite,
    grab: grabWhite,
    move: moveWhite,
    crosshair: crosshairWhite,
    wait: waitWhite,
    text: textWhite,
  },
};
