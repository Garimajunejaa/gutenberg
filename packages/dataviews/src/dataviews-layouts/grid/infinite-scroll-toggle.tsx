/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../../components/dataviews-context';
import type { ViewGrid } from '../../types';

export default function InfiniteScrollToggle() {
	const context = useContext( DataViewsContext );
	const view = context.view as ViewGrid;
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
				context.onChangeView( {
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
