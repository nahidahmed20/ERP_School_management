import { useEffect } from 'react';
import { setTranslationOverrides, translateText } from './catalog';

const SKIP_TEXT_PARENTS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);
const LOCALIZED_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'aria-description', 'alt'];

export default function LocalizationObserver() {
  useEffect(() => {
    const originalTexts = new WeakMap();
    const originalAttributes = new WeakMap();
    const textNodes = new Set();
    const elements = new Set();
    let locale = document.documentElement.lang === 'bn' ? 'bn' : 'en';
    const readPage = () => {
      try {
        return JSON.parse(document.getElementById('app')?.dataset.page ?? '{}');
      } catch {
        return {};
      }
    };
    const initialOverrides = readPage().props?.translation_overrides;
    if (initialOverrides) setTranslationOverrides(initialOverrides);

    const localizeTextNode = (node) => {
      const parent = node.parentElement;
      if (!parent || SKIP_TEXT_PARENTS.has(parent.tagName)) return;
      let record = originalTexts.get(node);
      if (!record) {
        record = { original: node.nodeValue, last: node.nodeValue };
        originalTexts.set(node, record);
      } else if (node.nodeValue !== record.last) {
        record.original = node.nodeValue;
      }
      textNodes.add(node);
      const translated = translateText(record.original, locale);
      if (node.nodeValue !== translated) node.nodeValue = translated;
      record.last = translated;
    };

    const localizeElement = (element) => {
      if (!(element instanceof Element)) return;
      let originals = originalAttributes.get(element);
      for (const attribute of LOCALIZED_ATTRIBUTES) {
        if (!element.hasAttribute(attribute)) continue;
        originals ??= new Map();
        const current = element.getAttribute(attribute);
        const record = originals.get(attribute);
        if (!record) originals.set(attribute, { original: current, last: current });
        else if (current !== record.last) record.original = current;
        const attributeRecord = originals.get(attribute);
        const translated = translateText(attributeRecord.original, locale);
        if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
        attributeRecord.last = translated;
      }
      if (originals) {
        originalAttributes.set(element, originals);
        elements.add(element);
      }
    };

    const scan = (root) => {
      if (!root) return;
      if (root.nodeType === Node.TEXT_NODE) {
        localizeTextNode(root);
        return;
      }
      if (root.nodeType === Node.ELEMENT_NODE) localizeElement(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) localizeTextNode(node);
      if (root.nodeType === Node.ELEMENT_NODE) {
        root.querySelectorAll(LOCALIZED_ATTRIBUTES.map((name) => `[${name}]`).join(',')).forEach(localizeElement);
      }
    };

    const applyLocale = (nextLocale) => {
      locale = nextLocale === 'bn' ? 'bn' : 'en';
      document.documentElement.lang = locale;
      textNodes.forEach((node) => {
        if (node.isConnected) localizeTextNode(node);
        else textNodes.delete(node);
      });
      elements.forEach((element) => {
        if (!element.isConnected) {
          elements.delete(element);
          return;
        }
        const originals = originalAttributes.get(element);
        originals?.forEach((record, attribute) => {
          const translated = translateText(record.original, locale);
          if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
          record.last = translated;
        });
      });
    };

    scan(document.head);
    scan(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') localizeTextNode(mutation.target);
        if (mutation.type === 'attributes') localizeElement(mutation.target);
        mutation.addedNodes?.forEach(scan);
      }
    });
    const observerOptions = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: LOCALIZED_ATTRIBUTES };
    observer.observe(document.head, observerOptions);
    observer.observe(document.body, observerOptions);
    const onLocaleChange = (event) => applyLocale(event.detail?.locale ?? document.documentElement.lang);
    const onInertiaSuccess = (event) => {
      const page = event.detail?.page ?? readPage();
      if (page.props && Object.hasOwn(page.props, 'translation_overrides')) {
        setTranslationOverrides(page.props.translation_overrides ?? {});
      }
      applyLocale(page.props?.locale ?? document.documentElement.lang);
    };
    window.addEventListener('app:locale-changed', onLocaleChange);
    document.addEventListener('inertia:success', onInertiaSuccess);

    return () => {
      observer.disconnect();
      window.removeEventListener('app:locale-changed', onLocaleChange);
      document.removeEventListener('inertia:success', onInertiaSuccess);
    };
  }, []);

  return null;
}
