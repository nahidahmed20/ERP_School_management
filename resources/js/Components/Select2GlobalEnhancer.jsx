import { useEffect } from 'react';

/**
 * Global Select2 Automatic Enhancer for the entire ERP Project
 * 
 * Automatically upgrades all standard <select> elements across all forms,
 * modals, and tables into searchable Select2 interactive controls with live
 * search filtering, keyboard navigation, clear button, and React change sync.
 */

let currentOpenDropdown = null;

function closeActiveDropdown() {
    if (currentOpenDropdown) {
        currentOpenDropdown.close();
    }
}

function setNativeSelectValue(select, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    if (nativeSetter) {
        nativeSetter.call(select, value);
    } else {
        select.value = value;
    }
    // Dispatch events so React useForm / useState / Inertia receives the update
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('input', { bubbles: true }));
}

function shouldEnhance(select) {
    if (!select || select.tagName?.toLowerCase() !== 'select') return false;

    // 1. COMPLETELY EXCLUDE SweetAlert2, Toast messages, and system alerts
    if (
        select.classList.contains('swal2-select') ||
        select.closest('.swal2-container') ||
        select.closest('.swal2-popup') ||
        select.closest('.swal2-toast') ||
        select.closest('[class*="swal2"]') ||
        select.closest('[class*="toast"]') ||
        select.closest('[class*="Toast"]') ||
        select.closest('[role="alert"]') ||
        select.closest('[role="status"]')
    ) {
        return false;
    }

    // 2. EXCLUDE Per-Page / Page-size selects (e.g. 10/Page, 20/Page)
    if (
        select.classList.contains('ui-page-size-select') ||
        select.classList.contains('per-page-select') ||
        select.name === 'per_page' ||
        select.name === 'perPage' ||
        select.dataset.pageSizeSignature !== undefined ||
        Array.from(select.options).some((o) => /\/\s*page/i.test(o.textContent || ''))
    ) {
        // Enforce compact, elegant styling across all 77+ admin tables
        select.classList.add('per-page-select');
        select.setAttribute('data-no-select2', 'true');
        select.style.setProperty('width', '110px', 'important');
        select.style.setProperty('max-width', '120px', 'important');
        select.style.setProperty('min-height', '38px', 'important');
        select.style.setProperty('height', '38px', 'important');
        return false;
    }

    // 3. EXCLUDE Campus Switcher in topbar
    if (select.id === 'campus-switcher' || select.getAttribute('aria-label') === 'Working campus') {
        return false;
    }

    // 4. Standard opt-outs and state checks
    if (select.dataset.select2Active === 'true') return false;
    if (select.hasAttribute('multiple')) return false;
    if (select.classList.contains('no-select2')) return false;
    if (select.hasAttribute('data-no-select2')) return false;
    if (select.closest('.select2-root')) return false;

    // 5. Must have at least 1 selectable option
    if (select.options.length <= 1 && select.options[0]?.value === '') return false;

    return true;
}

function enhanceSelect(select) {
    if (!shouldEnhance(select)) return;

    select.dataset.select2Active = 'true';
    select.classList.add('select2-hidden-accessible');

    // Create Select2 wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'select2-root select2-auto-enhanced';

    // Inherit responsive width and layout classes from native select
    let hasExplicitWidth = false;
    Array.from(select.classList).forEach((cls) => {
        if (
            cls.startsWith('w-') ||
            cls.includes(':w-') ||
            cls.startsWith('max-w-') ||
            cls.includes(':max-w-') ||
            cls.startsWith('min-w-') ||
            cls.includes(':min-w-')
        ) {
            wrapper.classList.add(cls);
            hasExplicitWidth = true;
        }
        if (['mt-1', 'mt-2', 'mb-1', 'mb-2', 'mb-4', 'flex-1', 'shrink-0'].includes(cls)) {
            wrapper.classList.add(cls);
        }
    });

    if (!hasExplicitWidth) {
        wrapper.style.width = select.style.width || '100%';
    }

    // Create Select2 control box
    const control = document.createElement('div');
    control.className = 'select2-control';
    control.setAttribute('role', 'combobox');
    control.setAttribute('aria-expanded', 'false');
    control.setAttribute('tabindex', select.disabled ? '-1' : '0');

    // Value container
    const valueContainer = document.createElement('div');
    valueContainer.className = 'select2-value-container';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'select2-placeholder truncate';
    labelSpan.textContent = 'Select an option...';
    valueContainer.appendChild(labelSpan);

    // Actions (Clear + Divider + Arrow)
    const actions = document.createElement('div');
    actions.className = 'select2-actions';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'select2-clear-button';
    clearBtn.style.display = 'none';
    clearBtn.title = 'Clear selection';
    clearBtn.innerHTML = '&times;';

    const divider = document.createElement('div');
    divider.className = 'select2-arrow-divider';

    const arrowIcon = document.createElement('div');
    arrowIcon.className = 'select2-arrow-icon';
    arrowIcon.innerHTML = `
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
        </svg>
    `;

    actions.appendChild(clearBtn);
    actions.appendChild(divider);
    actions.appendChild(arrowIcon);

    control.appendChild(valueContainer);
    control.appendChild(actions);
    wrapper.appendChild(control);

    // Insert wrapper directly after native select
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    // Sync label and state from native select
    function syncState() {
        const selectedOption = select.options[select.selectedIndex];
        const val = select.value;
        const hasVal = val !== '' && val !== null && val !== undefined;
        const isPlaceholder = !hasVal || (selectedOption && selectedOption.disabled);

        if (selectedOption) {
            labelSpan.textContent = selectedOption.textContent.trim();
            if (isPlaceholder) {
                labelSpan.className = 'select2-placeholder truncate';
            } else {
                labelSpan.className = 'truncate text-slate-800 font-medium';
            }
        } else {
            labelSpan.textContent = 'Select an option...';
            labelSpan.className = 'select2-placeholder truncate';
        }

        if (select.disabled) {
            wrapper.classList.add('select2-disabled');
            control.setAttribute('aria-disabled', 'true');
            control.setAttribute('tabindex', '-1');
        } else {
            wrapper.classList.remove('select2-disabled');
            control.setAttribute('aria-disabled', 'false');
            control.setAttribute('tabindex', '0');
        }

        if (hasVal && !select.disabled && !isPlaceholder) {
            clearBtn.style.display = 'inline-flex';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    syncState();

    // Clear button action
    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (select.disabled) return;
        setNativeSelectValue(select, '');
        syncState();
    });

    // Open/Close Dropdown
    function openDropdown() {
        if (select.disabled) return;
        closeActiveDropdown();

        wrapper.classList.add('select2-open');
        control.setAttribute('aria-expanded', 'true');

        const dropdown = document.createElement('div');
        dropdown.className = 'select2-dropdown';

        // Search Box
        const searchBox = document.createElement('div');
        searchBox.className = 'select2-search-box';
        searchBox.innerHTML = `
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" class="select2-search-input" placeholder="Search..." autocomplete="off" />
        `;
        const searchInput = searchBox.querySelector('input');
        dropdown.appendChild(searchBox);

        // Options List
        const optionsList = document.createElement('div');
        optionsList.className = 'select2-options-list';
        dropdown.appendChild(optionsList);

        let highlightedIdx = 0;

        function renderOptions(query = '') {
            optionsList.innerHTML = '';
            const q = query.toLowerCase().trim();
            const matchingOpts = [];

            Array.from(select.options).forEach((opt) => {
                const text = opt.textContent.trim();
                if (q && !text.toLowerCase().includes(q)) return;
                matchingOpts.push(opt);
            });

            if (matchingOpts.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'select2-empty-message';
                empty.textContent = 'No matching results found';
                optionsList.appendChild(empty);
                return;
            }

            matchingOpts.forEach((opt, idx) => {
                const isSelected = opt.selected || opt.value === select.value;
                const isHighlighted = idx === highlightedIdx;

                const item = document.createElement('div');
                item.className = `select2-option ${isSelected ? 'select2-option-selected' : ''} ${isHighlighted ? 'select2-option-highlighted' : ''}`;
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', isSelected ? 'true' : 'false');

                item.innerHTML = `
                    <span class="truncate ${opt.disabled ? 'text-slate-400 italic' : ''}">${opt.textContent.trim()}</span>
                    ${isSelected ? `
                        <svg class="w-4 h-4 text-indigo-600 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ` : ''}
                `;

                if (!opt.disabled) {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        setNativeSelectValue(select, opt.value);
                        syncState();
                        closeActiveDropdown();
                        control.focus();
                    });
                    item.addEventListener('mouseenter', () => {
                        highlightedIdx = idx;
                        updateHighlight();
                    });
                } else {
                    item.style.cursor = 'default';
                    item.style.opacity = '0.6';
                }

                optionsList.appendChild(item);
            });
        }

        function updateHighlight() {
            const items = optionsList.querySelectorAll('.select2-option');
            items.forEach((item, i) => {
                if (i === highlightedIdx) {
                    item.classList.add('select2-option-highlighted');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('select2-option-highlighted');
                }
            });
        }

        renderOptions('');

        searchInput.addEventListener('input', (e) => {
            highlightedIdx = 0;
            renderOptions(e.target.value);
        });

        // Keyboard handling in search input
        searchInput.addEventListener('keydown', (e) => {
            const items = optionsList.querySelectorAll('.select2-option:not([style*="cursor: default"])');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length > 0) {
                    highlightedIdx = (highlightedIdx + 1) % items.length;
                    updateHighlight();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length > 0) {
                    highlightedIdx = (highlightedIdx - 1 + items.length) % items.length;
                    updateHighlight();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (items[highlightedIdx]) {
                    items[highlightedIdx].click();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeActiveDropdown();
                control.focus();
            }
        });

        // Positioning (fixed to avoid modal overflow clipping)
        const rect = control.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.width = `${Math.max(rect.width, 180)}px`;
        dropdown.style.zIndex = '999999';

        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 250 && rect.top > 250) {
            dropdown.style.bottom = `${window.innerHeight - rect.top + 4}px`;
            dropdown.style.top = 'auto';
        } else {
            dropdown.style.top = `${rect.bottom + 4}px`;
            dropdown.style.bottom = 'auto';
        }

        document.body.appendChild(dropdown);
        setTimeout(() => searchInput.focus(), 30);

        currentOpenDropdown = {
            wrapper,
            dropdown,
            control,
            select,
            close: () => {
                wrapper.classList.remove('select2-open');
                control.setAttribute('aria-expanded', 'false');
                dropdown.remove();
                currentOpenDropdown = null;
            },
        };
    }

    control.addEventListener('click', () => {
        if (select.disabled) return;
        if (wrapper.classList.contains('select2-open')) {
            closeActiveDropdown();
        } else {
            openDropdown();
        }
    });

    control.addEventListener('keydown', (e) => {
        if (select.disabled) return;
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            openDropdown();
        }
    });

    // Native observer to keep React state & options in sync
    const nativeObserver = new MutationObserver(() => {
        if (!select.isConnected) {
            wrapper.remove();
            nativeObserver.disconnect();
            if (currentOpenDropdown?.select === select) {
                closeActiveDropdown();
            }
            return;
        }
        syncState();
    });

    nativeObserver.observe(select, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'value', 'class'],
    });

    select.addEventListener('change', syncState);
}

export function enhanceAllSelects(root = document) {
    if (!root || !root.querySelectorAll) return;
    const selects = root.querySelectorAll('select');
    selects.forEach((select) => {
        enhanceSelect(select);
    });
}

// Global click-outside & window handlers (run once)
if (typeof window !== 'undefined') {
    document.addEventListener('mousedown', (event) => {
        if (!currentOpenDropdown) return;
        const { wrapper, dropdown } = currentOpenDropdown;
        if (!wrapper.contains(event.target) && !dropdown.contains(event.target)) {
            closeActiveDropdown();
        }
    });

    window.addEventListener('scroll', () => {
        // Close on window scroll to prevent disconnected dropdown
        if (currentOpenDropdown) {
            closeActiveDropdown();
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (currentOpenDropdown) {
            closeActiveDropdown();
        }
    }, { passive: true });
}

export default function Select2GlobalEnhancer() {
    useEffect(() => {
        enhanceAllSelects(document.body);

        const observer = new MutationObserver(() => {
            enhanceAllSelects(document.body);
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            closeActiveDropdown();
        };
    }, []);

    return null;
}

