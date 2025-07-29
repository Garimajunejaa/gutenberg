/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	Composite,
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	CheckboxControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type {
	NormalizedField,
	ViewPickerGrid,
	ViewBaseProps,
} from '../../types';
import type { SetSelection } from '../../private-types';
import { useUpdatedPreviewSizeOnViewportChange } from '../../dataviews-layouts/grid/preview-size-picker';

type DataPickerGridLayoutProps< Item > = {
	multiple: boolean;
	data: ViewBaseProps< Item >[ 'data' ];
	fields: ViewBaseProps< Item >[ 'fields' ];
	getItemId: ViewBaseProps< Item >[ 'getItemId' ];
	isLoading?: boolean;
	onChangeView: ViewBaseProps< Item >[ 'onChangeView' ];
	view: ViewPickerGrid;
	selection: string[];
	onChangeSelection: SetSelection;
	setSize: number;
	startPosition: number;
};

export default function DataPickerGridLayout< Item >( {
	multiple,
	data,
	fields,
	getItemId,
	isLoading,
	view,
	selection,
	onChangeSelection,
	setSize,
	startPosition,
}: DataPickerGridLayoutProps< Item > ) {
	const hasData = !! data?.length;

	const titleField = fields.find(
		( field ) => field.id === view?.titleField
	);
	const mediaField = fields.find(
		( field ) => field.id === view?.mediaField
	);
	const descriptionField = fields.find(
		( field ) => field.id === view?.descriptionField
	);

	const updatedPreviewSize = useUpdatedPreviewSizeOnViewportChange();
	const usedPreviewSize = updatedPreviewSize || view.layout?.previewSize;
	const gridStyle = usedPreviewSize
		? {
				gridTemplateColumns: `repeat(${ usedPreviewSize }, minmax(0, 1fr))`,
		  }
		: {};

	return (
		hasData && (
			<Composite
				virtualFocus
				focusable
				orientation="horizontal"
				render={ ( props ) => (
					<Grid
						{ ...props }
						as="ul"
						className="dataviews-picker-grid"
						role="listbox"
						aria-multiselectable={ multiple }
						tabIndex={ 0 }
						gap={ 8 }
						columns={ 2 }
						alignment="top"
						aria-busy={ isLoading }
						style={ gridStyle }
						children={ props.children }
					/>
				) }
			>
				{ data.map( ( item, index ) => {
					const position = startPosition + index;
					const itemId = getItemId( item );
					const className = clsx( 'dataviews-picker-grid__card', {
						'is-selected': selection.includes( itemId ),
					} );
					return (
						<GridItem
							key={ itemId }
							className={ className }
							multiple={ multiple }
							view={ view }
							selection={ selection }
							onChangeSelection={ onChangeSelection }
							getItemId={ getItemId }
							item={ item }
							titleField={ titleField }
							mediaField={ mediaField }
							descriptionField={ descriptionField }
							setSize={ setSize }
							position={ position }
						/>
					);
				} ) }
			</Composite>
		)
	);
}

type GridItemProps< Item > = {
	className: string;
	multiple: boolean;
	item: Item;
	view: ViewPickerGrid;
	selection: string[];
	onChangeSelection: SetSelection;
	getItemId: ( item: Item ) => string;
	titleField: NormalizedField< Item > | undefined;
	mediaField: NormalizedField< Item > | undefined;
	descriptionField: NormalizedField< Item > | undefined;
	setSize: number;
	position: number;
};

function GridItem< Item >( {
	className,
	multiple,
	item,
	view,
	selection,
	onChangeSelection,
	getItemId,
	titleField,
	mediaField,
	descriptionField,
	setSize,
	position,
}: GridItemProps< Item > ) {
	const { showTitle = true, showMedia = true, showDescription = true } = view;
	const renderedMediaField =
		showMedia && mediaField?.render ? (
			<mediaField.render item={ item } field={ mediaField } />
		) : null;
	const renderedTitleField =
		showTitle && titleField?.render ? (
			<titleField.render item={ item } field={ titleField } />
		) : null;
	const renderedDescriptionField =
		showDescription && descriptionField?.render ? (
			<descriptionField.render item={ item } field={ descriptionField } />
		) : null;

	const itemId = getItemId( item );
	const isSelected = selection.includes( getItemId( item ) );

	const descriptionId = `dataviews-picker-grid-item-${ itemId }-description`;

	return (
		<Composite.Item
			render={ ( props ) => (
				<VStack
					{ ...props }
					children={ props.children }
					as="li"
					spacing={ 0 }
					className={ className }
					role="option"
					aria-posinset={ position }
					aria-setsize={ setSize }
					aria-selected={ multiple ? undefined : isSelected }
					aria-checked={ multiple ? isSelected : undefined }
					aria-describedby={ descriptionId }
					onClick={ () => {
						onChangeSelection(
							isSelected
								? selection.filter(
										( selectionId ) =>
											itemId !== selectionId
								  )
								: [ ...selection, itemId ]
						);
					} }
				/>
			) }
		>
			<div className="dataviews-picker-grid__media">
				{ renderedMediaField }
			</div>
			<CheckboxControl
				// This is a decorative checkbox, so it's hidden from screen readers.
				aria-hidden
				tabIndex={ -1 }
				__nextHasNoMarginBottom
				className="dataviews-picker-grid__selection-checkbox"
				checked={ isSelected }
				onChange={ () => {} }
			/>
			<div className="dataviews-picker-grid__title-field">
				{ renderedTitleField }
			</div>
			<div
				id={ descriptionId }
				className="dataviews-picker-grid__description-field"
				aria-hidden
			>
				{ renderedDescriptionField }
			</div>
		</Composite.Item>
	);
}
