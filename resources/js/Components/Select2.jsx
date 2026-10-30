import React, { useState, useRef, useEffect, useId } from 'react';

/**
 * Modern Select2 Component for React / Inertia.js
 * 
 * Features:
 * - Real-time searchable filtering inside dropdown
 * - Authentic Select2 UI styling with divider and chevron
 * - Single and Multi-select badge support
 * - Clear button (one-click unselect)
 * - Keyboard navigation (Arrows, Enter, Escape)
 * - Click-outside dismiss
 * - Full form integration (name, required, disabled)
 */
export default function Select2({
    value = '',
    onChange,
    options = [],
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    isMulti = false,
    isClearable = true,
    searchable = true,
    disabled = false,
    required = false,
    name,
    id,
    className = '',
    valueKey = 'value',
    labelKey = 'label',
    error = null,
}) {
    const generatedId = useId();
    const selectId = id || generatedId;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionsListRef = useRef(null);

    // Normalize options into { value, label, original }
    const normalizedOptions = React.useMemo(() => {
        return (options || []).map((opt) => {
            if (typeof opt === 'string' || typeof opt === 'number') {
                return { value: String(opt), label: String(opt), original: opt };
            }
            const val = opt[valueKey] !== undefined ? opt[valueKey] : opt.id !== undefined ? opt.id : opt.value;
            const lbl = opt[labelKey] !== undefined ? opt[labelKey] : opt.name !== undefined ? opt.name : opt.label;
            return {
                value: String(val ?? ''),
                label: String(lbl ?? ''),
                original: opt,
            };
        });
    }, [options, valueKey, labelKey]);

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return normalizedOptions;
        const q = searchQuery.toLowerCase().trim();
        return normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(q)
        );
    }, [normalizedOptions, searchQuery]);

    // Selected items
    const selectedValues = React.useMemo(() => {
        if (isMulti) {
            if (Array.isArray(value)) return value.map(String);
            if (value === null || value === undefined || value === '') return [];
            return [String(value)];
        }
        return value !== null && value !== undefined && value !== '' ? [String(value)] : [];
    }, [value, isMulti]);

    const selectedOptions = React.useMemo(() => {
        return normalizedOptions.filter((opt) => selectedValues.includes(opt.value));
    }, [normalizedOptions, selectedValues]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Auto-focus search input on open
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        setHighlightedIndex(0);
    }, [isOpen, searchable]);

    // Scroll highlighted option into view
    useEffect(() => {
        if (isOpen && optionsListRef.current) {
            const listEl = optionsListRef.current;
            const itemEl = listEl.children[highlightedIndex];
            if (itemEl) {
                const itemTop = itemEl.offsetTop;
                const itemBottom = itemTop + itemEl.offsetHeight;
                const listTop = listEl.scrollTop;
                const listBottom = listTop + listEl.offsetHeight;

                if (itemTop < listTop) {
                    listEl.scrollTop = itemTop;
                } else if (itemBottom > listBottom) {
                    listEl.scrollTop = itemBottom - listEl.offsetHeight;
                }
            }
        }
    }, [highlightedIndex, isOpen]);

    const emitChange = (newVal) => {
        if (onChange) {
            // Emulate standard event-like signature or raw value
            const fakeEvent = {
                target: { name: name || selectId, value: newVal },
                preventDefault: () => {},
                stopPropagation: () => {},
            };
            onChange(fakeEvent, newVal);
        }
    };

    const handleSelectOption = (option) => {
        if (isMulti) {
            const exists = selectedValues.includes(option.value);
            let nextValues;
            if (exists) {
                nextValues = selectedValues.filter((v) => v !== option.value);
            } else {
                nextValues = [...selectedValues, option.value];
            }
            emitChange(nextValues);
        } else {
            emitChange(option.value);
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    const handleRemoveTag = (e, valToRemove) => {
        e.stopPropagation();
        if (disabled) return;
        const nextValues = selectedValues.filter((v) => v !== valToRemove);
        emitChange(nextValues);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (disabled) return;
        emitChange(isMulti ? [] : '');
        setSearchQuery('');
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        if (!isOpen) {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
                handleSelectOption(filteredOptions[highlightedIndex]);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <div
            ref={containerRef}
            className={`select2-root ${isOpen ? 'select2-open' : ''} ${disabled ? 'select2-disabled' : ''} ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* Hidden native input for standard form submission if needed */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={isMulti ? JSON.stringify(selectedValues) : (selectedValues[0] ?? '')}
                    required={required && selectedValues.length === 0}
                />
            )}

            {/* Select2 Main Control Box */}
            <div
                id={selectId}
                tabIndex={disabled ? -1 : 0}
                className="select2-control"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-disabled={disabled}
            >
                <div className="select2-value-container">
                    {selectedOptions.length === 0 ? (
                        <span className="select2-placeholder">{placeholder}</span>
                    ) : isMulti ? (
                        selectedOptions.map((opt) => (
                            <span key={opt.value} className="select2-tag">
                                {opt.label}
                                <span
                                    className="select2-tag-remove"
                                    onClick={(e) => handleRemoveTag(e, opt.value)}
                                    title="Remove"
                                >
                                    &times;
                                </span>
                            </span>
                        ))
                    ) : (
                        <span className="truncate">{selectedOptions[0].label}</span>
                    )}
                </div>

                {/* Right side Select2 actions & arrow divider */}
                <div className="select2-actions">
                    {isClearable && selectedOptions.length > 0 && !disabled && (
                        <button
                            type="button"
                            className="select2-clear-button"
                            onClick={handleClear}
                            title="Clear"
                        >
                            &times;
                        </button>
                    )}

                    {/* Signature Select2 vertical divider */}
                    <div className="select2-arrow-divider" />

                    {/* Signature Select2 chevron arrow */}
                    <div className="select2-arrow-icon">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Select2 Popover Dropdown */}
            {isOpen && (
                <div className="select2-dropdown" role="listbox">
                    {searchable && (
                        <div className="select2-search-box">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="select2-search-input"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div ref={optionsListRef} className="select2-options-list">
                        {filteredOptions.length === 0 ? (
                            <div className="select2-empty-message">No matching results found</div>
                        ) : (
                            filteredOptions.map((opt, index) => {
                                const isSelected = selectedValues.includes(opt.value);
                                const isHighlighted = index === highlightedIndex;

                                return (
                                    <div
                                        key={opt.value}
                                        className={`select2-option ${isSelected ? 'select2-option-selected' : ''} ${isHighlighted ? 'select2-option-highlighted' : ''}`}
                                        onClick={() => handleSelectOption(opt)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
}

