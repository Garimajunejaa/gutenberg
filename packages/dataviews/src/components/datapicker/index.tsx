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
} & Omit<
	DataViewsProps< Item >,
	'actions' | 'selection' | 'onChangeSelection'
>;

export default function DataPicker< Item >( {
	multiple = false,
	onFinish,
	...dataViewProps
}: DataPickerProps< Item > ) {
	const {
		selection,
		onChangeSelection,
		getItemId = defaultGetItemId,
	} = dataViewProps;

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
		<DataViews
			{ ...dataViewProps }
			actions={ actions }
			isItemClickable={ isItemClickable }
			onClickItem={ onClickItem }
		/>
	);
}
