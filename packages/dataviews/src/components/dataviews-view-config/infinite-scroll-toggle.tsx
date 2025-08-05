/**
 * WordPress dependencies
 */
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
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
		<ToggleGroupControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			isBlock
			label={ __( 'Infinite scroll' ) }
			value={ infiniteScrollEnabled ? 'enabled' : 'disabled' }
			onChange={ ( value ) => {
				const newValue = value === 'enabled';
				onChangeView( {
					...view,
					layout: {
						...view.layout,
						infiniteScroll: newValue,
					},
				} );
			} }
		>
			<ToggleGroupControlOption
				key="disabled"
				value="disabled"
				label={ __( 'Off' ) }
			/>
			<ToggleGroupControlOption
				key="enabled"
				value="enabled"
				label={ __( 'On' ) }
			/>
		</ToggleGroupControl>
	);
}
