import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';

import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';

import * as Preact from '#preact';
import {useRef, useState} from '#preact';

import {BentoYoutube} from '../component';

export default {
  title: 'YouTube',
  component: BentoYoutube,
  decorators: [withKnobs],
};

const VIDEOID = 'IAvf-rkzNck';
const LIVE_CHANNEL_ID = 'sKCkM-f2Qk4';

export const _default = () => {
  const width = number('width', 300);
  const height = number('height', 200);
  const videoid = text('videoid', VIDEOID);
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  const credentials = text('credentials', 'include');
  return (
    <BentoYoutube
      autoplay={autoplay}
      loop={loop}
      videoid={videoid}
      params={params}
      style={{width, height}}
      credentials={credentials}
    />
  );
};

/**
 * @param {*} props
 * @return {*}
 */
function WithStateTable({autoplay, credentials, loop, params, style, videoid}) {
  const ref = useRef(null);

  const [stateTable, setStateTable] = useState(null);
  const setCurrentStateTable = () => {
    setStateTable(
      <table>
        {['autoplay', 'controls', 'loop', 'currentTime', 'duration'].map(
          (key) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{ref.current[key]}</td>
            </tr>
          )
        )}
      </table>
    );
  };

  return (
    <>
      <BentoYoutube
        ref={ref}
        autoplay={autoplay}
        loop={loop}
        videoid={videoid}
        params={params}
        style={style}
        credentials={credentials}
      />
      <p>
        <button onClick={setCurrentStateTable}>🔄 current state</button>
      </p>
      {stateTable}
    </>
  );
}

/**
 * @return {*}
 */
export function State() {
  const width = number('width', 300);
  const height = number('height', 200);
  const videoid = text('videoid', VIDEOID);
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  const credentials = text('credentials', 'include');
  return (
    <WithStateTable
      autoplay={autoplay}
      loop={loop}
      videoid={videoid}
      params={params}
      style={{width, height}}
      credentials={credentials}
    />
  );
}

export const liveChannelId = () => {
  const width = number('width', 300);
  const height = number('height', 200);
  const liveChannelid = text('liveChannelid', LIVE_CHANNEL_ID);
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  const credentials = text('credentials', 'include');
  return (
    <BentoYoutube
      autoplay={autoplay}
      loop={loop}
      liveChannelid={liveChannelid}
      params={params}
      style={{width, height}}
      credentials={credentials}
    />
  );
};

export const InsideAccordion = () => {
  const width = text('width', '320px');
  const height = text('height', '180px');
  const videoid = text('videoid', VIDEOID);
  const params = object('params', {});
  return (
    <BentoAccordion expandSingleSection>
      <BentoAccordionSection key={1} expanded>
        <BentoAccordionHeader>
          <h2>Controls</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoYoutube
            loop={true}
            videoid={videoid}
            params={params}
            style={{width, height}}
          />
        </BentoAccordionContent>
      </BentoAccordionSection>
      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h2>Autoplay</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoYoutube
            autoplay={true}
            loop={true}
            videoid={videoid}
            params={params}
            style={{width, height}}
          />
        </BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
};
