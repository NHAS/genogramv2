import { Container } from '@pixi/display';
import { Circle, Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import '@pixi/mixin-get-child-by-name';
//import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { TextureCache } from '../texture-cache';
import { Texture } from '@pixi/core';

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

  let nodeCircleTexture: Texture;
  switch (nodeStyle.gender) {
    case "female":
      nodeCircleTexture = textureCache.get(nodeTextureKey, () => {
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
      nodeCircleTexture = textureCache.get(nodeTextureKey, () => {
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
      nodeCircleTexture = textureCache.get(nodeTextureKey, () => {
        const graphics = new Graphics();

        graphics.lineStyle(nodeStyle.border.width, 0x00000)
        graphics.beginFill(WHITE, 1.0, true);
        graphics.drawCircle(nodeStyle.size, nodeStyle.size, nodeStyle.size);
        graphics.endFill()
        return graphics;
      });
      (nodeGfx.hitArea as Circle).radius = nodeOuterSize;
  }



  // nodeGfx -> nodeCircle
  const nodeSpirte = nodeGfx.getChildByName!(NODE_NAME) as Sprite;
  nodeSpirte.texture = nodeCircleTexture;
  //[nodeCircle.tint, nodeCircle.alpha] = colorToPixi(nodeStyle.color);
}
