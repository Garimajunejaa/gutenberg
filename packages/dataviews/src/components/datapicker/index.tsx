/**
 * WordPress dependencies
 */
import { useCallback, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import type { DataViewsProps } from '../dataviews';
import DataViews, { defaultGetItemId } from '../dataviews';

const isItemClickable = () => true;

type DataPickerProps< Item > = {
	multiple?: boolean;
	onFinish: ( items: Item[] | Item ) => void;
	selection: string[];
	onChangeSelection: ( items: string[] ) => void;
} & DataViewsProps< Item >;

export default function DataPicker< Item >( {
	multiple = false,
	onFinish,

	// selection/onChangeSelection are made mandatory for DataPicker.
	selection,
	onChangeSelection,

	// getItemId is used by DataPicker, but still optional, we need to provide its default implementation.
	getItemId = defaultGetItemId,

	// Props that are not used by DataPicker, so they are omitted from being passed to DataViews.
	actions: _actions,
	isItemClickable: _isItemClickable,
	onClickItem: _onClickItem,
	...dataViewProps
}: DataPickerProps< Item > ) {
	const actions = useMemo(
		() =>
			multiple
				? [
						{
							id: 'select',
							label: __( 'Select' ),
							isPrimary: true,
							icon: plus,
							isEligible() {
								return Boolean( multiple );
							},
							callback( items: Item[] ) {
								onFinish( items );
							},
							supportsBulk: Boolean( multiple ),
						},
				  ]
				: [],
		[ multiple, onFinish ]
	);

	const onClickItem = useCallback(
		( item: Item ) => {
			if ( multiple ) {
				onChangeSelection( [ ...selection, getItemId( item ) ] );
			} else {
				onFinish( item );
			}
		},
		[ multiple, onChangeSelection, selection, getItemId, onFinish ]
	);

	return (
		// TODO: Fix the type error here.
		// @ts-expect-error - DataViewsProps is not assignable to DataPickerProps
		<DataViews
			{ ...dataViewProps }
			actions={ actions }
			isItemClickable={ isItemClickable }
			onClickItem={ onClickItem }
			getItemId={ getItemId }
			selection={ selection }
			onChangeSelection={ onChangeSelection }
		/>
	);
}
