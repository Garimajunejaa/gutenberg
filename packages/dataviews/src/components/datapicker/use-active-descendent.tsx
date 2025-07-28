/**
 * WordPress dependencies
 */
import { useRefEffect } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';

export default function useActiveDescendent< Item >( {
	data,
	orientation,
}: {
	data: Item[];
	orientation: 'horizontal' | 'vertical';
} ) {
	const [ activeIndex, setActiveIndex ] = useState< number >( 0 );
	const [ hasFocus, setHasFocus ] = useState< boolean >( false );

	useEffect( () => {
		// Set the active index back to 0 if the data changes.
		// This is most likely due to pagination.
		setActiveIndex( 0 );
	}, [ data ] );

	const itemCount = data.length;

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
						// Prevent VoiceOver from moving focus outside the focused list.
						event.preventDefault();
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
						// Prevent VoiceOver from moving focus outside the focused list.
						event.preventDefault();
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
