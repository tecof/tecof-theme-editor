import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { Frame } from './Frame';
import { NodeRenderer } from './NodeRenderer';
import { useDropTarget } from './useDropTarget';

export const Canvas = () => {
  const content = useEditorStore((state) => state.document.content);
  const viewport = useEditorStore((state) => state.viewport);
  const { config, readOnly } = useStudio();
  const rootProps = useEditorStore((state) => state.document.root?.props) || {};

  const {
    isDragOver: isRootDragOver,
    onDragOver: handleRootDragOver,
    onDragLeave: handleRootDragLeave,
    onDrop: handleRootDrop,
  } = useDropTarget({
    // Root content has no zone key.
    zoneKey: undefined,
    locked: readOnly,
    getIndex: () => content.length,
  });

  const rootClassName = [
    'tecof-canvas-root',
    content.length === 0 ? 'is-empty' : '',
    isRootDragOver ? 'is-dragover' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const viewportClassName = [
    'tecof-canvas-viewport',
    viewport !== 'desktop' ? `is-${viewport}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderedContent = (
    <div
      className={rootClassName}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
      data-tecof-zone="root"
    >
      {content.length === 0 ? (
        <div className="tecof-canvas-empty">
          <span className="tecof-canvas-empty-kicker">Root</span>
          <p className="tecof-canvas-empty-title">
            {isRootDragOver ? 'Bırakmaya hazır' : 'Canvas boş'}
          </p>
          <p className="tecof-canvas-empty-sub">
            {isRootDragOver ? 'Bileşen ana akışa eklenecek' : 'İlk bloğu buraya bırakın'}
          </p>
        </div>
      ) : (
        <>
          {content.map((item, index) => (
            <NodeRenderer key={item.props.id} node={item} index={index} />
          ))}
          {!readOnly && <div className="tecof-canvas-root-tail" aria-hidden="true" />}
        </>
      )}
    </div>
  );

  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render
    ? rootConfig.render({
      ...rootProps,
      children: renderedContent,
      editMode: true,
    })
    : renderedContent;

  return (
    <div className="tecof-canvas-container">
      <div className={viewportClassName}>
        <Frame className="tecof-canvas-frame">
          {contentWithLayout}
        </Frame>
      </div>
    </div>
  );
};
export default Canvas;
