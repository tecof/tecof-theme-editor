import { Render, type Config } from '@puckeditor/core';
import type { TecofRenderProps } from '../types';

/**
 * TecofRender — Puck page renderer.
 *
 * Pass `data` (PuckPageData) and `config` (Puck Config) directly.
 * Optionally pass `cmsData` to make CMS item data available to all
 * Puck components via `puck.metadata.cmsData`.
 *
 * No API fetch, no provider required.
 */
export const TecofRender = ({ data, config, className, cmsData }: TecofRenderProps) => {
  if (!data) return null;

  return (
    <div className={className}>
      <Render
        config={config as Config}
        data={data}
        metadata={{ cmsData: cmsData || null }}
      />
    </div>
  );
};

export default TecofRender;
