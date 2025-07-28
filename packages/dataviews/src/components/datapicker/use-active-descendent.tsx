/**
 * WordPress dependencies
 */
import { useRefEffect } from '@wordpress/compose';
import { useState } from '@wordpress/element';

export default function useActiveDescendent( {
	itemCount,
	orientation,
}: {
	itemCount: number;
	orientation: 'horizontal' | 'vertical';
} ) {
	const [ activeIndex, setActiveIndex ] = useState< number >( 0 );
	const [ hasFocus, setHasFocus ] = useState< boolean >( false );

	const ref = useRefEffect(
		( element ) => {
			if ( ! element ) {
				return;
			}

			const onFocus = () => {
				setHasFocus( true );
			};

			const onBlur = () => {
				setHasFocus( false );
			};

			const onKeyDown = ( event: KeyboardEvent ) => {
				if (
					( orientation === 'vertical' && event.key === 'ArrowUp' ) ||
					( orientation === 'horizontal' &&
						event.key === 'ArrowLeft' )
				) {
					const candidateIndex = activeIndex - 1;
					if ( candidateIndex >= 0 ) {
						setActiveIndex( candidateIndex );
					}
				} else if (
					( orientation === 'vertical' &&
						event.key === 'ArrowDown' ) ||
					( orientation === 'horizontal' &&
						event.key === 'ArrowRight' )
				) {
					const candidateIndex = activeIndex + 1;
					if ( candidateIndex <= itemCount - 1 ) {
						setActiveIndex( candidateIndex );
					}
				}
			};

			element.addEventListener( 'keydown', onKeyDown as EventListener );
			element.addEventListener( 'focus', onFocus as EventListener );
			element.addEventListener( 'blur', onBlur as EventListener );

			return () => {
				element.removeEventListener(
					'keydown',
					onKeyDown as EventListener
				);
				element.removeEventListener(
					'focus',
					onFocus as EventListener
				);
				element.removeEventListener( 'blur', onBlur as EventListener );
			};
		},
		[ activeIndex, itemCount, orientation ]
	);

	return {
		ref,
		activeIndex: hasFocus ? activeIndex : undefined,
	};
}
