/**
 * WordPress dependencies
 */
import { useRefEffect } from '@wordpress/compose';
import { useRef } from '@wordpress/element';

export default function useActiveDescendent< Item >( {
	data,
	createId,
	orientation,
}: {
	data: Item[];
	createId: ( item: Item ) => string;
	orientation: 'horizontal' | 'vertical';
} ) {
	const activeIndexRef = useRef< number >( 0 );

	const ref = useRefEffect( ( element ) => {
		if ( ! element ) {
			return;
		}

		const onFocus = () => {
			// Set the initial active descendent.
			( element as HTMLElement ).setAttribute(
				'aria-activedescendant',
				createId( data[ activeIndexRef.current ] )
			);
		};

		const onBlur = () => {
			( element as HTMLElement ).removeAttribute(
				'aria-activedescendant'
			);
		};

		const onKeyDown = ( event: KeyboardEvent ) => {
			let activeId = ( element as HTMLElement ).getAttribute(
				'aria-activedescendant'
			);

			let newActiveIndex: number | undefined;

			if (
				( orientation === 'vertical' && event.key === 'ArrowUp' ) ||
				( orientation === 'horizontal' && event.key === 'ArrowLeft' )
			) {
				const candidateIndex = activeIndexRef.current - 1;
				if ( candidateIndex >= 0 ) {
					newActiveIndex = candidateIndex;
				}
			} else if (
				( orientation === 'vertical' && event.key === 'ArrowDown' ) ||
				( orientation === 'horizontal' && event.key === 'ArrowRight' )
			) {
				const candidateIndex = activeIndexRef.current + 1;
				if ( candidateIndex <= data.length - 1 ) {
					newActiveIndex = candidateIndex;
				}
			}

			if ( newActiveIndex !== undefined ) {
				activeIndexRef.current = newActiveIndex;
				activeId = createId( data[ newActiveIndex ] );
				( element as HTMLElement ).setAttribute(
					'aria-activedescendant',
					activeId
				);
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
			element.removeEventListener( 'focus', onFocus as EventListener );
			element.removeEventListener( 'blur', onBlur as EventListener );
		};
	}, [] );

	return ref;
}
