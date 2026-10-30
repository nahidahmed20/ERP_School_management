import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Standard Form SelectInput styled with Select2 Design System
 */
export default forwardRef(function SelectInput(
    { className = '', isFocused = false, children, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            className={`select2-native ${className}`}
            ref={localRef}
        >
            {children}
        </select>
    );
});

