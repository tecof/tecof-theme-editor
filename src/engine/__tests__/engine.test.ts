import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store';
import { createEmptyDocument, parseDocument, serializeDocument } from '../document';
import { getParentId, getBreadcrumbs } from '../zones';

describe('Tecof Studio Engine', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(createEmptyDocument());
  });

  describe('Document Utilities', () => {
    it('should parse and serialize document without data loss', () => {
      const rawData = {
        root: { props: { title: 'Home' } },
        content: [
          { type: 'Hero', props: { id: 'hero-1', title: 'Welcome' } }
        ],
        zones: {
          'hero-1:buttons': [
            { type: 'Button', props: { id: 'btn-1', label: 'Click Me' } }
          ]
        }
      };

      const doc = parseDocument(rawData);
      expect(doc.content.length).toBe(1);
      
      const serialized = serializeDocument(doc);
      expect(serialized).toEqual(rawData);
    });
  });

  describe('Operations', () => {
    it('should insert a node into the root content', () => {
      const { insertNode } = useEditorStore.getState();
      
      insertNode({ type: 'Hero', props: { id: 'node-1' } });
      
      const { document } = useEditorStore.getState();
      expect(document.content.length).toBe(1);
      expect(document.content[0].type).toBe('Hero');
      expect(document.content[0].props.id).toBe('node-1');
    });

    it('should generate an id if not provided on insert', () => {
      const { insertNode } = useEditorStore.getState();
      
      insertNode({ type: 'Hero', props: { id: '' } }); // empty id
      
      const { document } = useEditorStore.getState();
      expect(document.content[0].props.id).toBeTruthy();
      expect(document.content[0].props.id.length).toBeGreaterThan(0);
    });

    it('should insert a node into a specific zone', () => {
      const { insertNode } = useEditorStore.getState();
      
      insertNode({ type: 'Container', props: { id: 'container-1' } });
      insertNode({ type: 'Button', props: { id: 'btn-1' } }, 'container-1:content');
      
      const { document } = useEditorStore.getState();
      expect(document.zones['container-1:content']).toBeDefined();
      expect(document.zones['container-1:content'].length).toBe(1);
      expect(document.zones['container-1:content'][0].props.id).toBe('btn-1');
    });

    it('should remove a node and clean up its zones recursively', () => {
      const { insertNode, removeNode } = useEditorStore.getState();
      
      insertNode({ type: 'Container', props: { id: 'c1' } });
      insertNode({ type: 'Row', props: { id: 'r1' } }, 'c1:content');
      insertNode({ type: 'Button', props: { id: 'b1' } }, 'r1:items');
      
      let { document } = useEditorStore.getState();
      expect(document.zones['c1:content']).toBeDefined();
      expect(document.zones['r1:items']).toBeDefined();

      removeNode('c1');
      
      document = useEditorStore.getState().document;
      expect(document.content.length).toBe(0);
      expect(document.zones['c1:content']).toBeUndefined();
      expect(document.zones['r1:items']).toBeUndefined();
    });

    it('should move a node within the same list', () => {
      const { insertNode, moveNode } = useEditorStore.getState();
      
      insertNode({ type: 'A', props: { id: 'a' } });
      insertNode({ type: 'B', props: { id: 'b' } });
      insertNode({ type: 'C', props: { id: 'c' } });
      
      moveNode('c', undefined, 0); // move C to start
      
      const { document } = useEditorStore.getState();
      expect(document.content[0].props.id).toBe('c');
      expect(document.content[1].props.id).toBe('a');
      expect(document.content[2].props.id).toBe('b');
    });

    it('should prevent moving a node into its own descendant zone', () => {
      const { insertNode, moveNode } = useEditorStore.getState();

      insertNode({ type: 'Container', props: { id: 'c1' } });
      insertNode({ type: 'Row', props: { id: 'r1' } }, 'c1:content');
      insertNode({ type: 'Button', props: { id: 'b1' } }, 'r1:items');

      moveNode('c1', 'r1:items', 1);

      const { document } = useEditorStore.getState();
      expect(document.content.map((node) => node.props.id)).toEqual(['c1']);
      expect(document.zones['c1:content'].map((node) => node.props.id)).toEqual(['r1']);
      expect(document.zones['r1:items'].map((node) => node.props.id)).toEqual(['b1']);
    });

    it('should duplicate a node and remap inner zone ids', () => {
      const { insertNode, duplicateNode } = useEditorStore.getState();
      
      insertNode({ type: 'Container', props: { id: 'c1' } });
      insertNode({ type: 'Button', props: { id: 'b1' } }, 'c1:content');
      
      duplicateNode('c1');
      
      const { document } = useEditorStore.getState();
      expect(document.content.length).toBe(2);
      
      const dupContainer = document.content[1];
      expect(dupContainer.props.id).not.toBe('c1');
      
      const dupZoneKey = `${dupContainer.props.id}:content`;
      expect(document.zones[dupZoneKey]).toBeDefined();
      expect(document.zones[dupZoneKey].length).toBe(1);
      expect(document.zones[dupZoneKey][0].props.id).not.toBe('b1');
    });

    it('should update props', () => {
      const { insertNode, updateProps } = useEditorStore.getState();
      
      insertNode({ type: 'Text', props: { id: 't1', text: 'Old' } });
      updateProps('t1', { text: 'New', color: 'red' });
      
      const { document } = useEditorStore.getState();
      expect(document.content[0].props.text).toBe('New');
      expect(document.content[0].props.color).toBe('red');
    });
  });

  describe('History (Undo/Redo)', () => {
    it('should undo and redo changes', () => {
      const { insertNode, undo, redo } = useEditorStore.getState();
      
      insertNode({ type: 'Node1', props: { id: '1' } });
      expect(useEditorStore.getState().document.content.length).toBe(1);
      
      undo();
      expect(useEditorStore.getState().document.content.length).toBe(0);
      
      redo();
      expect(useEditorStore.getState().document.content.length).toBe(1);
    });
  });

  describe('Zone Helpers', () => {
    it('should resolve parent ID and breadcrumbs correctly', () => {
      const { insertNode } = useEditorStore.getState();

      insertNode({ type: 'Container', props: { id: 'c1' } });
      insertNode({ type: 'Row', props: { id: 'r1' } }, 'c1:content');
      insertNode({ type: 'Button', props: { id: 'b1' } }, 'r1:items');

      const { document } = useEditorStore.getState();

      // Parent ID checks
      expect(getParentId(document, 'c1')).toBeNull();
      expect(getParentId(document, 'r1')).toBe('c1');
      expect(getParentId(document, 'b1')).toBe('r1');

      // Breadcrumbs checks
      const crumbs = getBreadcrumbs(document, 'b1');
      expect(crumbs).toEqual([
        { id: 'c1', type: 'Container' },
        { id: 'r1', type: 'Row' },
        { id: 'b1', type: 'Button' }
      ]);
    });
  });
});
