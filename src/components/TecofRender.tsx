import { Render, type Config } from '@puckeditor/core';
import type { TecofRenderProps } from '../types';

/**
 * TecofRender — Puck page renderer.
 *
 * Pass `data` (PuckPageData) and `config` (Puck Config) directly.
 * No API fetch, no provider required.
 */
export const TecofRender = ({ data, config, className }: TecofRenderProps) => {
  if (!data) return null;

  return (
    <div className={className}>
      <Render config={config as Config} data={data} />
    </div>
  );
};

export default TecofRender;
