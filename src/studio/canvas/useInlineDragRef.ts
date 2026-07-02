import { useCallback, useRef, useEffect } from 'react';
import { setDragGhost } from './dragGhost';
import { writeDragData } from './dndUtils';

export function useInlineDragRef({
  node,
  index,
  zoneKey,
  locked,
  wrapperClassName,
  label,
  beginDrag,
  endDrag,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  onDoubleClick,
  onDragOver,
  onDragLeave,
  onDrop,
}: any) {
  const nodeRef = useRef<HTMLElement | null>(null);
  
  const callbacks = useRef({
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    onDoubleClick,
    onDragOver,
    onDragLeave,
    onDrop,
    beginDrag,
    endDrag,
  });
  
  useEffect(() => {
    callbacks.current = {
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
      onDoubleClick,
      onDragOver,
      onDragLeave,
      onDrop,
      beginDrag,
      endDrag,
    };
  });

  const setRef = useCallback((el: HTMLElement | null) => {
    if (nodeRef.current) {
      const old = nodeRef.current;
      old.removeAttribute('data-tecof-id');
      old.removeAttribute('data-tecof-type');
      old.removeAttribute('data-tecof-index');
      old.removeAttribute('data-tecof-zone');
      old.removeAttribute('draggable');
      
      const classesToRemove = wrapperClassName.split(' ').filter(Boolean);
      if (classesToRemove.length > 0) {
        old.classList.remove(...classesToRemove);
      }
    }

    if (el) {
      el.setAttribute('data-tecof-id', node.props.id);
      el.setAttribute('data-tecof-type', node.type);
      el.setAttribute('data-tecof-index', String(index));
      el.setAttribute('data-tecof-zone', zoneKey || 'root');
      
      if (!locked) {
        el.setAttribute('draggable', 'true');
      }

      const classesToAdd = wrapperClassName.split(' ').filter(Boolean);
      if (classesToAdd.length > 0) {
        el.classList.add(...classesToAdd);
      }
    }
    
    nodeRef.current = el;
  }, [node.props.id, node.type, index, zoneKey, locked, wrapperClassName]);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const onMouseEnter = (e: MouseEvent) => callbacks.current.handleMouseEnter(e);
    const onMouseLeave = (e: MouseEvent) => callbacks.current.handleMouseLeave(e);
    const onClick = (e: MouseEvent) => callbacks.current.handleClick(e);
    const onDblClick = (e: MouseEvent) => callbacks.current.onDoubleClick(e);
    const onNativeDragOver = (e: DragEvent) => callbacks.current.onDragOver(e);
    const onNativeDragLeave = (e: DragEvent) => callbacks.current.onDragLeave(e);
    const onNativeDrop = (e: DragEvent) => callbacks.current.onDrop(e);
    
    const onDragStart = (e: DragEvent) => {
      if (locked) return;
      writeDragData(e as any, { nodeId: node.props.id });
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
      setDragGhost(e as any, label);
      callbacks.current.beginDrag({ id: node.props.id });
    };
    
    const onDragEnd = () => {
      if (locked) return;
      callbacks.current.endDrag();
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('click', onClick);
    el.addEventListener('dblclick', onDblClick);
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragend', onDragEnd);
    el.addEventListener('dragover', onNativeDragOver);
    el.addEventListener('dragleave', onNativeDragLeave);
    el.addEventListener('drop', onNativeDrop);

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('click', onClick);
      el.removeEventListener('dblclick', onDblClick);
      el.removeEventListener('dragstart', onDragStart);
      el.removeEventListener('dragend', onDragEnd);
      el.removeEventListener('dragover', onNativeDragOver);
      el.removeEventListener('dragleave', onNativeDragLeave);
      el.removeEventListener('drop', onNativeDrop);
    };
  }, [locked, node.props.id, label, setRef]);

  return { setRef, nodeRef };
}
