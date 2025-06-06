/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createParagraphNode,
  $createRangeSelection,
  $getRoot,
  TextNode,
} from 'lexical';
import {
  expectHtmlToBeEqual,
  html,
  initializeUnitTest,
} from 'lexical/src/__tests__/utils';

import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  ListItemNode,
  ListNode,
} from '../..';
import {$handleIndent} from '../../formatList';

const editorConfig = Object.freeze({
  namespace: '',
  theme: {
    list: {
      listitem: 'my-listItem-item-class',
      nested: {
        listitem: 'my-nested-list-listItem-class',
      },
    },
  },
});

describe('LexicalListItemNode tests', () => {
  initializeUnitTest((testEnv) => {
    test('ListItemNode.constructor', async () => {
      const {editor} = testEnv;

      await editor.update(() => {
        const listItemNode = new ListItemNode();

        expect(listItemNode.getType()).toBe('listitem');

        expect(listItemNode.getTextContent()).toBe('');
      });

      expect(() => new ListItemNode()).toThrow();
    });

    test('ListItemNode.createDOM()', async () => {
      const {editor} = testEnv;

      await editor.update(() => {
        const listItemNode = new ListItemNode();

        expectHtmlToBeEqual(
          listItemNode.createDOM(editorConfig).outerHTML,
          html`
            <li class="my-listItem-item-class" value="1"></li>
          `,
        );

        expectHtmlToBeEqual(
          listItemNode.createDOM({
            namespace: '',
            theme: {},
          }).outerHTML,
          html`
            <li value="1"></li>
          `,
        );
      });
    });

    describe('ListItemNode.updateDOM()', () => {
      test('base', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const listItemNode = new ListItemNode();

          const domElement = listItemNode.createDOM(editorConfig);

          expectHtmlToBeEqual(
            domElement.outerHTML,
            html`
              <li class="my-listItem-item-class" value="1"></li>
            `,
          );
          const newListItemNode = new ListItemNode();

          const result = newListItemNode.updateDOM(
            listItemNode,
            domElement,
            editorConfig,
          );

          expect(result).toBe(false);

          expectHtmlToBeEqual(
            domElement.outerHTML,
            html`
              <li class="my-listItem-item-class" value="1"></li>
            `,
          );
        });
      });

      test('nested list', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const parentListNode = new ListNode('bullet', 1);
          const parentlistItemNode = new ListItemNode();

          parentListNode.append(parentlistItemNode);
          const domElement = parentlistItemNode.createDOM(editorConfig);

          expectHtmlToBeEqual(
            domElement.outerHTML,
            html`
              <li class="my-listItem-item-class" value="1"></li>
            `,
          );
          const nestedListNode = new ListNode('bullet', 1);
          nestedListNode.append(new ListItemNode());
          parentlistItemNode.append(nestedListNode);
          const result = parentlistItemNode.updateDOM(
            parentlistItemNode,
            domElement,
            editorConfig,
          );

          expect(result).toBe(false);

          expectHtmlToBeEqual(
            domElement.outerHTML,
            html`
              <li
                class="my-listItem-item-class my-nested-list-listItem-class"
                value="1"></li>
            `,
          );
        });
      });
    });

    describe('ListItemNode.replace()', () => {
      let listNode: ListNode;
      let listItemNode1: ListItemNode;
      let listItemNode2: ListItemNode;
      let listItemNode3: ListItemNode;

      beforeEach(async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const root = $getRoot();
          listNode = new ListNode('bullet', 1);
          listItemNode1 = new ListItemNode();

          listItemNode1.append(new TextNode('one'));
          listItemNode2 = new ListItemNode();

          listItemNode2.append(new TextNode('two'));
          listItemNode3 = new ListItemNode();

          listItemNode3.append(new TextNode('three'));
          root.append(listNode);
          listNode.append(listItemNode1, listItemNode2, listItemNode3);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('another list item node', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const newListItemNode = new ListItemNode();

          newListItemNode.append(new TextNode('bar'));
          listItemNode1.replace(newListItemNode);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">bar</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('first list item with a non list item node', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          return;
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => {
          const paragraphNode = $createParagraphNode();
          listItemNode1.replace(paragraphNode);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <p><br /></p>
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('last list item with a non list item node', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const paragraphNode = $createParagraphNode();
          listItemNode3.replace(paragraphNode);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
              </ul>
              <p><br /></p>
            </div>
          `,
        );
      });

      test('middle list item with a non list item node', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const paragraphNode = $createParagraphNode();
          listItemNode2.replace(paragraphNode);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
              </ul>
              <p><br /></p>
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('the only list item with a non list item node', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode2.remove();
          listItemNode3.remove();
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => {
          const paragraphNode = $createParagraphNode();
          listItemNode1.replace(paragraphNode);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <p><br /></p>
            </div>
          `,
        );
      });
    });

    describe('ListItemNode.remove()', () => {
      // - A
      // - x
      // - B
      test('siblings are not nested', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          A_listItem.append(new TextNode('A'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          B_listItem.append(new TextNode('B'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">A</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">x</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">B</span>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">A</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">B</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      //   - A
      // - x
      // - B
      test('the previous sibling is nested', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          const A_nestedList = new ListNode('bullet', 1);
          const A_nestedListItem = new ListItemNode();
          A_listItem.append(A_nestedList);
          A_nestedList.append(A_nestedListItem);
          A_nestedListItem.append(new TextNode('A'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          B_listItem.append(new TextNode('B'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A</span>
                    </li>
                  </ul>
                </li>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">x</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">B</span>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A</span>
                    </li>
                  </ul>
                </li>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">B</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      // - A
      // - x
      //   - B
      test('the next sibling is nested', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          A_listItem.append(new TextNode('A'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          const B_nestedList = new ListNode('bullet', 1);
          const B_nestedListItem = new ListItemNode();
          B_listItem.append(B_nestedList);
          B_nestedList.append(B_nestedListItem);
          B_nestedListItem.append(new TextNode('B'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">A</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">x</span>
                </li>
                <li value="3">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">A</span>
                </li>
                <li value="2">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );
      });

      //   - A
      // - x
      //   - B
      test('both siblings are nested', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          const A_nestedList = new ListNode('bullet', 1);
          const A_nestedListItem = new ListItemNode();
          A_listItem.append(A_nestedList);
          A_nestedList.append(A_nestedListItem);
          A_nestedListItem.append(new TextNode('A'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          const B_nestedList = new ListNode('bullet', 1);
          const B_nestedListItem = new ListItemNode();
          B_listItem.append(B_nestedList);
          B_nestedList.append(B_nestedListItem);
          B_nestedListItem.append(new TextNode('B'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A</span>
                    </li>
                  </ul>
                </li>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">x</span>
                </li>
                <li value="2">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A</span>
                    </li>
                    <li dir="ltr" value="2">
                      <span data-lexical-text="true">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );
      });

      //  - A1
      //     - A2
      // - x
      //   - B
      test('the previous sibling is nested deeper than the next sibling', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          const A_nestedList = new ListNode('bullet', 1);
          const A_nestedListItem1 = new ListItemNode();
          const A_nestedListItem2 = new ListItemNode();
          const A_deeplyNestedList = new ListNode('bullet', 1);
          const A_deeplyNestedListItem = new ListItemNode();
          A_listItem.append(A_nestedList);
          A_nestedList.append(A_nestedListItem1);
          A_nestedList.append(A_nestedListItem2);
          A_nestedListItem1.append(new TextNode('A1'));
          A_nestedListItem2.append(A_deeplyNestedList);
          A_deeplyNestedList.append(A_deeplyNestedListItem);
          A_deeplyNestedListItem.append(new TextNode('A2'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          const B_nestedList = new ListNode('bullet', 1);
          const B_nestedlistItem = new ListItemNode();
          B_listItem.append(B_nestedList);
          B_nestedList.append(B_nestedlistItem);
          B_nestedlistItem.append(new TextNode('B'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A1</span>
                    </li>
                    <li value="2">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">A2</span>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">x</span>
                </li>
                <li value="2">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A1</span>
                    </li>
                    <li value="2">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">A2</span>
                        </li>
                      </ul>
                    </li>
                    <li dir="ltr" value="2">
                      <span data-lexical-text="true">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );
      });

      //   - A
      // - x
      //     - B1
      //   - B2
      test('the next sibling is nested deeper than the previous sibling', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          const A_nestedList = new ListNode('bullet', 1);
          const A_nestedListItem = new ListItemNode();
          A_listItem.append(A_nestedList);
          A_nestedList.append(A_nestedListItem);
          A_nestedListItem.append(new TextNode('A'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          const B_nestedList = new ListNode('bullet', 1);
          const B_nestedListItem1 = new ListItemNode();
          const B_nestedListItem2 = new ListItemNode();
          const B_deeplyNestedList = new ListNode('bullet', 1);
          const B_deeplyNestedListItem = new ListItemNode();
          B_listItem.append(B_nestedList);
          B_nestedList.append(B_nestedListItem1);
          B_nestedList.append(B_nestedListItem2);
          B_nestedListItem1.append(B_deeplyNestedList);
          B_nestedListItem2.append(new TextNode('B2'));
          B_deeplyNestedList.append(B_deeplyNestedListItem);
          B_deeplyNestedListItem.append(new TextNode('B1'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A</span>
                    </li>
                  </ul>
                </li>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">x</span>
                </li>
                <li value="2">
                  <ul>
                    <li value="1">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">B1</span>
                        </li>
                      </ul>
                    </li>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">B2</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A</span>
                    </li>
                    <li value="2">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">B1</span>
                        </li>
                      </ul>
                    </li>
                    <li dir="ltr" value="2">
                      <span data-lexical-text="true">B2</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );
      });

      //   - A1
      //     - A2
      // - x
      //     - B1
      //   - B2
      test('both siblings are deeply nested', async () => {
        const {editor} = testEnv;
        let x: ListItemNode;

        await editor.update(() => {
          const root = $getRoot();
          const parent = new ListNode('bullet', 1);

          const A_listItem = new ListItemNode();
          const A_nestedList = new ListNode('bullet', 1);
          const A_nestedListItem1 = new ListItemNode();
          const A_nestedListItem2 = new ListItemNode();
          const A_deeplyNestedList = new ListNode('bullet', 1);
          const A_deeplyNestedListItem = new ListItemNode();
          A_listItem.append(A_nestedList);
          A_nestedList.append(A_nestedListItem1);
          A_nestedList.append(A_nestedListItem2);
          A_nestedListItem1.append(new TextNode('A1'));
          A_nestedListItem2.append(A_deeplyNestedList);
          A_deeplyNestedList.append(A_deeplyNestedListItem);
          A_deeplyNestedListItem.append(new TextNode('A2'));

          x = new ListItemNode();
          x.append(new TextNode('x'));

          const B_listItem = new ListItemNode();
          const B_nestedList = new ListNode('bullet', 1);
          const B_nestedListItem1 = new ListItemNode();
          const B_nestedListItem2 = new ListItemNode();
          const B_deeplyNestedList = new ListNode('bullet', 1);
          const B_deeplyNestedListItem = new ListItemNode();
          B_listItem.append(B_nestedList);
          B_nestedList.append(B_nestedListItem1);
          B_nestedList.append(B_nestedListItem2);
          B_nestedListItem1.append(B_deeplyNestedList);
          B_nestedListItem2.append(new TextNode('B2'));
          B_deeplyNestedList.append(B_deeplyNestedListItem);
          B_deeplyNestedListItem.append(new TextNode('B1'));

          parent.append(A_listItem, x, B_listItem);
          root.append(parent);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A1</span>
                    </li>
                    <li value="2">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">A2</span>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">x</span>
                </li>
                <li value="2">
                  <ul>
                    <li value="1">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">B1</span>
                        </li>
                      </ul>
                    </li>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">B2</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => x.remove());

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li value="1">
                  <ul>
                    <li dir="ltr" value="1">
                      <span data-lexical-text="true">A1</span>
                    </li>
                    <li value="2">
                      <ul>
                        <li dir="ltr" value="1">
                          <span data-lexical-text="true">A2</span>
                        </li>
                        <li dir="ltr" value="2">
                          <span data-lexical-text="true">B1</span>
                        </li>
                      </ul>
                    </li>
                    <li dir="ltr" value="2">
                      <span data-lexical-text="true">B2</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          `,
        );
      });
    });

    describe('ListItemNode.insertNewAfter(): non-empty list items', () => {
      let listNode: ListNode;
      let listItemNode1: ListItemNode;
      let listItemNode2: ListItemNode;
      let listItemNode3: ListItemNode;

      beforeEach(async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const root = $getRoot();
          listNode = new ListNode('bullet', 1);
          listItemNode1 = new ListItemNode();

          listItemNode2 = new ListItemNode();

          listItemNode3 = new ListItemNode();

          root.append(listNode);
          listNode.append(listItemNode1, listItemNode2, listItemNode3);
          listItemNode1.append(new TextNode('one'));
          listItemNode2.append(new TextNode('two'));
          listItemNode3.append(new TextNode('three'));
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('first list item', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode1.insertNewAfter($createRangeSelection());
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li value="2"><br /></li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="4">
                  <span data-lexical-text="true">three</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('last list item', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode3.insertNewAfter($createRangeSelection());
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">three</span>
                </li>
                <li value="4"><br /></li>
              </ul>
            </div>
          `,
        );
      });

      test('middle list item', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode3.insertNewAfter($createRangeSelection());
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li dir="ltr" value="2">
                  <span data-lexical-text="true">two</span>
                </li>
                <li dir="ltr" value="3">
                  <span data-lexical-text="true">three</span>
                </li>
                <li value="4"><br /></li>
              </ul>
            </div>
          `,
        );
      });

      test('the only list item', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode2.remove();
          listItemNode3.remove();
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
              </ul>
            </div>
          `,
        );

        await editor.update(() => {
          listItemNode1.insertNewAfter($createRangeSelection());
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul>
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">one</span>
                </li>
                <li value="2"><br /></li>
              </ul>
            </div>
          `,
        );
      });
    });

    test('$createListItemNode()', async () => {
      const {editor} = testEnv;

      await editor.update(() => {
        const listItemNode = new ListItemNode();

        const createdListItemNode = $createListItemNode();

        expect(listItemNode.__type).toEqual(createdListItemNode.__type);
        expect(listItemNode.__parent).toEqual(createdListItemNode.__parent);
        expect(listItemNode.__key).not.toEqual(createdListItemNode.__key);
      });
    });

    test('$isListItemNode()', async () => {
      const {editor} = testEnv;

      await editor.update(() => {
        const listItemNode = new ListItemNode();

        expect($isListItemNode(listItemNode)).toBe(true);
      });
    });

    describe('ListItemNode.setIndent()', () => {
      let listNode: ListNode;
      let listItemNode1: ListItemNode;
      let listItemNode2: ListItemNode;

      beforeEach(async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const root = $getRoot();
          listNode = new ListNode('bullet', 1);
          listItemNode1 = new ListItemNode();

          listItemNode2 = new ListItemNode();

          root.append(listNode);
          listNode.append(listItemNode1, listItemNode2);
          listItemNode1.append(new TextNode('one'));
          listItemNode2.append(new TextNode('two'));
        });
      });
      it('indents and outdents list item', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode1.setIndent(3);
        });

        await editor.update(() => {
          expect(listItemNode1.getIndent()).toBe(3);
        });

        expectHtmlToBeEqual(
          editor.getRootElement()!.innerHTML,
          html`
            <ul>
              <li value="1">
                <ul>
                  <li value="1">
                    <ul>
                      <li value="1">
                        <ul>
                          <li dir="ltr" value="1">
                            <span data-lexical-text="true">one</span>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li dir="ltr" value="1">
                <span data-lexical-text="true">two</span>
              </li>
            </ul>
          `,
        );

        await editor.update(() => {
          listItemNode1.setIndent(0);
        });

        await editor.update(() => {
          expect(listItemNode1.getIndent()).toBe(0);
        });

        expectHtmlToBeEqual(
          editor.getRootElement()!.innerHTML,
          html`
            <ul>
              <li dir="ltr" value="1">
                <span data-lexical-text="true">one</span>
              </li>
              <li dir="ltr" value="2">
                <span data-lexical-text="true">two</span>
              </li>
            </ul>
          `,
        );
      });

      it('handles fractional indent values', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          listItemNode1.setIndent(0.5);
        });

        await editor.update(() => {
          expect(listItemNode1.getIndent()).toBe(0);
        });
      });
    });

    test('Can serialize a node that is not attached', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const listItemNode = $createListItemNode();
        const listNode = $createListNode();
        listNode.append(listItemNode);
        expect(listItemNode.exportJSON()).toEqual({
          checked: undefined,
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'listitem',
          value: 1,
          version: 1,
        });
      });
    });

    describe('ListItemNode RTL behavior', () => {
      let listNode: ListNode;
      let listItemNode1: ListItemNode;
      let listItemNode2: ListItemNode;

      beforeEach(async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const root = $getRoot();
          listNode = new ListNode('bullet', 1);
          listItemNode1 = new ListItemNode();
          listItemNode2 = new ListItemNode();

          root.append(listNode);
          listNode.append(listItemNode1, listItemNode2);

          // Add Arabic text to test RTL
          listItemNode1.append(new TextNode('مرحبا'));
          listItemNode2.append(new TextNode('العالم'));
        });
      });

      test('list items with RTL content have correct direction in editor', async () => {
        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              dir="rtl"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul dir="rtl">
                <li dir="rtl" value="1">
                  <span data-lexical-text="true">مرحبا</span>
                </li>
                <li dir="rtl" value="2">
                  <span data-lexical-text="true">العالم</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('list items preserve RTL direction in exported HTML', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const exportedHTML = listItemNode1.exportDOM(editor);
          const element = exportedHTML.element as HTMLElement;

          expect(element.dir).toBe('rtl');
          expect(element.tagName.toLowerCase()).toBe('li');
        });

        await editor.update(() => {
          const exportedHTML = listItemNode2.exportDOM(editor);
          const element = exportedHTML.element as HTMLElement;

          expect(element.dir).toBe('rtl');
          expect(element.tagName.toLowerCase()).toBe('li');
        });
      });

      test('list items handle mixed LTR and RTL content', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          // Add mixed direction content
          listItemNode1.clear();
          listItemNode1.append(new TextNode('Hello مرحبا'));
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              dir="rtl"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul dir="rtl">
                <li dir="ltr" value="1">
                  <span data-lexical-text="true">Hello مرحبا</span>
                </li>
                <li dir="rtl" value="2">
                  <span data-lexical-text="true">العالم</span>
                </li>
              </ul>
            </div>
          `,
        );
      });

      test('nested list items preserve RTL direction', async () => {
        const {editor} = testEnv;

        await editor.update(() => {
          const nestedList = new ListNode('bullet', 1);
          const nestedItem = new ListItemNode();
          nestedItem.append(new TextNode('فرعي')); // "Sub" in Arabic
          nestedList.append(nestedItem);
          listItemNode1.append(nestedList);
        });

        expectHtmlToBeEqual(
          testEnv.outerHTML,
          html`
            <div
              contenteditable="true"
              dir="rtl"
              style="user-select: text; white-space: pre-wrap; word-break: break-word;"
              data-lexical-editor="true">
              <ul dir="rtl">
                <li dir="rtl" value="1">
                  <span data-lexical-text="true">مرحبا</span>
                  <ul dir="rtl">
                    <li dir="rtl" value="1">
                      <span data-lexical-text="true">فرعي</span>
                    </li>
                  </ul>
                </li>
                <li dir="rtl" value="2">
                  <span data-lexical-text="true">العالم</span>
                </li>
              </ul>
            </div>
          `,
        );
      });
    });

    test('ListItemNode marker style inheritance on indent', async () => {
      const {editor} = testEnv;

      await editor.update(() => {
        const root = $getRoot();
        const listNode = $createListNode('bullet');
        const listItem1 = $createListItemNode();
        const listItem2 = $createListItemNode();

        // Set marker style on listItem2
        listItem2.setTextStyle('font-size: 19px;');

        listNode.append(listItem1, listItem2);
        root.append(listNode);

        // Indent listItem2
        $handleIndent(listItem2);

        // Get the parent list item after indent
        const parentListItem = listItem2.getParentOrThrow().getParentOrThrow();
        expect($isListItemNode(parentListItem)).toBe(true);

        // Check if marker style was inherited
        expect(parentListItem.getTextStyle()).toBe('font-size: 19px;');
      });
    });
  });
});
