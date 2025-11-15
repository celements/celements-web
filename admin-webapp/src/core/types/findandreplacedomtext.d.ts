// typing self-made with infos from https://github.com/padolsey/findAndReplaceDOMText
declare module 'findandreplacedomtext' {
  interface FindAndReplaceDOMTextOptions {
    find: string | RegExp;
    replace?: string | ReplaceFunction;
    wrap?: string | Node;
    wrapClass?: string;
    portionMode?: 'retain' | 'first';
    filterElements?: (element: Element) => boolean;
    forceContext?: (element: Element) => boolean | boolean;
    preset?: 'prose';
  }

  interface Portion {
    index: number;
    text: string;
    node: Node;
    indexInMatch: number;
    indexInNode: number;
  }

  interface ReplaceFunction {
    (portion: Portion, match: string): Node | string;
  }

  interface FinderInstance {
    revert(): void;
  }

  function findAndReplaceDOMText(
    element: HTMLElement,
    options: FindAndReplaceDOMTextOptions
  ): FinderInstance;

  export { FinderInstance };
  export default findAndReplaceDOMText;
}
