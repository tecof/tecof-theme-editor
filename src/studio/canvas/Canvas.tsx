import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { Frame } from './Frame';
import { NodeRenderer } from './NodeRenderer';
import { createEventAutoScroller, createNode, readDragData } from './dndUtils';

export const Canvas = () => {
  const content = useEditorStore((state) => state.document.content);
  const viewport = useEditorStore((state) => state.viewport);
  const insertNode = useEditorStore((state) => state.insertNode);
  const endDrag = useEditorStore((state) => state.endDrag);
  const { config, readOnly } = useStudio();
  const rootProps = useEditorStore((state) => state.document.root?.props) || {};
  const [isRootDragOver, setIsRootDragOver] = useState(false);
  const autoScrollerRef = useRef(createEventAutoScroller());

  useEffect(() => {
    if (!readOnly) return;
    autoScrollerRef.current.stop();
    setIsRootDragOver(false);
  }, [readOnly]);

  const handleRootDragOver = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();
      autoScrollerRef.current.update(e);
      setIsRootDragOver(true);
    },
    [readOnly]
  );

  const handleRootDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    autoScrollerRef.current.stop();
    setIsRootDragOver(false);
  }, []);

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();
      autoScrollerRef.current.stop();
      setIsRootDragOver(false);

      const { nodeId, type } = readDragData(e);
      if (nodeId) {
        useEditorStore.getState().moveNode(nodeId, undefined, content.length);
      } else if (type) {
        insertNode(createNode(config, type), undefined, content.length);
      }

      endDrag();
    },
    [config, content.length, endDrag, insertNode, readOnly]
  );

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
