import { useEffect } from 'react';

const pageSizes = ['10', '25', '50', '100', '500'];

function enhancePageSizeSelects(root = document) {
    root.querySelectorAll('select').forEach((select) => {
        const options = [...select.options];
        const values = options.map((option) => option.value.toLowerCase());
        const hasPageLabel = options.some((option) => /\/\s*page/i.test(option.textContent ?? ''));
        const hasStandardSizes = ['10', '25', '50'].every((size) => values.includes(size))
            && values.every((value) => /^\d+$/.test(value) || value === 'all');
        const isPageSizeSelect = hasPageLabel || hasStandardSizes;

        if (!isPageSizeSelect) return;

        const allValue = options.find((option) => option.value.toLowerCase() === 'all')?.value || 'all';
        const signature = `${pageSizes.join(',')},${allValue}`;
        if (select.dataset.pageSizeSignature === signature) {
            select.classList.add('ui-page-size-select');
            return;
        }

        select.replaceChildren();
        pageSizes.forEach((size) => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size} / Page`;
            select.appendChild(option);
        });

        const allOption = document.createElement('option');
        allOption.value = allValue;
        allOption.textContent = 'All Pages';
        select.appendChild(allOption);

        select.dataset.pageSizeSignature = signature;
        select.classList.add('ui-page-size-select');
    });
}

export default function PageSizeEnhancer() {
    useEffect(() => {
        enhancePageSizeSelects();

        const observer = new MutationObserver(() => enhancePageSizeSelects());
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return null;
}
