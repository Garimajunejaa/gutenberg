/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useContext, useRef, useState, useMemo } from '@wordpress/element';
import { useMergeRefs, useResizeObserver } from '@wordpress/compose';
import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFilters } from '../dataviews-filters';
import { normalizeFields } from '../../normalize-fields';
import type {
	Field,
	NormalizedField,
	SupportedLayouts,
	View,
	ViewBaseProps,
} from '../../types';
import type { SetSelection, SelectionOrUpdater } from '../../private-types';
import DataViewsContext from '../dataviews-context';
import DataViews from '../dataviews';

type DataPickerProps< Item > = {
	multiple?: boolean;
	onFinish: ( items: Item[] | Item ) => void;

	// DataViewsContext props
	view: View;
	onChangeView: ( view: View ) => void;
	data: Item[];
	fields: Field< Item >[];
	paginationInfo: {
		totalItems: number;
		totalPages: number;
	};
	selection: string[];
	onChangeSelection: SetSelection;
	getItemId: ( item: Item ) => string;
	defaultLayouts: SupportedLayouts;
};

const isItemClickable = () => true;

export default function DataPicker< Item >( {
	// multiple = false,
	// onFinish,
	view,
	onChangeView,
	data,
	fields,
	paginationInfo,
	selection: selectionProperty,
	onChangeSelection,
	getItemId,
	defaultLayouts,
}: DataPickerProps< Item > ) {
	const containerRef = useRef< HTMLDivElement | null >( null );
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const resizeObserverRef = useResizeObserver(
		( resizeObserverEntries: any ) => {
			setContainerWidth(
				resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize
			);
		},
		{ box: 'border-box' }
	);
	const [ selectionState, setSelectionState ] = useState< string[] >( [] );
	const isUncontrolled =
		selectionProperty === undefined || onChangeSelection === undefined;
	const _selection = isUncontrolled ? selectionState : selectionProperty;
	const [ openedFilter, setOpenedFilter ] = useState< string | null >( null );
	function setSelectionWithChange( value: SelectionOrUpdater ) {
		const newValue =
			typeof value === 'function' ? value( selection ) : value;
		if ( isUncontrolled ) {
			setSelectionState( newValue );
		}
		if ( onChangeSelection ) {
			onChangeSelection( newValue );
		}
	}
	const _fields = useMemo( () => normalizeFields( fields ), [ fields ] );
	const selection = useMemo( () => {
		return _selection.filter( ( id ) =>
			data.some( ( item ) => getItemId( item ) === id )
		);
	}, [ _selection, data, getItemId ] );

	const filters = useFilters( _fields, view );
	const [ isShowingFilter, setIsShowingFilter ] = useState< boolean >( () =>
		( filters || [] ).some( ( filter ) => filter.isPrimary )
	);

	return (
		<DataViewsContext.Provider
			value={ {
				view,
				onChangeView,
				fields: _fields,
				data,
				paginationInfo,
				selection,
				onChangeSelection: setSelectionWithChange,
				getItemId,
				defaultLayouts,
				isItemClickable,

				// props to provide
				filters,
				openedFilter,
				setOpenedFilter,
				containerWidth,
				containerRef: { current: null },
				isShowingFilter,
				setIsShowingFilter,
			} }
		>
			<div
				className="dataviews-wrapper"
				ref={ useMergeRefs( [ containerRef, resizeObserverRef ] ) }
			>
				<HStack
					alignment="top"
					justify="space-between"
					className="dataviews__view-actions"
					spacing={ 1 }
				>
					<HStack
						justify="start"
						expanded={ false }
						className="dataviews__search"
					>
						<DataViews.Search />
						<DataViews.FiltersToggle />
					</HStack>
				</HStack>
				{ isShowingFilter && (
					<DataViews.Filters className="dataviews-filters__container" />
				) }
				<DataPickerLayout />
				<DataPickerFooter paginationInfo={ paginationInfo } />
			</div>
		</DataViewsContext.Provider>
	);
}

function DataPickerFooter( {
	paginationInfo,
}: {
	paginationInfo: { totalItems: number; totalPages: number };
} ) {
	const { totalItems, totalPages } = paginationInfo;
	if ( ! totalItems || ! totalPages || totalPages <= 1 ) {
		return null;
	}

	return (
		<HStack expanded={ false } justify="end" className="dataviews-footer">
			{ paginationInfo.totalPages > 1 && <DataViews.Pagination /> }
		</HStack>
	);
}

function DataPickerLayout( {} ) {
	const {
		data,
		fields,
		getItemId,
		isLoading,
		view,
		onChangeView,
		selection,
		onChangeSelection,
	} = useContext( DataViewsContext );

	if ( view.type === 'picker-grid' ) {
		return (
			<DataPickerGridLayout
				data={ data }
				getItemId={ getItemId }
				fields={ fields }
				isLoading={ isLoading }
				onChangeView={ onChangeView }
				view={ view }
				selection={ selection }
				onChangeSelection={ onChangeSelection }
			/>
		);
	}

	return null;
}

type DataPickerGridLayoutProps< Item > = {
	data: ViewBaseProps< Item >[ 'data' ];
	fields: ViewBaseProps< Item >[ 'fields' ];
	getItemId: ViewBaseProps< Item >[ 'getItemId' ];
	isLoading?: boolean;
	onChangeView: ViewBaseProps< Item >[ 'onChangeView' ];
	view: View;
	selection: string[];
	onChangeSelection: SetSelection;
};

function DataPickerGridLayout< Item >( {
	data,
	fields,
	getItemId,
	isLoading,
	view,
	selection,
	onChangeSelection,
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

	return (
		hasData && (
			<Grid
				gap={ 8 }
				columns={ 2 }
				alignment="top"
				aria-busy={ isLoading }
			>
				{ data.map( ( item ) => {
					return (
						<GridItem
							key={ getItemId( item ) }
							view={ view }
							selection={ selection }
							onChangeSelection={ onChangeSelection }
							getItemId={ getItemId }
							item={ item }
							titleField={ titleField }
							mediaField={ mediaField }
							descriptionField={ descriptionField }
						/>
					);
				} ) }
			</Grid>
		)
	);
}

type GridItemProps< Item > = {
	item: Item;
	view: View;
	selection: string[];
	onChangeSelection: SetSelection;
	getItemId: ( item: Item ) => string;
	titleField: NormalizedField< Item > | undefined;
	mediaField: NormalizedField< Item > | undefined;
	descriptionField: NormalizedField< Item > | undefined;
};

function GridItem< Item >( {
	item,
	view,
	selection,
	onChangeSelection,
	getItemId,
	titleField,
	mediaField,
	descriptionField,
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

	const id = getItemId( item );
	const isSelected = selection.includes( id );

	return (
		<VStack
			aria-selected={ isSelected }
			className={ clsx( 'dataviews-picker-grid__card', {
				'is-selected': isSelected,
			} ) }
			onClick={ () => {
				onChangeSelection(
					isSelected
						? selection.filter( ( itemId ) => id !== itemId )
						: [ ...selection, id ]
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
			<div className="dataviews-picker-grid__description-field">
				{ renderedDescriptionField }
			</div>
		</VStack>
	);
}
