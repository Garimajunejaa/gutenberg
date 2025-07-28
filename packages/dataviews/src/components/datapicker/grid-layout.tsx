/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { NormalizedField, View, ViewBaseProps } from '../../types';
import type { SetSelection } from '../../private-types';
import useActiveDescendent from './use-active-descendent';
import { useCallback } from '@wordpress/element';

type DataPickerGridLayoutProps< Item > = {
	multiple: boolean;
	data: ViewBaseProps< Item >[ 'data' ];
	fields: ViewBaseProps< Item >[ 'fields' ];
	getItemId: ViewBaseProps< Item >[ 'getItemId' ];
	isLoading?: boolean;
	onChangeView: ViewBaseProps< Item >[ 'onChangeView' ];
	view: View;
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
	const createId = useCallback(
		( item: Item ) => {
			return `dataviews-picker-grid-item-${ getItemId( item ) }`;
		},
		[ getItemId ]
	);
	const { ref: listBoxRef, activeIndex } = useActiveDescendent( {
		data,
		orientation: 'horizontal',
	} );
	const activeDescendent =
		activeIndex !== undefined ? createId( data[ activeIndex ] ) : undefined;

	const titleField = fields.find(
		( field ) => field.id === view?.titleField
	);
	const mediaField = fields.find(
		( field ) => field.id === view?.mediaField
	);
	const descriptionField = fields.find(
		( field ) => field.id === view?.descriptionField
	);

	return (
		hasData && (
			<Grid
				ref={ listBoxRef }
				as="ul"
				role="listbox"
				aria-multiselectable={ multiple }
				aria-orientation="horizontal"
				aria-activedescendant={ activeDescendent }
				tabIndex={ 0 }
				gap={ 8 }
				columns={ 2 }
				alignment="top"
				aria-busy={ isLoading }
			>
				{ data.map( ( item, index ) => {
					const position = startPosition + index;
					const itemId = getItemId( item );
					const htmlId = createId( item );
					const className = clsx( 'dataviews-picker-grid__card', {
						'is-active': activeIndex === index,
						'is-selected': selection.includes( itemId ),
					} );
					return (
						<GridItem
							key={ itemId }
							id={ htmlId }
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
			</Grid>
		)
	);
}

type GridItemProps< Item > = {
	id: string;
	className: string;
	multiple: boolean;
	item: Item;
	view: View;
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
	id,
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
		<VStack
			as="li"
			role="option"
			id={ id }
			aria-selected={ multiple ? undefined : isSelected }
			aria-checked={ multiple ? isSelected : undefined }
			aria-posinset={ position }
			aria-setsize={ setSize }
			aria-describedby={ descriptionId }
			className={ className }
			onClick={ () => {
				onChangeSelection(
					isSelected
						? selection.filter(
								( selectionId ) => itemId !== selectionId
						  )
						: [ ...selection, itemId ]
				);
			} }
			spacing={ 0 }
		>
			<div className="dataviews-picker-grid__media">
				{ renderedMediaField }
			</div>
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
		</VStack>
	);
}
