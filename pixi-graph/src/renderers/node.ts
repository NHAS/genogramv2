import { Container } from '@pixi/display';
import { Circle, Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import '@pixi/mixin-get-child-by-name';
import { NodeStyle } from '../utils/style';
import { TextureCache } from '../texture-cache';
import { Texture } from '@pixi/core';
import { textToPixi } from '../utils/text';


const DELIMETER = '::';
const WHITE = 0xffffff;

const NODE_NAME = 'NODE';

export function createNode(nodeGfx: Container) {
  // nodeGfx
  nodeGfx.hitArea = new Circle(0, 0);

  // nodeGfx -> nodeCircle
  const nodeCircle = new Sprite();
  nodeCircle.name = NODE_NAME;
  nodeCircle.anchor.set(0.5);
  nodeGfx.addChild(nodeCircle);

}

export function updateNodeStyle(nodeGfx: Container, nodeStyle: NodeStyle, textureCache: TextureCache) {
  const nodeOuterSize = nodeStyle.size + nodeStyle.border.width;

  const nodeTextureKey = [NODE_NAME, nodeStyle.gender, nodeStyle.size].join(DELIMETER);

  const nodeSpirte = nodeGfx.getChildByName!(NODE_NAME) as Sprite;
  let nodeTexture: Texture;
  switch (nodeStyle.gender) {
    case "female":
      nodeTexture = textureCache.get(nodeTextureKey, () => {
        const graphics = new Graphics();

        graphics.lineStyle(nodeStyle.border.width, 0x00000)
        graphics.beginFill(WHITE, 1.0, true);
        graphics.drawCircle(nodeStyle.size, nodeStyle.size, nodeStyle.size);
        graphics.endFill()
        return graphics;
      });


      // nodeGfx
      (nodeGfx.hitArea as Circle).radius = nodeOuterSize;
    case "male":
      nodeTexture = textureCache.get(nodeTextureKey, () => {
        const graphics = new Graphics();

        graphics.lineStyle(nodeStyle.border.width, 0x00000)
        graphics.beginFill(WHITE, 1.0, true);
        graphics.drawRect(0, 0, nodeStyle.size + 10, nodeStyle.size + 10);
        graphics.endFill()
        return graphics;
      });


      // nodeGfx
      (nodeGfx.hitArea as Rectangle).x = 0;
      (nodeGfx.hitArea as Rectangle).y = 0;
      (nodeGfx.hitArea as Rectangle).width = nodeOuterSize;
      (nodeGfx.hitArea as Rectangle).height = nodeOuterSize;


    default:

      nodeTexture = textureCache.get(nodeTextureKey, () => {
        const text = textToPixi("?", {
          fontFamily: nodeStyle.label.fontFamily,
          fontSize: nodeStyle.size * 2
        });

        return text;
      });



      (nodeGfx.hitArea as Circle).radius = nodeOuterSize;
  }



  // nodeGfx -> nodeCircle

  nodeSpirte.texture = nodeTexture;
}
