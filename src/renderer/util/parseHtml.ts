import { createElement, Fragment } from 'react';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Image, Slider, FollowMouse, Anchor, AlphaButton } from '@renderer/components';

const schema = Object.assign({}, defaultSchema);
schema.attributes!['*'].push('style', 'className');
schema.tagNames!.push('carousel-swiper', 'follow-mouse', 'alpha-button', 'ecc-alpha-button');
schema.attributes!['carousel-swiper'] = ['mask'];
schema.attributes!['alpha-button'] = ['src', 'class'];
schema.attributes!['follow-mouse'] = [
  'z-index',
  'speed-x',
  'speed-y',
  'offset-x',
  'offset-y',
  'base-x',
  'base-y',
  'max-move-top',
  'max-move-bottom',
  'max-move-left',
  'max-move-right',
];

schema.tagNames = schema.tagNames?.filter(t => t !== 'title');

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, schema)
  .use(rehypeReact, {
    createElement,
    Fragment,
    components: {
      img: Image,
      a: Anchor,
      'follow-mouse': FollowMouse,
      'carousel-swiper': Slider,
      'alpha-button': AlphaButton,
    } as any,
  });

export async function parseHtml(text: string) {
  const file = await processor.process(text);
  return file.result;
}