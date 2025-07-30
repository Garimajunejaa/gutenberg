/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../dataviews-context';

export default function InfiniteScrollToggle() {
	const context = useContext( DataViewsContext );
	const { view, onChangeView } = context;
	const infiniteScrollEnabled = view.layout?.infiniteScroll ?? false;

	// Only render the toggle if an infinite scroll handler is available
	if ( ! context.hasInfiniteScrollHandler ) {
		return null;
	}

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ __( 'Infinite scroll' ) }
			checked={ infiniteScrollEnabled }
			onChange={ ( value ) => {
				onChangeView( {
					...view,
					layout: {
						...view.layout,
						infiniteScroll: value,
					},
				} );
			} }
		/>
	);
}
