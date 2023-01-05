import { Container } from '@pixi/display';
import { Circle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { TextureCache } from '../texture-cache';

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

  const nodeCircleTextureKey = [NODE_NAME, nodeStyle.size].join(DELIMETER);
  const nodeCircleTexture = textureCache.get(nodeCircleTextureKey, () => {
    const graphics = new Graphics();

    graphics.lineStyle(nodeStyle.border.width, 0x00000)
    graphics.beginFill(WHITE, 1.0, true);
    graphics.drawCircle(nodeStyle.size, nodeStyle.size, nodeStyle.size);
    graphics.endFill()
    return graphics;
  });


  // nodeGfx
  (nodeGfx.hitArea as Circle).radius = nodeOuterSize;

  // nodeGfx -> nodeCircle
  const nodeCircle = nodeGfx.getChildByName!(NODE_NAME) as Sprite;
  nodeCircle.texture = nodeCircleTexture;
  [nodeCircle.tint, nodeCircle.alpha] = colorToPixi(nodeStyle.color);
}
