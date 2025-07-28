/**
 * External dependencies
 */
import type { Meta } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataPicker from '../index';
import { DEFAULT_VIEW } from './fixtures';
import { data, fields } from '../../dataviews/stories/fixtures';
import type { View } from '../../../types';
import { filterSortAndPaginate } from '../../..';

const meta = {
	title: 'DataViews/DataPicker',
	component: DataPicker,
} as Meta< typeof DataPicker >;

export default meta;

export const Default = () => {
	const [ view, setView ] = useState< View >( {
		...DEFAULT_VIEW,
		fields: [ 'categories' ],
		titleField: 'title',
		descriptionField: 'description',
		mediaField: 'image',
	} );

	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, fields );
	}, [ view ] );

	return (
		<DataPicker
			view={ view }
			onChangeView={ setView }
			data={ shownData }
			fields={ fields }
			paginationInfo={ paginationInfo }
			getItemId={ ( item ) => item.id.toString() }
			defaultLayouts={ {} }
			onFinish={ ( ids ) => {
				const selectedItems = data
					.filter( ( item ) => ids.includes( item.id.toString() ) )
					.map( ( item ) => item.title )
					.join( ', ' );
				// eslint-disable-next-line no-alert
				alert( selectedItems );
			} }
		/>
	);
};
