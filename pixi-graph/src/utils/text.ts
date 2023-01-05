import { BitmapText } from '@pixi/text-bitmap';


// TODO: use TextStyle from @pixi/text directly?
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
}

export function textToPixi(content: string, style: TextStyle) {
  let text;

  text = new BitmapText(content, {
    fontName: style.fontFamily,
    fontSize: style.fontSize
  });

  text.roundPixels = true;
  return text;
}