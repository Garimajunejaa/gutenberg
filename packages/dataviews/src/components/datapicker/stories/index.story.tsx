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
			selection={ [] }
			onChangeSelection={ () => {} }
			getItemId={ ( item ) => item.id.toString() }
			defaultLayouts={ {} }
			onFinish={ () => {} }
		/>
	);
};
